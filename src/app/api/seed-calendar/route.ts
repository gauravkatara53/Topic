import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const rawEvents = [
    {
        date: new Date(2024, 4, 25),
        title: "Summer Training/ Summer Break (Except M.Tech, PhD)",
        description: "25.05.2024 to 23.07.2024 (Saturday-Tuesday)",
    },
    {
        date: new Date(2024, 4, 25),
        title: "Summer Vacation for Regular Faculty",
        description: "25.05.2024 to 23.07.2024 (Saturday-Tuesday)",
    },
    {
        date: new Date(2024, 4, 30),
        title: "Online Registration for Spring Semester Supplementary Examinations",
        description: "30.05.2024 to 31.05.2024 (Thursday - Friday)",
    },
    {
        date: new Date(2024, 5, 4),
        title: "Supplementary Examinations for Spring Semester",
        description: "04.06.2024 to 10.06.2024 (Tuesday - Monday)",
    },
    {
        date: new Date(2024, 5, 10),
        title:
            "Last date for Completion and Evaluation of M.Tech Thesis for 4th Sem",
        description: "10.06.2024 (Monday)",
    },
    {
        date: new Date(2024, 5, 14),
        title:
            "Last date of Submission of Grades/marks in Samarth for Spring Semester Supplementary Examinations and M.Tech Thesis for 4th Sem",
        description: "14.06.2024 (Friday)",
    },
    {
        date: new Date(2024, 5, 17),
        title:
            "DAC meeting for Spring Semester Supplementary Examinations and M.Tech Thesis for 4th Sem",
        description: "17.06.2024 (Monday)",
    },
    {
        date: new Date(2024, 5, 18),
        title:
            "PGPEC meeting and publications of results for Spring Semester Supplementary Examinations and M.Tech Thesis for 4th Sem",
        description: "18.06.2024 (Tuesday)",
    },
    {
        date: new Date(2024, 6, 8),
        title: "Autumn Semester Fee Payment of all Programs",
        description: "08.07.2024 to 15.07.2024 (Without Late Fee)",
    },
    {
        date: new Date(2024, 6, 16),
        title: "Autumn Semester Fee Payment of all Programs",
        description: "16.07.2024 to 22.07.2024 (With Late Fee)",
    },
    {
        date: new Date(2024, 6, 24),
        title: "Registration for Autumn Semester of all Programs",
        description: "24.07.2024 to 26.07.2024 (Wednesday-Friday)",
    },
    {
        date: new Date(2024, 6, 29),
        title: "Commencement of all classes for Autumn Semester",
        description: "29.07.2024 (Monday)",
    },
    {
        date: new Date(2024, 7, 15),
        title: "Independence Day (Holiday)",
        description: "15.08.2024 (Thursday)",
    },
    {
        date: new Date(2024, 8, 16),
        title: "Birth of Prophet Mohammad (Id-e-Milad) (Holiday)",
        description: "16.09.2024 (Monday)",
    },
    {
        date: new Date(2024, 8, 20),
        title: "Class Attendance First Report",
        description: "20.09.2024 (Friday)",
    },
    {
        date: new Date(2024, 8, 23),
        title: "Review of Class Attendance First Report by DUGC & PUGC",
        description: "23.09.2024 (Monday)",
    },
    {
        date: new Date(2024, 8, 30),
        title: "Mid Semester Examination for All Programs",
        description: "30.09.2024 to 08.10.2024 (Monday – Tuesday)",
    },
    {
        date: new Date(2024, 9, 2),
        title: "Mahatma Gandhi Jayanti (Holiday)",
        description: "02.10.2024 (Wednesday)",
    },
    {
        date: new Date(2024, 9, 12),
        title: "Dussehra (Vijaya Dashmi) (Holiday)",
        description: "12.10.2024 (Saturday)",
    },
    {
        date: new Date(2024, 9, 24),
        title:
            "Showing Answer Books to the Students & the Last Date to Enter Mid-Sem Marks in SAMARTH/MIS Portal",
        description: "24.10.2024 (Thursday)",
    },
    {
        date: new Date(2024, 9, 25),
        title: "Annual Sports Meet (URJA) No Class Work",
        description: "25.10.2024 to 27.10.2024 (Friday-Sunday)",
    },
    {
        date: new Date(2024, 9, 28),
        title: "Mid Semester Break (All Messes Remain Closed)",
        description: "28.10.2024 to 10.11.2024 (Friday-Sunday)",
    },
    {
        date: new Date(2024, 9, 31),
        title: "Diwali (Holiday)",
        description: "31.10.2024 (Thursday)",
    },
    {
        date: new Date(2024, 10, 7),
        title: "Chhath Puja (Holiday)",
        description: "07.11.2024 (Thursday)",
    },
    {
        date: new Date(2024, 10, 15),
        title: "Guru Nanak’s Birthday (Holiday)",
        description: "15.11.2024 (Friday)",
    },
    {
        date: new Date(2024, 10, 29),
        title:
            "Last date of Theory and Practical Class work & Completion of all Project Presentations/Practical’s/Viva-Voce and other Internal Assessments",
        description: "29.11.2024 (Friday)",
    },
    {
        date: new Date(2024, 10, 29),
        title: "Display of Pre-End Semester Marks in the Departmental Notice Board",
        description: "29.11.2024 (Friday)",
    },
    {
        date: new Date(2024, 11, 2),
        title: "Class Attendance Second Report",
        description: "02.12.2024 (Monday)",
    },
    {
        date: new Date(2024, 11, 3),
        title: "Review of Class Attendance Second Report by DUGC & PUGC",
        description: "03.12.2024 (Tuesday)",
    },
    {
        date: new Date(2024, 11, 4),
        title:
            "Announcement of Eligibility List of Students for End Semester Examinations",
        description: "04.12.2024 (Wednesday)",
    },
    {
        date: new Date(2024, 11, 6),
        title: "End Semester Examinations for All Programs",
        description: "06.12.2024 to 14.12.2024 (Friday-Saturday)",
    },
    {
        date: new Date(2024, 11, 15),
        title: "Winter Break for Students (All Messes Remain Closed)",
        description: "15.12.2024 to 05.01.2025 (Sunday - Sunday)",
    },
    {
        date: new Date(2024, 11, 19),
        title: "Last Date of Submission of Grades/Marks in Samarth/MIS",
        description: "19.12.2024 (Thursday)",
    },
    {
        date: new Date(2024, 11, 20),
        title: "DAC Meeting of Autumn Semester Examinations",
        description: "20.12.2024 (Friday)",
    },
    {
        date: new Date(2024, 11, 23),
        title:
            "UGPEC, PGPEC, RPEC Meeting and Publications of Autumn Semester Results",
        description: "23.12.2024 (Monday)",
    },
    {
        date: new Date(2024, 11, 21),
        title: "Winter Vacation for Faculty Members",
        description: "21-12-2024 (Saturday) to 05-01-2025 (Sunday)",
    },
    {
        date: new Date(2024, 11, 25),
        title: "Christmas Day (Holiday)",
        description: "25.12.2024 (Wednesday)",
    },
    {
        date: new Date(2024, 11, 28),
        title: "Spring Semester Fee Payment of All Programs",
        description: "28.12.2024 to 03.01.2025 (Without Late Fee)",
    },
    {
        date: new Date(2025, 0, 4),
        title: "Spring Semester Fee Payment of All Programs",
        description: "04.01.2025 to 07.01.2025 (With Late Fee)",
    },
    {
        date: new Date(2024, 11, 26),
        title:
            "Autumn Semester Supplementary Examinations Fee Payment & Online Registration",
        description: "26.12.2024 to 27.12.2024 (Thursday - Friday)",
    },
    {
        date: new Date(2024, 11, 30),
        title: "Supplementary Examinations for Autumn Semester",
        description: "30.12.2024 to 03.01.2025 (Monday - Friday)",
    },
    {
        date: new Date(2025, 0, 6),
        title:
            "DAC Meeting of Autumn Semester Supplementary Examinations & UGPEC, PGPEC, Meeting and Publications of Autumn Semester Supplementary Results",
        description: "06.01.2025 (Monday)",
    },
    {
        date: new Date(2025, 0, 7),
        title:
            "Spring Semester Registration through Biometric System by Physical Reporting (All Programs)",
        description: "07.01.2025 to 08.01.2025 (Tuesday - Wednesday)",
    },
    {
        date: new Date(2025, 0, 9),
        title: "Commencement of All Classes for Spring Semester",
        description: "09.01.2025 (Thursday)",
    },
    {
        date: new Date(2025, 0, 17),
        title: "CULFEST 2025 (No Classwork on 17.01.2025)",
        description: "17.01.2025 to 19.01.2025 (Friday-Sunday)",
    },
    {
        date: new Date(2025, 0, 24),
        title: "Annual Alumni Meet",
        description: "24.01.2025 to 25.01.2025 (Friday-Saturday)",
    },
    {
        date: new Date(2025, 0, 26),
        title: "Republic Day",
        description: "26.01.2025 (Sunday)",
    },
    {
        date: new Date(2025, 1, 28),
        title: "OJASS 2025 (Technical Fest) (No Classwork on 28.02.2025)",
        description: "28.02.2025 to 02.03.2025 (Friday-Sunday)",
    },
    {
        date: new Date(2025, 2, 3),
        title: "Class Attendance First Report",
        description: "03.03.2025 (Monday)",
    },
    {
        date: new Date(2025, 2, 4),
        title: "Review of Class Attendance First Report by DUGC & PUGC",
        description: "04.03.2025 (Tuesday)",
    },
    {
        date: new Date(2025, 2, 4),
        title:
            "Mid Semester Examination for All Programs & Last Date of Mid Semester Presentations and Evaluation of Project Works for all Programmes",
        description: "04.03.2025 to 11.03.2025 (Tuesday-Tuesday)",
    },
    {
        date: new Date(2025, 2, 12),
        title: "Mid Semester Break (All messes remain closed)",
        description: "12.03.2025 to 16.03.2025 (Wednesday-Sunday)",
    },
    {
        date: new Date(2025, 2, 14),
        title: "Holi (Holiday)",
        description: "14.03.2025 (Friday)",
    },
    {
        date: new Date(2025, 2, 24),
        title:
            "Showing Answer Books to the Students & the Last Date to Enter Mid-Sem Marks in SAMARTH/MIS Portal",
        description: "24.03.2025 (Monday)",
    },
    {
        date: new Date(2025, 2, 31),
        title: "Idu’l Fitar (Holiday)",
        description: "31.03.2025 (Monday)",
    },
    {
        date: new Date(2025, 3, 6),
        title: "Ram Navami (Holiday)",
        description: "06.04.2025 (Sunday)",
    },
    {
        date: new Date(2025, 3, 10),
        title: "Mahavir Jayanti (Holiday)",
        description: "10.04.2025 (Thursday)",
    },
    {
        date: new Date(2025, 3, 18),
        title: "Good Friday (Holiday)",
        description: "18.04.2025 (Friday)",
    },
    {
        date: new Date(2025, 3, 30),
        title:
            "Last date of Theory and Practical Class Work & Completion of All Project Presentations/Practical’s/Viva-voce and other Internal Assessments",
        description: "30.04.2025 (Wednesday)",
    },
    {
        date: new Date(2025, 3, 30),
        title: "Display of Pre-End Semester Marks in the Departmental Notice Board",
        description: "30.04.2025 (Wednesday)",
    },
    {
        date: new Date(2025, 4, 1),
        title: "Class Attendance Second Report",
        description: "01.05.2025 (Thursday)",
    },
    {
        date: new Date(2025, 4, 2),
        title:
            "Review of Class Attendance Second Report by DUGC, PUGC & Announcement of Eligibility List of Students for End Semester Examinations",
        description: "02.05.2025 (Friday)",
    },
    {
        date: new Date(2025, 4, 5),
        title: "End Semester Examinations for All Programs",
        description: "05.05.2025 to 16.05.2025 (Monday-Friday)",
    },
    {
        date: new Date(2025, 4, 17),
        title:
            "Summer Break for Students (Except M.Tech, PhD) (All Messes Remain Closed)",
        description: "17.05.2025 to 21.07.2025 (Saturday-Monday)",
    },
    {
        date: new Date(2025, 4, 22),
        title: "Last Date of Submission of Grades/Marks in Samarth/MIS",
        description: "22.05.2025 (Thursday)",
    },
    {
        date: new Date(2025, 4, 23),
        title: "DAC Meeting of Spring Semester Examinations (Morning)",
        description: "23.05.2025 (Friday)",
    },
    {
        date: new Date(2025, 4, 23),
        title:
            "UGPEC, PGPEC, RPEC Meeting and Publications of Spring Semester Results (Evening)",
        description: "23.05.2025 (Friday)",
    },
    {
        date: new Date(2025, 4, 24),
        title: "Summer Vacation for Regular Faculty",
        description: "24.05.2025 to 06.07.2025 (Saturday-Sunday)",
    },
    {
        date: new Date(2025, 5, 15),
        title:
            "Last Date for Completion and Evaluation of M.Tech Thesis for 4th Sem",
        description: "15.06.2025 (Sunday)",
    },
    {
        date: new Date(2025, 5, 17),
        title:
            "PGPEC Meeting and Publications of Spring Semester Results for M.Tech. 4th Sem only",
        description: "17.06.2025 (Tuesday)",
    },
    {
        date: new Date(2025, 5, 23),
        title: "Registration for Spring Semester Supplementary Examinations",
        description: "23.06.2025 to 25.06.2025 (Monday-Wednesday)",
    },
    {
        date: new Date(2025, 5, 27),
        title: "Supplementary Examinations for Spring Semester",
        description: "27.06.2025 to 02.07.2025 (Friday-Wednesday)",
    },
    {
        date: new Date(2025, 6, 4),
        title: "Last Date of Submission of Grades/Marks in Samarth/MIS",
        description: "04.07.2025 (Friday)",
    },
    {
        date: new Date(2025, 6, 7),
        title:
            "DAC Meeting of Spring Semester Supplementary Examinations (Morning)",
        description: "07.07.2025 (Monday)",
    },
    {
        date: new Date(2025, 6, 7),
        title:
            "UGPEC and PGPEC, Meeting and Publications of Spring Semester Supplementary Examinations (Evening)",
        description: "07.07.2025 (Monday)",
    },
    {
        date: new Date(2025, 6, 8),
        title: "Autumn Semester (AY 2025-2026) Fee Payment for All Programs",
        description: "08.07.2025 to 15.07.2025 (Without Late Fee)",
    },
    {
        date: new Date(2025, 6, 16),
        title:
            "Autumn Semester (AY 2025-2026) Fee Payment for All Programs (With Late Fee)",
        description: "16.07.2025 to 23.07.2025",
    },
    {
        date: new Date(2025, 6, 23),
        title:
            "Autumn Semester Registration through Biometric System by Physical Reporting for (AY 2025-2026) of all Programs",
        description: "23.07.2025 to 25.07.2025 (Wednesday-Friday)",
    },
    {
        date: new Date(2025, 6, 28),
        title:
            "Commencement of Classes for Autumn Semester (AY: 2025-2026) for all UG, PG, PTPG & PhD Except 1st Sem of All Courses",
        description: "28.07.2025 (Monday)",
    },
    {
        date: new Date(2025, 6, 8),
        title:
            "Fee Payment for All Programs of UG, PG, PTPG & PhD Except 1st Sem of All Courses (Without Late Fee)",
        description: "08.07.2025 to 15.07.2025",
    },
    {
        date: new Date(2025, 6, 16),
        title:
            "Fee Payment for All Programs of UG, PG, PTPG & PhD Except 1st Sem of All Courses (With Late Fee)",
        description: "16.07.2025 to 23.07.2025",
    },
    {
        date: new Date(2025, 6, 23),
        title:
            "Registration through Biometric System for All Programs of UG, PG, PTPG & PhD Except 1st Sem of All Courses",
        description: "23.07.2025 to 25.07.2025 (Wednesday - Friday)",
    },
    {
        date: new Date(2025, 7, 15),
        title: "Independence Day (Holiday) / Janmashtami (Saturday)",
        description: "15.08.2025 (Friday)",
    },
    {
        date: new Date(2025, 8, 5),
        title: "Birth Day of Prophet Mohammad (Id-e-Milad) (Holiday)",
        description: "05.09.2025 (Friday)",
    },
    {
        date: new Date(2025, 8, 15),
        title: "Class Attendance First Report",
        description: "15.09.2025 (Monday)",
    },
    {
        date: new Date(2025, 8, 16),
        title: "Review of Class Attendance First Report by DUCC & PUGC",
        description: "16.09.2025 (Tuesday)",
    },
    {
        date: new Date(2025, 8, 17),
        title:
            "Mid Semester Examination & Evaluation of Project Works for all Programs",
        description: "17.09.2025 to 27.09.2025 (Wednesday - Saturday)",
    },
    {
        date: new Date(2025, 9, 1),
        title: "Dussehra (Mahanavmi) (Holiday)",
        description: "01.10.2025 (Wednesday)",
    },
    {
        date: new Date(2025, 9, 2),
        title: "Mahatma Gandhi Jayanti / Vijaya Dashmi (Holiday)",
        description: "02.10.2025 (Thursday)",
    },
    {
        date: new Date(2025, 9, 13),
        title: "Annual Sports Meet",
        description: "13.10.2025 (Monday)",
    },
    {
        date: new Date(2025, 9, 12),
        title: "Mid Semester Break (All Messes Remain Closed)",
        description: "20.10.2025 to 29.10.2025 (Monday to Wednesday)",
    },
    {
        date: new Date(2025, 9, 20),
        title: "Diwali (Holiday)",
        description: "20.10.2025 (Monday)",
    },
    {
        date: new Date(2025, 9, 28),
        title: "Chhath Puja (Holiday)",
        description: "28.10.2025 (Tuesday)",
    },
    {
        date: new Date(2025, 10, 5),
        title: "Guru Nanak’s Birthday (Holiday)",
        description: "05.11.2025 (Wednesday)",
    },
    {
        date: new Date(2025, 10, 12),
        title:
            "Completion of All Project Presentations/Practicals/Viva-Voce/Internal Assessments",
        description: "12.11.2025 (Wednesday)",
    },
    {
        date: new Date(2025, 10, 13),
        title: "Class Attendance Second Report",
        description: "13.11.2025 (Thursday)",
    },
    {
        date: new Date(2025, 10, 14),
        title:
            "Display of Pre-End Semester Marks & Eligibility List for End Semester Exams",
        description: "14.11.2025 (Friday)",
    },
    {
        date: new Date(2025, 10, 18),
        title: "End Semester Examinations for All Programs",
        description: "18.11.2025 to 03.12.2025 (Tuesday - Wednesday)",
    },
    {
        date: new Date(2025, 11, 4),
        title:
            "Winter Break for Students (Except M.Tech & PhD) (All Messes Remain Closed)",
        description: "04.12.2025 to 20.12.2025 (Thursday - Tuesday)",
    },
    {
        date: new Date(2025, 11, 9),
        title: "Last Date of Submission of Grades/Marks in MIS/SAMARTH",
        description: "09.12.2025 (Tuesday)",
    },
    {
        date: new Date(2025, 11, 11),
        title: "DAC Meeting of Autumn Semester (AY: 2025-2026) Examinations",
        description: "11.12.2025 (Thursday) upto 12:00 Noon",
    },
    {
        date: new Date(2025, 11, 11),
        title:
            "UGPEC, PPGEC & RPPEC Meeting and Publications of Autumn Semester (AY: 2025-2026) Results",
        description: "11.12.2025 (Thursday) at 03:00 PM onwards",
    },
    {
        date: new Date(2025, 11, 15),
        title: "Winter Vacation for Faculty Members",
        description: "15.12.2025 to 28.12.2025 (Monday-Sunday)",
    },
    {
        date: new Date(2025, 11, 25),
        title: "Christmas Day (Holiday)",
        description: "25.12.2025 (Thursday)",
    },
    {
        date: new Date(2025, 11, 22),
        title: "Fee Payment for Spring Semester (AY: 2025-2026) (Without Late Fee)",
        description: "22.12.2025 to 28.12.2025",
    },
    {
        date: new Date(2025, 11, 29),
        title: "Fee Payment for Spring Semester (AY: 2025-2026) (With Late Fee)",
        description: "29.12.2025 to 31.12.2025",
    },
    {
        date: new Date(2025, 11, 31),
        title: "Spring Semester Registration through Biometric System",
        description: "31.12.2025 to 02.01.2026 (Wednesday - Friday)",
    },
    {
        date: new Date(2026, 0, 5),
        title: "DAC Meeting & Supplementary Exams Result Publication",
        description: "05.01.2026 (Monday)",
    },
    {
        date: new Date(2026, 0, 5),
        title:
            "Commencement of Classes for Spring Semester (AY: 2025-2026) for all UG, PG, PTPG & PhD",
        description: "05.01.2026 (Monday)",
    },
    {
        date: new Date(2025, 11, 22),
        title:
            "Spring Semester (AY: 2025-2026) Fee Payment for All Programs of UG, PG, PTPG & PhD (Without Late Fee)",
        description: "22.12.2025 to 28.12.2025",
    },
    {
        date: new Date(2025, 11, 29),
        title:
            "Spring Semester (AY: 2025-2026) Fee Payment for All Programs of UG, PG, PTPG & PhD (With Late Fee)",
        description: "29.12.2025 to 31.12.2025",
    },
    {
        date: new Date(2026, 0, 5),
        title: "Spring Semester (AY: 2025-2026) Begins",
        description: "05.01.2026 (Monday)",
    },
    {
        date: new Date(2025, 11, 31),
        title:
            "Registration through Biometric System for Spring Semester (AY: 2025-2026)",
        description: "31.12.2025 to 02.01.2026 (Wednesday - Friday)",
    },
    {
        date: new Date(2026, 0, 5),
        title:
            "Commencement of Classes for Spring Semester (AY: 2025-2026) for all UG, PG, PTPG & PhD",
        description: "05.01.2026 (Monday)",
    },
    {
        date: new Date(2026, 0, 24),
        title: "Annual Alumni Meet – 2026",
        description: "24.01.2026 to 25.01.2026 (Saturday - Sunday)",
    },
    {
        date: new Date(2026, 0, 26),
        title: "Republic Day (Holiday)",
        description: "26.01.2026 (Monday)",
    },
    {
        date: new Date(2026, 1, 19),
        title: "CULFEST-2025 & OJASS-2025 (Technical Fest)",
        description: "19.02.2026 to 22.02.2026 (Thursday - Sunday)",
    },
    {
        date: new Date(2026, 2, 4),
        title: "Holi (Holiday)",
        description: "04.03.2026 (Wednesday)",
    },
    {
        date: new Date(2026, 2, 5),
        title: "Class Attendance First Report",
        description: "05.03.2026 (Thursday)",
    },
    {
        date: new Date(2026, 2, 6),
        title: "Review of Class Attendance First Report by DUCC & PUGC",
        description: "06.03.2026 (Friday)",
    },
    {
        date: new Date(2026, 2, 7),
        title: "Mid Semester Exam (Spring, AY: 2025-2026) & Project Evaluations",
        description: "07.03.2026 to 19.03.2026 (Saturday - Thursday)",
    },
    {
        date: new Date(2026, 2, 21),
        title: "Mid Semester Break Except M.Tech & PhD (All Messes Remain Closed)",
        description: "21.03.2026 to 27.03.2026 (Saturday - Friday)",
    },
    {
        date: new Date(2026, 2, 21),
        title: "Make-up Mid Semester Exams (for prior-approved students)",
        description: "21.03.2026 to 27.03.2026 (Saturday - Friday)",
    },
    {
        date: new Date(2026, 2, 21),
        title: "Ramzan Id/Eid-ul-Fitr (Holiday)",
        description: "21.03.2026 (Saturday)",
    },
    {
        date: new Date(2026, 2, 30),
        title: "Showing Answer Books & Entry of Mid-Sem Marks in SAMARTH/MIS",
        description: "30.03.2026 (Monday)",
    },
    {
        date: new Date(2026, 3, 3),
        title: "Good Friday (Holiday)",
        description: "03.04.2026 (Friday)",
    },
    {
        date: new Date(2026, 3, 23),
        title:
            "Last Date of Theory and Practical Class work & Completion of Internal Assessments",
        description: "23.04.2026 (Thursday)",
    },
    {
        date: new Date(2026, 3, 24),
        title: "Class Attendance Second Report",
        description: "24.04.2026 (Friday)",
    },
    {
        date: new Date(2026, 3, 27),
        title:
            "Display of Pre-End Semester Marks, Review & Eligibility Announcement",
        description: "27.04.2026 (Monday)",
    },
    {
        date: new Date(2026, 3, 30),
        title: "End Semester (Spring, AY: 2025-2026) Examinations for All Programs",
        description: "30.04.2026 to 15.05.2026 (Thursday - Friday)",
    },
    {
        date: new Date(2026, 4, 16),
        title:
            "Summer Break for Students Except M.Tech & PhD (All Messes Remain Closed)",
        description: "16.05.2026 to 12.07.2026 (Saturday - Sunday)",
    },
    {
        date: new Date(2026, 4, 22),
        title: "Last Date of Submission of Grades/Marks in MIS/SAMARTH",
        description: "22.05.2026 (Sunday)",
    },
    {
        date: new Date(2026, 4, 26),
        title: "DAC Meeting of Spring Semester (AY: 2025-2026) Examinations",
        description: "26.05.2026 (Tuesday)",
    },
    {
        date: new Date(2026, 4, 27),
        title:
            "UGPEC, PPGEC & RPPEC Meeting and Publication of Spring Semester Results",
        description: "27.05.2026 (Wednesday)",
    },
    {
        date: new Date(2026, 4, 28),
        title: "Summer Vacation for Regular Faculty",
        description: "28.05.2026 to 12.07.2026 (Thursday - Sunday)",
    },
    {
        date: new Date(2026, 4, 31),
        title:
            "Last Date for Completion and Evaluation of M.Tech Thesis for 4th Sem",
        description: "31.05.2026 (Sunday)",
    },
    {
        date: new Date(2026, 5, 2),
        title: "PPGEC Meeting and Publication of M.Tech. 4th Sem Results",
        description: "02.06.2026 (Tuesday)",
    },
    {
        date: new Date(2026, 5, 3),
        title:
            "Fee Payment & Registration for Spring Semester Supplementary Examinations",
        description: "03.06.2026 to 04.06.2026 (Wednesday - Thursday)",
    },
    {
        date: new Date(2026, 5, 10),
        title: "Supplementary Examinations for Spring Semester (AY: 2025-2026)",
        description: "10.06.2026 to 20.06.2026 (Wednesday - Saturday)",
    },
    {
        date: new Date(2026, 5, 26),
        title: "Muharram (Holiday)",
        description: "26.06.2026 (Friday)",
    },
    {
        date: new Date(2026, 5, 27),
        title:
            "Last Date of Submission of Grades/Marks in MIS/SAMARTH for Supplementary Exams",
        description: "27.06.2026 (Saturday)",
    },
    {
        date: new Date(2026, 5, 29),
        title: "DAC Meeting of Spring Semester (AY: 2025-2026) Supplementary Exams",
        description: "29.06.2026 (Monday)",
    },
    {
        date: new Date(2026, 5, 30),
        title:
            "UGPEC, PPGEC, RPPEC Meetings & Publication of Supplementary Exam Results",
        description: "30.06.2026 (Tuesday)",
    },
    {
        date: new Date(2026, 6, 2),
        title: "Fee Payment for Autumn Semester (AY: 2026-2027) Without Late Fee",
        description: "02.07.2026 to 10.07.2026",
    },
    {
        date: new Date(2026, 6, 11),
        title: "Fee Payment for Autumn Semester (AY: 2026-2027) With Late Fee",
        description: "11.07.2026 to 13.07.2026",
    },
    {
        date: new Date(2026, 6, 13),
        title: "Biometric Registration for Autumn Semester (AY: 2026-2027)",
        description: "13.07.2026 to 15.07.2026 (Monday - Wednesday)",
    },
    {
        date: new Date(2026, 6, 15),
        title:
            "Commencement of Classes for Autumn Semester (AY: 2026-2027) for all UG, PG, PTPG & PhD",
        description: "15.07.2026 (Wednesday)",
    },
];

function getEventType(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('holiday') || t.includes('vacation') || t.includes('break') || t.includes('jayanti') || t.includes('diwali') || t.includes('puja') || t.includes('day') || t.includes('id/eid') || t.includes('muharram')) {
        return 'HOLIDAY';
    }
    if (t.includes('exam') || t.includes('test') || t.includes('evaluation') || t.includes('mark') || t.includes('result') || t.includes('grades') || t.includes('thesis')) {
        return 'EXAM';
    }
    if (t.includes('class') || t.includes('attendance') || t.includes('semester')) {
        return 'ACADEMIC';
    }
    if (t.includes('meet') || t.includes('fest') || t.includes('sports')) {
        return 'EVENT';
    }
    return 'OTHER';
}

const events = rawEvents.map(e => ({
    ...e,
    type: getEventType(e.title)
}));

export async function GET() {
    try {
        await prisma.calendarEvent.deleteMany({});

        // Use createMany if supported, or loop for compatibility.
        // We'll insert one by one just to be safe with MongoDB mapping
        for (const e of events) {
            await prisma.calendarEvent.create({
                data: {
                    title: e.title,
                    description: e.description,
                    type: e.type,
                    date: new Date(e.date),
                }
            });
        }
        return NextResponse.json({ message: "Calendar seeded successfully with new events." });
    } catch (error) {
        console.error("Seed error", error);
        return NextResponse.json({ error: "Failed to seed calendar" }, { status: 500 });
    }
}
