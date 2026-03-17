import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const clerkUser = await currentUser();
        if (clerkUser) {
            await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: {
                    id: userId,
                    name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : "Student",
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                }
            });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const branch = formData.get("branch") as string;
        const semester = parseInt(formData.get("semester") as string);
        const subject = formData.get("subject") as string;
        const type = formData.get("type") as string;

        if (!file || !branch || !semester || !subject || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique file name
        const timestamp = new Date().getTime();
        const uniqueFileName = `${userId}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `campushub/${type.toLowerCase()}s/${uniqueFileName}`;

        // Upload to Cloudflare R2
        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
                Key: filePath,
                Body: buffer,
                ContentType: file.type,
            }));
        } catch (uploadError: any) {
            console.error("Cloudflare R2 upload error:", uploadError);
            throw new Error(`Cloudflare R2 upload failed: ${uploadError.message}`);
        }

        // Get the public URL for the uploaded file
        const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${filePath}`;

        // Save metadata to DB
        const newDbFile = await prisma.file.create({
            data: {
                uploaderId: userId,
                branch,
                semester,
                subject,
                type,
                url: publicUrl,
            },
        });

        return NextResponse.json(newDbFile, { status: 201 });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: `File upload failed: ${error.message}` }, { status: 500 });
    }
}
