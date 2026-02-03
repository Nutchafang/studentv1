"use client"

import { useState, useTransition, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  Users,
  TrendingUp,
  TrendingDown,
  Mail,
  MessageSquare,
  Download,
  Eye,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { sendEmailNotification, sendLineNotification, getVideoAnalysisData } from "@/app/actions" // Import Server Actions
import { useSearchParams } from "next/navigation" // Import useSearchParams
import { AlertCircle } from "lucide-react" // Import AlertCircle

// ข้อมูลจำลอง (จะถูกแทนที่ด้วยข้อมูลจริงจาก DB)
const attentionDataMock = [
  { time: "0:00", attention: 85, distracted: 15 },
  { time: "2:00", attention: 78, distracted: 22 },
  { time: "4:00", attention: 82, distracted: 18 },
  { time: "6:00", attention: 65, distracted: 35 },
  { time: "8:00", attention: 70, distracted: 30 },
  { time: "10:00", attention: 88, distracted: 12 },
  { time: "12:00", attention: 75, distracted: 25 },
  { time: "14:00", attention: 80, distracted: 20 },
]

const behaviorDataMock = [
  { name: "ตั้งใจเรียน", value: 65, color: "#10B981" },
  { name: "หาว/เบื่อ", value: 15, color: "#F59E0B" },
  { name: "เล่นโทรศัพท์", value: 12, color: "#EF4444" },
  { name: "หันซ้ายขวา", value: 5, color: "#8B5CF6" },
  { name: "นอน", value: 3, color: "#6B7280" },
]

const studentDataMock = [
  { id: "S001", name: "นางสาวสมใจ ใจดี", attention: 92, status: "excellent", behaviors: ["ตั้งใจเรียน"] },
  { id: "S002", name: "นายสมชาย รักเรียน", attention: 88, status: "good", behaviors: ["ตั้งใจเรียน"] },
  { id: "S003", name: "นางสาวมาลี สนใจ", attention: 45, status: "poor", behaviors: ["เล่นโทรศัพท์", "หาว"] },
  { id: "S004", name: "นายสมศักดิ์ เหนื่อย", attention: 35, status: "poor", behaviors: ["นอน", "เบื่อ"] },
  { id: "S005", name: "นางสาวสุดา ดีใจ", attention: 78, status: "good", behaviors: ["ตั้งใจเรียน", "หันซ้ายขวา"] },
]

export default function AnalyticsPage() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("videoId") // ดึง videoId จาก URL
  const [isPendingEmail, startEmailTransition] = useTransition()
  const [isPendingLine, startLineTransition] = useTransition()

  const [videoInfo, setVideoInfo] = useState<any>(null)
  const [analysisSummary, setAnalysisSummary] = useState<any>(null)
  const [timelineData, setTimelineData] = useState<any[]>(attentionDataMock) // ใช้ mock เป็นค่าเริ่มต้น
  const [behaviorDistribution, setBehaviorDistribution] = useState<any[]>(behaviorDataMock) // ใช้ mock เป็นค่าเริ่มต้น
  const [studentsAnalysis, setStudentsAnalysis] = useState<any[]>(studentDataMock) // ใช้ mock เป็นค่าเริ่มต้น
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (videoId) {
        setLoading(true)
        const data = await getVideoAnalysisData(videoId)
        if (data) {
          setVideoInfo(data.video)
          // แปลงข้อมูล behaviors จาก JSON string เป็น object
          const behaviorsParsed = data.analysis?.behaviors || {}
          const totalBehaviors = Object.values(behaviorsParsed).reduce((sum: any, val: any) => sum + val, 0)

          const behaviorChartData = Object.entries(behaviorsParsed).map(([key, value]) => {
            let name = key
            let color = "#6B7280" // default gray
            switch (key) {
              case "attentive":
                name = "ตั้งใจเรียน"
                color = "#10B981"
                break
              case "yawning":
                name = "หาว/เบื่อ"
                color = "#F59E0B"
                break
              case "phone":
                name = "เล่นโทรศัพท์"
                color = "#EF4444"
                break
              case "looking_around":
                name = "หันซ้ายขวา"
                color = "#8B5CF6"
                break
              case "sleeping":
                name = "นอน"
                color = "#6B7280"
                break
              case "bored":
                name = "เบื่อ"
                color = "#F59E0B"
                break
            }
            return {
              name,
              value: totalBehaviors > 0 ? Math.round(((value as number) / totalBehaviors) * 100) : 0,
              color,
            }
          })
          setBehaviorDistribution(behaviorChartData)

          // สำหรับ timeline data, เราจะใช้ข้อมูลจาก behavior_timeline
          const processedTimeline = data.timeline.map((item: any) => {
            let statusName = item.status
            switch (item.status) {
              case "attentive":
                statusName = "ตั้งใจเรียน"
                break
              case "yawning":
                statusName = "หาว/เบื่อ"
                break
              case "bored":
                statusName = "เบื่อ"
                break
              case "sleeping":
                statusName = "นอน"
                break
              case "phone":
                statusName = "เล่นโทรศัพท์"
                break
              case "looking_around":
                statusName = "หันซ้ายขวา"
                break
            }
            return {
              time: formatTime(item.time),
              attention: item.status === "attentive" ? item.confidence : 100 - item.confidence, // จำลองค่าตรงข้าม
              distracted: item.status !== "attentive" ? item.confidence : 100 - item.confidence,
              rawStatus: item.status,
              confidence: item.confidence,
            }
          })
          setTimelineData(processedTimeline)

          // สำหรับ studentData, เราจะใช้ข้อมูลจาก video_analysis
          // เนื่องจากตอนนี้ getVideoAnalysisData ดึงมาแค่ของ S001, เราจะใช้ mock data ไป���่อน
          // ในระบบจริง คุณจะต้องดึงข้อมูล analysis ของนักเรียนทุกคนสำหรับ videoId นี้
          setStudentsAnalysis(studentDataMock) // ยังคงใช้ mock เพื่อแสดงผลหลายคน

          // สรุปผลการวิเคราะห์ (ใช้ข้อมูลจาก data.analysis)
          setAnalysisSummary({
            avgAttention: data.analysis?.attention_percentage || 0,
            distractedPercentage: 100 - (data.analysis?.attention_percentage || 0),
            // สามารถเพิ่ม logic สรุปจุดแข็ง/จุดอ่อนจาก behaviorsParsed ได้
          })
        } else {
          setVideoInfo(null)
          setAnalysisSummary(null)
          setTimelineData(attentionDataMock)
          setBehaviorDistribution(behaviorDataMock)
          setStudentsAnalysis(studentDataMock)
        }
        setLoading(false)
      }
    }
    fetchData()
  }, [videoId])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const studentsToNotify = studentDataMock.filter((s) => s.attention < 60).map((s) => s.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500">กำลังโหลดข้อมูลการวิเคราะห์...</p>
      </div>
    )
  }

  if (!videoId || !videoInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลวิดีโอ</h2>
            <p className="text-gray-600 mb-6">กรุณาเลือกวิดีโอที่ต้องการวิเคราะห์จากหน้าหลัก หรืออัปโหลดวิดีโอใหม่</p>
            <div className="space-y-3">
              <Link href="/" passHref>
                <Button className="w-full">กลับหน้าหลัก</Button>
              </Link>
              <Link href="/upload" passHref>
                <Button variant="outline" className="w-full bg-transparent">
                  อัปโหลดวิดีโอใหม่
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ผลการวิเคราะห์ความสนใจ</h1>
          <p className="text-gray-600">วิเคราะห์พฤติกรรมและความสนใจของนักเรียนในคลิปวิดีโอเรียน</p>
        </div>

        {/* Video Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{videoInfo.video_title}</h2>
                  <p className="text-gray-600">
                    วิชา: {videoInfo.subject_id} | ระยะเวลา: {formatTime(videoInfo.duration)} นาที
                  </p>
                  <p className="text-sm text-gray-500">
                    อัพโหลดเมื่อ: {new Date(videoInfo.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  ดาวน์โหลดรายงาน
                </Button>
                <Link href={`/video-player/${videoId}`}>
                  <Button size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    ดูวิดีโอ
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{studentDataMock.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ความสนใจเฉลี่ย</p>
                  <p className="text-2xl font-bold text-green-600">{analysisSummary?.avgAttention}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ไม่ตั้งใจเรียน</p>
                  <p className="text-2xl font-bold text-red-600">{analysisSummary?.distractedPercentage}%</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ต้องแจ้งเตือน</p>
                  <p className="text-2xl font-bold text-orange-600">{studentsToNotify.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="timeline">ไทม์ไลน์</TabsTrigger>
            <TabsTrigger value="students">รายบุคคล</TabsTrigger>
            <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การกระจายพฤติกรรม</CardTitle>
                  <CardDescription>สัดส่วนพฤติกรรมของนักเรียนตลอดวิดีโอ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={behaviorDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {behaviorDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ความสนใจตามช่วงเวลา</CardTitle>
                  <CardDescription>กราฟแสดงความสนใจของนักเรียนตลอดวิดีโอ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="attention"
                          stroke="#10B981"
                          strokeWidth={3}
                          name="ตั้งใจเรียน (%)"
                        />
                        <Line type="monotone" dataKey="distracted" stroke="#EF4444" strokeWidth={3} name="ไม่ตั้งใจ (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>สรุปผลการวิเคราะห์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-700">จุดแข็ง</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>นักเรียนส่วนใหญ่ตั้งใจเรียนในช่วงแรก (85%)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>ความสนใจเพิ่มขึ้นในช่วงท้าย (88%)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>มีนักเรียนตั้งใจเรียนตลอดทั้งคลิป 20 คน</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-700">จุดที่ควรปรับปรุง</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>ความสนใจลดลงในช่วงกลาง (นาทีที่ 6-8)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>มีนักเรียน {studentsToNotify.length} คนที่ต้องการความช่วยเหลือ</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>การเล่นโทรศัพท์เป็นปัญหาหลัก (12%)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ไทม์ไลน์ความสนใจ</CardTitle>
                <CardDescription>ดูความสนใจของนักเรียนในแต่ละช่วงเวลา</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineData.map((data, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 text-sm font-medium text-gray-600">{data.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ความสนใจ</span>
                          <span className="text-sm text-green-600">{data.attention}%</span>
                        </div>
                        <Progress value={data.attention} className="h-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ไม่ตั้งใจ</span>
                          <span className="text-sm text-red-600">{data.distracted}%</span>
                        </div>
                        <Progress value={data.distracted} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>รายงานรายบุคคล</CardTitle>
                <CardDescription>ดูผลการวิเคราะห์ของนักเรียนแต่ละคน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsAnalysis.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{student.id}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {student.behaviors.map((behavior: string, index: number) => (
                              <Badge
                                key={index}
                                variant={behavior === "ตั้งใจเรียน" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {behavior}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">ความสนใจ</div>
                          <div
                            className={`text-lg font-bold ${
                              student.attention >= 80
                                ? "text-green-600"
                                : student.attention >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {student.attention}%
                          </div>
                        </div>
                        <Badge
                          variant={
                            student.status === "excellent"
                              ? "default"
                              : student.status === "good"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {student.status === "excellent" ? "ดีเยี่ยม" : student.status === "good" ? "ดี" : "ต้องปรับปรุง"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ส่งการแจ้งเตือน</CardTitle>
                  <CardDescription>แจ้งเตือนนักเรียนที่ต้องการความช่วยเหลือ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (!videoId) {
                        alert("ไม่พบ Video ID สำหรับการแจ้งเตือน")
                        return
                      }
                      startEmailTransition(async () => {
                        const result = await sendEmailNotification(
                          studentsToNotify,
                          Number.parseInt(videoId),
                          "คุณมีวิดีโอที่ควรทบทวน: บทที่ 1 พื้นฐานคณิตศาสตร์",
                        )
                        alert(result.message)
                      })
                    }}
                    disabled={isPendingEmail || studentsToNotify.length === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {isPendingEmail ? "กำลังส่งอีเมล..." : `ส่งอีเมลแจ้งเตือน (${studentsToNotify.length} คน)`}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      if (!videoId) {
                        alert("ไม่พบ Video ID สำหรับการแจ้งเตือน")
                        return
                      }
                      startLineTransition(async () => {
                        const result = await sendLineNotification(
                          studentsToNotify,
                          Number.parseInt(videoId),
                          "คุณมีวิดีโอที่ควรทบทวน: บทที่ 1 พื้นฐานคณิตศาสตร์",
                        )
                        alert(result.message)
                      })
                    }}
                    disabled={isPendingLine || studentsToNotify.length === 0}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isPendingLine ? "กำลังส่ง LINE..." : `ส่งข้อความ LINE (${studentsToNotify.length} คน)`}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายชื่อที่ต้องแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentsToNotify.length > 0 ? (
                      studentsToNotify.map((studentId) => {
                        const student = studentDataMock.find((s) => s.id === studentId)
                        return student ? (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-red-900">{student.name}</div>
                              <div className="text-sm text-red-700">ความสนใจ: {student.attention}%</div>
                            </div>
                            <Badge variant="destructive">ต้องแจ้งเตือน</Badge>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-gray-500 text-center">ไม่มีนักเรียนที่ต้องแจ้งเตือน</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
