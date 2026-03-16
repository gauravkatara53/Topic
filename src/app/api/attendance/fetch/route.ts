import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scrapeAttendance } from "@/lib/scraper";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Safely parse JSON
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            // body is empty
        }

        let { collegeId, collegePassword } = body;

        if (!collegeId || !collegePassword) {
            // Try to find in database
            const credential = await prisma.portalCredential.findUnique({
                where: { userId }
            });

            if (!credential) {
                return NextResponse.json({ error: "Missing college credentials", needCredentials: true }, { status: 400 });
            }

            collegeId = decrypt(credential.encryptedUsername);
            collegePassword = decrypt(credential.encryptedPassword);
        } else {
            // Credentials provided, save them for future use
            await prisma.portalCredential.upsert({
                where: { userId },
                update: {
                    encryptedUsername: encrypt(collegeId),
                    encryptedPassword: encrypt(collegePassword)
                },
                create: {
                    userId,
                    encryptedUsername: encrypt(collegeId),
                    encryptedPassword: encrypt(collegePassword)
                }
            });
        }

        const data = await scrapeAttendance(userId, collegeId, collegePassword);
        const serializedData = data.map((r: any) => ({
            ...r,
            scrapedAt: new Date().toISOString(), // Newly scraped, so `now` is accurate
        }));

        return NextResponse.json({ success: true, data: serializedData }, { status: 200 });
    } catch (error: any) {
        if (error.message === "RATE_LIMIT") {
            return NextResponse.json({ error: "Rate limit exceeded. Please wait 15 minutes before refreshing attendance." }, { status: 429 });
        }
        if (error.message === "INVALID_CREDENTIALS") {
            return NextResponse.json({ error: "Invalid college ID or password." }, { status: 401 });
        }

        return NextResponse.json({ error: "Internal scraper error" }, { status: 500 });
    }
}
