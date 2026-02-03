"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default function HomePage() {
  const [userType, setUserType] = useState<"teacher" | "student" | null>(null)

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Eye className="mx-auto w-12 h-12 text-blue-600" />
            <CardTitle className="text-2xl">ระบบติดตามความสนใจนักเรียน</CardTitle>
            <CardDescription>ระบบวิเคราะห์พฤติกรรมในคลิปวิดีโอเรียนออนไลน์</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => setUserType("teacher")}>เข้าสู่ระบบในฐานะอาจารย์</Button>
            <Button variant="outline" className="w-full" onClick={() => setUserType("student")}>เข้าสู่ระบบในฐานะนักเรียน</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // เมื่อเลือก userType แล้วไปที่ Dashboard
  return (
    <div>
      <DashboardPage userType={userType} onLogout={() => setUserType(null)} />
    </div>
  )
}

// import DashboardPage แบบ dynamic เพื่อแยกโค้ด
import dynamic from "next/dynamic"
const DashboardPage = dynamic(() => import("./dashboard/page"), { ssr: false })
