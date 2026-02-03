"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, BarChart3, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentDashboard() {
  const studentId = "S001" // ปกติจะมาจากระบบ Auth จริง
  const [data, setData] = useState({
    videosWatched: 0,
    totalVideos: 0,
    avgAttention: 0,
    notificationsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/dashboard/student?studentId=${studentId}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("โหลดข้อมูลล้มเหลว", error)
      }
      setLoading(false)
    }
    fetchData()
  }, [studentId])

  if (loading) return <p>กำลังโหลดข้อมูล...</p>

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">แดชบอร์ดนักเรียน</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="วิดีโอที่ดู" value={`${data.videosWatched}/${data.totalVideos}`} icon={<Eye className="w-8 h-8 text-blue-600" />} />
        <StatCard title="ความสนใจเฉลี่ย" value={`${data.avgAttention}%`} icon={<BarChart3 className="w-8 h-8 text-green-600" />} />
        <StatCard title="การแจ้งเตือน" value={data.notificationsCount} icon={<Bell className="w-8 h-8 text-yellow-600" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ผลการวิเคราะห์ล่าสุด</CardTitle>
          <CardDescription>ดูผลการวิเคราะห์ความสนใจของคุณในวิดีโอเรียนล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/student-report">
            <Button className="w-full" size="lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              ดูรายงานของฉัน
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

// StatCard Component (ถ้าอยากแยกไฟล์ ก็ย้ายออกไปได้)
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  )
}
