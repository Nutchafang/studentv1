"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Clock, Eye, Target, Award } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const myAttentionData = [
  { video: "บทที่ 1", attention: 85, date: "15/01/2024" },
  { video: "บทที่ 2", attention: 78, date: "16/01/2024" },
  { video: "บทที่ 3", attention: 92, date: "17/01/2024" },
  { video: "บทที่ 4", attention: 88, date: "18/01/2024" },
  { video: "บทที่ 5", attention: 95, date: "19/01/2024" },
]

const skillData = [
  { skill: "ความตั้งใจ", score: 85 },
  { skill: "การมีส่วนร่วม", score: 78 },
  { skill: "ความสม่ำเสมอ", score: 92 },
  { skill: "การจดจ่อ", score: 88 },
  { skill: "ความเข้าใจ", score: 90 },
]

const weeklyData = [
  { day: "จันทร์", attention: 82 },
  { day: "อังคาร", attention: 85 },
  { day: "พุธ", attention: 78 },
  { day: "พฤหัสบดี", attention: 90 },
  { day: "ศุกร์", attention: 88 },
  { day: "เสาร์", attention: 92 },
  { day: "อาทิตย์", attention: 86 },
]

export default function StudentReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานผลการเรียนของฉัน</h1>
          <p className="text-gray-600">ติดตามความก้าวหน้าและพัฒนาการเรียนรู้ของคุณ</p>
        </div>

        {/* Student Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">นส</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">นางสาวสมใจ ใจดี</h2>
                <p className="text-gray-600">รหัสนักเรียน: S001 | ชั้น: ม.4/1</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-green-100 text-green-800">นักเรียนดีเด่น</Badge>
                  <Badge variant="outline">ความสนใจเฉลี่ย: 85%</Badge>
                </div>
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
                  <p className="text-sm font-medium text-gray-600">วิดีโอที่ดู</p>
                  <p className="text-2xl font-bold text-gray-900">18/24</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">75% เสร็จสิ้น</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ความสนใจเฉลี่ย</p>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-green-600 mt-2">+5% จากสัปดาห์ที่แล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เวลาเรียนรวม</p>
                  <p className="text-2xl font-bold text-gray-900">24.5</p>
                  <p className="text-xs text-gray-500">ชั่วโมง</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เป้าหมายสัปดาห์</p>
                  <p className="text-2xl font-bold text-gray-900">8/10</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Progress value={80} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">80% ของเป้าหมาย</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">ความก้าวหน้า</TabsTrigger>
            <TabsTrigger value="skills">ทักษะ</TabsTrigger>
            <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
            <TabsTrigger value="achievements">ผลงาน</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ความสนใจในแต่ละบท</CardTitle>
                  <CardDescription>กราฟแสดงความสนใจของคุณในวิดีโอแต่ละบท</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={myAttentionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="video" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="attention"
                          stroke="#10B981"
                          strokeWidth={3}
                          name="ความสนใจ (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดการเรียน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myAttentionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.video}</div>
                          <div className="text-sm text-gray-500">{item.date}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{item.attention}%</div>
                            <div className="text-xs text-gray-500">ความสนใจ</div>
                          </div>
                          <Badge
                            variant={item.attention >= 90 ? "default" : item.attention >= 80 ? "secondary" : "outline"}
                          >
                            {item.attention >= 90 ? "ดีเยี่ยม" : item.attention >= 80 ? "ดี" : "ปานกลาง"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การประเมินทักษะ</CardTitle>
                  <CardDescription>ประเมินทักษะการเรียนรู้ในด้านต่างๆ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="คะแนน" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดทักษะ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillData.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-sm text-gray-600">{skill.score}/100</span>
                        </div>
                        <Progress value={skill.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ความสนใจรายวัน</CardTitle>
                <CardDescription>ติดตามความสนใจในการเรียนแต่ละวัน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="attention" stroke="#3B82F6" strokeWidth={3} name="ความสนใจ (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">นักเรียนดีเด่น</h3>
                  <p className="text-sm text-gray-600">ความสนใจเฉลี่ยสูงกว่า 80%</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">ได้รับแล้ว</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">ความก้าวหน้าต่อเนื่อง</h3>
                  <p className="text-sm text-gray-600">เรียนต่อเนื่อง 7 วันติดต่อกัน</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">ได้รับแล้ว</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">ผู้ชมตัวจริง</h3>
                  <p className="text-sm text-gray-600">ดูวิดีโอครบทุกบท</p>
                  <Badge variant="outline" className="mt-2">
                    75% เสร็จสิ้น
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">เป้าหมายสำเร็จ</h3>
                  <p className="text-sm text-gray-600">บรรลุเป้าหมายรายสัปดาห์</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">ได้รับแล้ว</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">นักเรียนขยัน</h3>
                  <p className="text-sm text-gray-600">เรียนครบ 20 ชั่วโมง</p>
                  <Badge className="mt-2 bg-orange-100 text-orange-800">ได้รับแล้ว</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">ผู้เชี่ยวชาญ</h3>
                  <p className="text-sm text-gray-600">ความสนใจเฉลี่ย 95%</p>
                  <Badge variant="outline" className="mt-2">
                    ยังไม่ได้รับ
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>เป้าหมายถัดไป</CardTitle>
                <CardDescription>สิ่งที่คุณสามารถทำได้เพื่อพัฒนาตนเอง</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">ดูวิดีโอให้ครบทุกบท</div>
                      <div className="text-sm text-gray-600">เหลืออีก 6 วิดีโอ</div>
                    </div>
                    <Progress value={75} className="w-20 h-2" />
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">เพิ่มความสนใจเป็น 90%</div>
                      <div className="text-sm text-gray-600">ปัจจุบัน 85%</div>
                    </div>
                    <Progress value={94} className="w-20 h-2" />
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">เรียนต่อเนื่อง 14 วัน</div>
                      <div className="text-sm text-gray-600">ปัจจุบัน 7 วัน</div>
                    </div>
                    <Progress value={50} className="w-20 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
