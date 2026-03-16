import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Find all files
        const allFiles = await prisma.file.findMany();

        // Find files with missing uploaders by checking if the user exists
        let deletedCount = 0;

        for (const file of allFiles) {
            if (file.uploaderId) {
                const user = await prisma.user.findUnique({
                    where: { id: file.uploaderId }
                });

                // If the user doesn't exist, delete the orphaned file
                if (!user) {
                    await prisma.file.delete({
                        where: { id: file.id }
                    });
                    deletedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deletedCount} orphaned files.`
        });
    } catch (error: any) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
