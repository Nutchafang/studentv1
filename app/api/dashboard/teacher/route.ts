import { NextResponse } from "next/server"

export async function GET() {
  // จำลองข้อมูลสำหรับแดชบอร์ดอาจารย์
  return NextResponse.json({
    totalVideos: 15,
    totalStudents: 50,
    avgAttention: 78,
    newNotifications: 3,
  })
}
