import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    },
});

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await context.params;

        const file = await prisma.file.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        if (file.uploaderId !== userId) {
            return NextResponse.json({ error: "Forbidden - You can only delete your own files" }, { status: 403 });
        }

        // Attempt to delete from Cloudflare R2 storage first
        try {
            const domain = process.env.CLOUDFLARE_PUBLIC_DOMAIN || "";
            let path = "";

            if (domain && file.url.startsWith(domain)) {
                // New R2 URL format
                path = file.url.replace(`${domain}/`, '');
            } else if (file.url.includes('/public/topic/')) {
                // Legacy Supabase URL format
                const urlParts = file.url.split('/public/topic/');
                if (urlParts.length > 1) {
                    path = urlParts[1];
                }
            } else {
                // Try just getting the last part or generic parsing
                const url = new URL(file.url);
                path = url.pathname.substring(1); // remove leading slash
            }

            if (path) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
                    Key: path,
                }));
            }
        } catch (storageError) {
            console.error("Failed to delete from R2, but continuing DB cascade.", storageError);
        }

        // Delete record from DB
        await prisma.file.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "File deleted successfully" });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const { subject, branch, semester, type } = body;

        const file = await prisma.file.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        if (file.uploaderId !== userId) {
            return NextResponse.json({ error: "Forbidden - You can only edit your own files" }, { status: 403 });
        }

        // Update metadata
        const updatedFile = await prisma.file.update({
            where: { id },
            data: {
                subject: subject || file.subject,
                branch: branch || file.branch,
                semester: semester ? parseInt(semester) : file.semester,
                type: type || file.type,
            },
        });

        return NextResponse.json(updatedFile);
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update file parameters" }, { status: 500 });
    }
}
