import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

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

        // Attempt to delete from Supabase storage first
        try {
            // Extract file path from publicUrl
            // URL format: https://[URL]/storage/v1/object/public/[bucket]/[filePath]
            const urlParts = file.url.split('/public/');
            if (urlParts.length > 1) {
                const pathAndFile = urlParts[1];
                // Path starts with bucket name "topic/", so we strip it out
                const path = pathAndFile.replace('topic/', '');

                await supabase.storage.from('topic').remove([path]);
            }
        } catch (storageError) {
            console.error("Failed to delete from Supabase, but continuing DB cascade.", storageError);
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
