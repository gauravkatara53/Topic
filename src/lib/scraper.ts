import puppeteer from "puppeteer";
import { prisma } from "./prisma";

// Basic in-memory cache to prevent abusive scraping
// Key: userId, Value: timestamp of last successful scrape
const scrapeCache = new Map<string, number>();
const CACHE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export async function scrapeAttendance(userId: string, collegeId: string, collegePassword: string) {
    const lastScraped = scrapeCache.get(userId);
    const now = Date.now();

    // 15 minute cooldown removed per user request

    console.log(`[Scraper] Starting Puppeteer for user: ${userId}`);

    let browser;
    try {
        const launchOptions = {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        };

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        console.log("[Scraper] Navigating to Login.aspx");
        await page.goto("https://online.nitjsr.ac.in/endsem/Login.aspx", {
            waitUntil: "networkidle2",
        });

        console.log("[Scraper] Filling login form");
        await page.waitForSelector("#txtuser_id", { timeout: 10000 });
        await page.type("#txtuser_id", collegeId);

        await page.waitForSelector("#txtpassword", { timeout: 10000 });
        await page.type("#txtpassword", collegePassword);

        console.log("[Scraper] Submitting login");
        await Promise.all([
            page.click("#btnsubmit"),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);

        const currentUrl = page.url();
        console.log("[Scraper] Current URL after login:", currentUrl);
        if (currentUrl.includes("Login.aspx")) {
            throw new Error("INVALID_CREDENTIALS");
        }

        console.log("[Scraper] Navigating to ClassAttendance.aspx");
        await page.goto(
            "https://online.nitjsr.ac.in/endsem/StudentAttendance/ClassAttendance.aspx",
            { waitUntil: "networkidle2" }
        );

        console.log("[Scraper] Waiting for attendance table");
        await page.waitForSelector("#ContentPlaceHolder1_gv", { timeout: 10000 });

        console.log("[Scraper] Extracting table data");
        // We expect the table headers to be something like: [SNo, Subject, Total Classes, Attended Classes, Percentage]
        const rawTableData = await page.$$eval("#ContentPlaceHolder1_gv tr", (rows) =>
            rows.slice(1).map((row) => { // Skip header row
                const cells = Array.from(row.querySelectorAll("td")).map((cell) => cell.innerText.trim());
                return cells;
            })
        );

        console.log(`[Scraper] Scraped ${rawTableData.length} rows.`);

        // Parse to AttendanceRecord structure
        const parsedData = rawTableData.map(row => {
            // Actual NIT JSR portal structure:
            // 0: Sl#, 1: Subject Code, 2: Subject name, 3: Faculty Name, 4: Present/Total Class, 5: Attendance %, 6: Feedback

            const subject = row[2] || "Unknown Subject";

            // row[4] is expected to be "Present/Total" e.g., "17/18"
            const presentTotalStr = row[4] || "0/0";
            const parts = presentTotalStr.split("/");

            const attended = parseInt(parts[0] || "0", 10);
            const total = parseInt(parts[1] || "0", 10);

            const percentage = parseFloat(row[5] || "0");

            return {
                userId,
                subject,
                total: isNaN(total) ? 0 : total,
                attended: isNaN(attended) ? 0 : attended,
                percentage: isNaN(percentage) ? 0 : percentage,
            };
        });

        // Store into MongoDB natively
        if (parsedData.length > 0) {
            await prisma.$transaction([
                prisma.attendanceRecord.deleteMany({ where: { userId } }),
                prisma.attendanceRecord.createMany({ data: parsedData })
            ]);
        }

        // Update cache on success
        scrapeCache.set(userId, Date.now());

        return parsedData;

    } catch (error: any) {
        console.error("[Scraper] Failed:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
