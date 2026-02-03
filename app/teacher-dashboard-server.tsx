"use client"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Upload, Users, BarChart3, Bell } from "lucide-react"

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalVideos: 0,
    totalStudents: 0,
    avgAttention: 0,
    newNotifications: 0,
  })
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // ดึงข้อมูลรวมแดชบอร์ดอาจารย์
        const res = await fetch("/api/dashboard/teacher")
        const dash = await res.json()
        setDashboardData(dash)

        // ดึงรายชื่อนักเรียน
        const studentsRes = await fetch("/api/students") // หรือใช้ /api/test-db ก็ได้
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
          <CardDescription>
            แสดงรายชื่อนักเรียนทั้งหมดจากระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 max-h-96 overflow-auto">
            {students.map((student, index) => (
              <li
                key={index}
                className="p-2 rounded bg-gray-50 border text-sm"
              >
                👤 {student.student_name} ({student.student_id})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// ✅ Card ย่อยสำหรับสถิติ
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
