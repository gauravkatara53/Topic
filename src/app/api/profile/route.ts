import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("PROFILE_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { bio, cgpa, rollNumber, hostel } = body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                bio,
                cgpa: cgpa ? parseFloat(cgpa.toString()) : null,
                rollNumber: rollNumber || null,
                hostel,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("PROFILE_UPDATE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
