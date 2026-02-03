import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

// สร้าง Prisma Client instance (แนะนำให้สร้างแยกไฟล์แล้ว import เพื่อ reuse ในโปรเจกต์จริง)
const prisma = new PrismaClient()

// ฟังก์ชัน API GET สำหรับดึงข้อมูล students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        student_id: true,
        student_name: true,
      },
    })

    return NextResponse.json({ students }) // ส่ง JSON response กลับ
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
