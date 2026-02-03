"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Play, Pause, RotateCcw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getVideoAnalysisData } from "@/app/actions"

export default function VideoPlayerPage({ params }: { params: { videoId?: string } }) {
  const videoId = params.videoId || "" // กรณีไม่มี videoId ให้เป็นค่าว่าง
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentStatus, setCurrentStatus] = useState<{ status: string; color: string; attention: number } | null>(null)
  const [videoData, setVideoData] = useState<any>(null)
  const [timelineAnalysis, setTimelineAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // ถ้าไม่มี videoId เลย ไม่ต้อง fetch
    if (!videoId) {
      setVideoData(null)
      setTimelineAnalysis([])
      setCurrentStatus(null)
      setLoading(false)
      return
    }

    async function fetchVideoAndAnalysis() {
      setLoading(true)
      const data = await getVideoAnalysisData(videoId)
      if (data && data.video) {
        setVideoData(data.video)
        setTimelineAnalysis(data.timeline)
        if (data.timeline.length > 0) {
          const initialStatus = mapBehaviorToStatus(data.timeline[0].status, data.timeline[0].confidence)
          setCurrentStatus(initialStatus)
        }
      } else {
        setVideoData(null)
        setTimelineAnalysis([])
        setCurrentStatus(null)
      }
      setLoading(false)
    }
    fetchVideoAndAnalysis()
  }, [videoId])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const setVideoMetadata = () => {
      setDuration(video.duration)
      setCurrentTime(video.currentTime)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const currentAnalysisPoint = [...timelineAnalysis]
        .reverse()
        .find((data) => data.time <= video.currentTime)
      if (currentAnalysisPoint) {
        setCurrentStatus(mapBehaviorToStatus(currentAnalysisPoint.status, currentAnalysisPoint.confidence))
      } else if (timelineAnalysis.length > 0) {
        setCurrentStatus(mapBehaviorToStatus(timelineAnalysis[0].status, timelineAnalysis[0].confidence))
      } else {
        setCurrentStatus({ status: "ไม่มีข้อมูลวิเคราะห์", color: "bg-gray-400", attention: 0 })
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("loadedmetadata", setVideoMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("loadedmetadata", setVideoMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [timelineAnalysis])

  const mapBehaviorToStatus = (behaviorType: string, confidence: number) => {
    let status = ""
    let color = ""
    let attentionScore = 0

    switch (behaviorType) {
      case "attentive":
        status = "ตั้งใจเรียน"
        color = "bg-green-500"
        attentionScore = confidence
        break
      case "yawning":
        status = "หาว/เบื่อ"
        color = "bg-yellow-500"
        attentionScore = 100 - confidence
        break
      case "bored":
        status = "เบื่อ"
        color = "bg-yellow-500"
        attentionScore = 100 - confidence
        break
      case "sleeping":
        status = "นอน"
        color = "bg-gray-500"
        attentionScore = 100 - confidence
        break
      case "phone":
        status = "เล่นโทรศัพท์"
        color = "bg-red-500"
        attentionScore = 100 - confidence
        break
      case "looking_around":
        status = "หันซ้ายขวา"
        color = "bg-purple-500"
        attentionScore = 100 - confidence
        break
      default:
        status = "ไม่ทราบพฤติกรรม"
        color = "bg-gray-400"
        attentionScore = 0
    }
    return { status, color, attention: Math.round(attentionScore) }
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      // ไม่ต้อง setIsPlaying(!isPlaying) เพราะจับ event play/pause แทนแล้ว
    }
  }

  const resetVideo = () => {
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.pause()
      if (timelineAnalysis.length > 0) {
        setCurrentStatus(mapBehaviorToStatus(timelineAnalysis[0].status, timelineAnalysis[0].confidence))
      } else {
        setCurrentStatus(null)
      }
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  // ถ้า loading กำลังโหลด ให้แสดง loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500">กำลังโหลดข้อมูลวิดีโอ...</p>
      </div>
    )
  }

  // ถ้าไม่มี videoId แสดงข้อความแจ้ง
  if (!videoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-600 text-center">ไม่พบ Video ID กรุณาระบุ Video ID ใน URL</p>
      </div>
    )
  }

  // ถ้าไม่มีข้อมูลวิดีโอแสดงหน้าไม่พบวิดีโอ
  if (!videoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบวิดีโอ</h2>
            <p className="text-gray-600 mb-6">ไม่พบวิดีโอที่มี ID: {videoId} ในระบบ</p>
            <div className="space-y-3">
              <Link href="/analytics" passHref>
                <Button className="w-full">กลับไปหน้าวิเคราะห์</Button>
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href={`/analytics?videoId=${videoId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าวิเคราะห์
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              วิดีโอ: {videoData.video_title} (ID: {videoId})
            </CardTitle>
            <CardDescription>แสดงผลการวิเคราะห์ความสนใจของนักเรียน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full bg-black rounded-lg overflow-hidden">
              {/* เอา controls ออก เพราะใช้ custom controls */}
              <video ref={videoRef} src={videoData.video_path} className="w-full h-auto" />
              {currentStatus && (
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white font-bold text-sm ${currentStatus.color}`}
                >
                  {currentStatus.status} ({currentStatus.attention}%)
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={togglePlayPause} size="icon">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button onClick={resetVideo} size="icon" variant="outline">
                <RotateCcw className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">หมายเหตุ:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>
                      ข้อมูลการวิเคราะห์พฤติกรรมที่แสดงนี้ถูกดึงมาจากฐานข้อมูล ซึ่งเป็นผลลัพธ์ที่ได้จากการประมวลผล AI (จำลอง)
                      หลังการอัปโหลดวิดีโอ
                    </li>
                    <li>กรอบสีเขียวแสดงถึงความตั้งใจเรียน, สีแดง/เหลือง/ม่วง/เทา แสดงถึงพฤติกรรมไม่ตั้งใจต่างๆ</li>
                    <li>
                      การแสดงผล Bounding Box จริงๆ บนวิดีโอแบบ Real-time ในเบราว์เซอร์นั้นซับซ้อนมาก และต้องใช้ Backend Server
                      ที่มีประสิทธิภาพสูงในการประมวลผลวิดีโอและส่งข้อมูลกลับมา
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
