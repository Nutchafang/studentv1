"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Upload, Users, BarChart3, Bell, Video } from "lucide-react"
import { fetcher } from "@/utils/fetcher"

// URL Flask API
const API_BASE_URL = "http://127.0.0.1:5000"

export default function TeacherDashboard() {
  // สถานะโหลดและข้อมูล dashboard รวม
  const [dashboardData, setDashboardData] = useState({
    totalVideos: 0,
    totalStudents: 0,
    avgAttention: 0,
    newNotifications: 0,
  })

  // รายชื่อนักเรียน
  const [students, setStudents] = useState<any[]>([])
  // โหลดสถานะ
  const [loading, setLoading] = useState(true)

  // ใช้ SWR ดึงข้อมูลวิดีโอจาก Flask API
  const { data: videoData, error: videoError } = useSWR(
    `${API_BASE_URL}/api/videos`,
    fetcher
  )

  // ดึงข้อมูล dashboard และ students จาก Next.js API (หรือ backend ของคุณ)
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch("/api/dashboard/teacher")
        const dash = await res.json()
        setDashboardData(dash)

        const studentsRes = await fetch("/api/students")
        const studentData = await studentsRes.json()
        setStudents(studentData.students || [])
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="p-4 text-gray-600">กำลังโหลดข้อมูล...</p>
  if (videoError) return <p className="p-4 text-red-600">โหลดวิดีโอไม่สำเร็จ</p>

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">แดชบอร์ดอาจารย์</h2>

      {/* สถิติโดยรวม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="วิดีโอทั้งหมด"
          value={dashboardData.totalVideos}
          icon={<Upload className="w-8 h-8 text-blue-600" />}
        />
        <StatCard
          title="นักเรียนทั้งหมด"
          value={dashboardData.totalStudents}
          icon={<Users className="w-8 h-8 text-green-600" />}
        />
        <StatCard
          title="ความสนใจเฉลี่ย"
          value={`${dashboardData.avgAttention}%`}
          icon={<BarChart3 className="w-8 h-8 text-yellow-600" />}
        />
        <StatCard
          title="แจ้งเตือนใหม่"
          value={dashboardData.newNotifications}
          icon={<Bell className="w-8 h-8 text-red-600" />}
        />
      </div>

      {/* รายชื่อนักเรียน */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อนักเรียน</CardTitle>
          <CardDescription>แสดงรายชื่อนักเรียนทั้งหมดจากระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 max-h-96 overflow-auto">
            {students.map((student, index) => (
              <li key={index} className="p-2 rounded bg-gray-50 border text-sm">
                👤 {student.student_name} ({student.student_id})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* วิดีโอที่อัปโหลดจาก Flask API */}
      <Card>
        <CardHeader>
          <CardTitle>วิดีโอที่อัปโหลด</CardTitle>
          <CardDescription>จัดการวิดีโอและดูผลวิเคราะห์</CardDescription>
        </CardHeader>
        <CardContent>
          {!videoData ? (
            <p>กำลังโหลดข้อมูลวิดีโอ...</p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-auto">
              {videoData.videos.map((video: any) => (
                <li key={video.name} className="bg-white p-4 rounded shadow">
                  🎞 <b>{video.name}</b> - สถานะ: <b>{video.status}</b> <br />
                  ▶️{" "}
                  <a
                    href={`${API_BASE_URL}/processed/analyzed_${video.name}`}
                    target="_blank"
                    className="text-blue-500"
                    rel="noreferrer"
                  >
                    ดูวิดีโอ
                  </a>{" "}
                  | 📊{" "}
                  <a
                    href={`${API_BASE_URL}/static/charts/analysis_${video.name}.png`}
                    target="_blank"
                    className="text-blue-500"
                    rel="noreferrer"
                  >
                    ดูกราฟ
                  </a>{" "}
                  | 🔍{" "}
                  <Link href={`/results/${video.name}`} className="text-blue-500">
                    ผลวิเคราะห์
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <Link href="/upload" className="text-green-600 underline">
              📤 ไปหน้าอัปโหลดวิดีโอ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Card ย่อยสำหรับสถิติ
function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  )
}
