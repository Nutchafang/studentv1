import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        student_id: true,
        student_name: true,
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
