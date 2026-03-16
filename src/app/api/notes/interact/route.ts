import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { fileId, action, value } = await req.json();

        if (!fileId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const file = await prisma.file.findUnique({ where: { id: fileId } });
        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        if (action === "download") {
            // Increment download count
            const updatedFile = await prisma.file.update({
                where: { id: fileId },
                data: { downloads: { increment: 1 } },
            });
            return NextResponse.json(updatedFile);
        }

        if (action === "rate") {
            if (typeof value !== "number" || value < 1 || value > 5) {
                return NextResponse.json({ error: "Invalid rating value" }, { status: 400 });
            }

            // Calculate new moving average rating
            // new_average = (old_average * old_count + new_value) / (old_count + 1)
            const newCount = file.ratingCount + 1;
            const newRating = ((file.rating * file.ratingCount) + value) / newCount;

            const updatedFile = await prisma.file.update({
                where: { id: fileId },
                data: {
                    rating: newRating,
                    ratingCount: newCount
                },
            });
            return NextResponse.json(updatedFile);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Interaction error:", error);
        return NextResponse.json({ error: "Failed to process interaction" }, { status: 500 });
    }
}
