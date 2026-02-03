"use server"

import { pool } from "@/lib/database"  // สมมติว่า database.ts export connection pool ชื่อ pool
import type { RowDataPacket } from "mysql2/promise"
import { sendEmail } from "@/lib/email"
import { put } from "@vercel/blob"

// *** Teacher Dashboard ***
export async function getTeacherDashboardData() {
  try {
    const [videoRows] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM videos")
    const [studentRows] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM students")
    const [attentionRows] = await pool.execute<RowDataPacket[]>("SELECT AVG(average_attention) as avg_att FROM daily_stats")
    const [notificationRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE status = "pending"',
    )

    return {
      totalVideos: videoRows[0]?.count || 0,
      totalStudents: studentRows[0]?.count || 0,
      avgAttention: attentionRows[0]?.avg_att ? Number(attentionRows[0].avg_att) : 0,
      newNotifications: notificationRows[0]?.count || 0,
    }
  } catch (error) {
    console.error("Failed to fetch teacher dashboard data:", error)
    return { totalVideos: 0, totalStudents: 0, avgAttention: 0, newNotifications: 0 }
  }
}

// *** Student Dashboard ***
export async function getStudentDashboardData(studentId: string) {
  try {
    const [watchedVideosRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT video_id) as count FROM video_analysis WHERE student_id = ?",
      [studentId],
    )
    const [totalVideosRows] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM videos")
    const [avgAttentionRows] = await pool.execute<RowDataPacket[]>(
      "SELECT AVG(average_attention) as avg_att FROM daily_stats WHERE student_id = ?",
      [studentId],
    )
    const [notificationsRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE student_id = ?",
      [studentId],
    )

    return {
      videosWatched: watchedVideosRows[0]?.count || 0,
      totalVideos: totalVideosRows[0]?.count || 0,
      avgAttention: avgAttentionRows[0]?.avg_att ? Number(avgAttentionRows[0].avg_att) : 0,
      notificationsCount: notificationsRows[0]?.count || 0,
    }
  } catch (error) {
    console.error("Failed to fetch student dashboard data:", error)
    return { videosWatched: 0, totalVideos: 0, avgAttention: 0, notificationsCount: 0 }
  }
}

// *** Send Email Notification ***
export async function sendEmailNotification(studentIds: string[], videoId: number, message: string) {
  let connection
  try {
    connection = await pool.getConnection()
    const placeholders = studentIds.map(() => "?").join(",")
    const [students] = await connection.execute<RowDataPacket[]>(
      `SELECT student_id, student_name, email FROM students WHERE student_id IN (${placeholders})`,
      studentIds,
    )

    let successCount = 0
    for (const student of students) {
      if (student.email) {
        const emailSubject = `แจ้งเตือนผลการเรียน: ${message}`
        const emailHtml = `
          <p>เรียนคุณ ${student.student_name},</p>
          <p>เราพบว่าคุณอาจต้องการทบทวนเนื้อหาในวิดีโอเรียนบางส่วน</p>
          <p>รายละเอียด: ${message}</p>
          <p>คุณสามารถดูรายงานผลการเรียนของคุณได้ที่: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/student-report?studentId=${student.student_id}">คลิกที่นี่</a></p>
          <p>ขอบคุณครับ/ค่ะ</p>
          <p>ทีมงานระบบติดตามความสนใจนักเรียน</p>
        `
        const result = await sendEmail(student.email, emailSubject, emailHtml)
        if (result.success) {
          successCount++
          await connection.execute(
            "INSERT INTO notifications (student_id, video_id, notification_type, message, status) VALUES (?, ?, ?, ?, ?)",
            [student.student_id, videoId, "email", message, "sent"],
          )
        } else {
          await connection.execute(
            "INSERT INTO notifications (student_id, video_id, notification_type, message, status) VALUES (?, ?, ?, ?, ?)",
            [student.student_id, videoId, "email", message, "failed"],
          )
        }
      }
    }
    return { success: true, message: `ส่งอีเมลแจ้งเตือนสำเร็จ ${successCount} คน` }
  } catch (error) {
    console.error("Failed to send email notification:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมลแจ้งเตือน" }
  } finally {
    if (connection) connection.release()
  }
}

// *** Send LINE Notification ***
export async function sendLineNotification(studentIds: string[], videoId: number, message: string) {
  const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is not set.")
    return { success: false, message: "LINE API Token ไม่ได้ถูกตั้งค่า" }
  }

  let connection
  try {
    connection = await pool.getConnection()
    const placeholders = studentIds.map(() => "?").join(",")
    const [students] = await connection.execute<RowDataPacket[]>(
      `SELECT student_id, student_name, line_id FROM students WHERE student_id IN (${placeholders})`,
      studentIds,
    )

    let successCount = 0
    for (const student of students) {
      if (student.line_id) {
        const lineMessage = {
          to: student.line_id,
          messages: [
            {
              type: "text",
              text: `เรียนคุณ ${student.student_name},\n\n${message}\n\nดูรายงาน: ${process.env.NEXT_PUBLIC_BASE_URL}/student-report?studentId=${student.student_id}`,
            },
          ],
        }

        const response = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(lineMessage),
        })

        if (response.ok) {
          successCount++
          await connection.execute(
            "INSERT INTO notifications (student_id, video_id, notification_type, message, status) VALUES (?, ?, ?, ?, ?)",
            [student.student_id, videoId, "line", message, "sent"],
          )
        } else {
          await connection.execute(
            "INSERT INTO notifications (student_id, video_id, notification_type, message, status) VALUES (?, ?, ?, ?, ?)",
            [student.student_id, videoId, "line", message, "failed"],
          )
        }
      }
    }
    return { success: true, message: `ส่งข้อความ LINE สำเร็จ ${successCount} คน` }
  } catch (error) {
    console.error("Failed to send LINE notification:", error)
    return { success: false, message: "เกิดข้อผิดพลาดในการส่งข้อความ LINE" }
  } finally {
    if (connection) connection.release()
  }
}

// *** Upload Video & Call AI Backend ***
export async function uploadVideoAndAnalyze(formData: FormData) {
  const title = formData.get("title") as string
  const subject = formData.get("subject") as string
  const description = formData.get("description") as string
  const file = formData.get("file") as File

  if (!file || !title || !subject) {
    return { success: false, message: "ข้อมูลไม่ครบถ้วน" }
  }

  let connection
  try {
    connection = await pool.getConnection()

    // Upload file to Vercel Blob
    const filename = `${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
    })
    const videoPath = blob.url

    const duration = 930 // mock duration 15:30 mins
    const [result] = await connection.execute(
      "INSERT INTO videos (video_title, subject_id, video_path, duration, processed) VALUES (?, ?, ?, ?, ?)",
      [title, subject, videoPath, duration, false],
    )
    const videoId = (result as any).insertId

    const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL
    if (!AI_BACKEND_URL) {
      throw new Error("AI Backend URL ไม่ได้ถูกตั้งค่า")
    }

    const aiResponse = await fetch(`${AI_BACKEND_URL}/analyze-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId,
        videoUrl: videoPath,
        studentIds: ["S001", "S002", "S003", "S004", "S005"],
      }),
    })

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json()
      throw new Error(`AI Backend failed: ${errorData.message || aiResponse.statusText}`)
    }

    await connection.execute("UPDATE videos SET processed = TRUE WHERE video_id = ?", [videoId])

    // Simulated analysis results (for demo)
    const simulatedAnalysisResults = [
      { studentId: "S001", attention: 92.5, behaviors: { attentive: 85, yawning: 8, phone: 5, looking_around: 2 } },
      { studentId: "S002", attention: 88.3, behaviors: { attentive: 82, yawning: 10, phone: 6, looking_around: 2 } },
      { studentId: "S003", attention: 45.2, behaviors: { attentive: 40, phone: 35, yawning: 15, looking_around: 10 } },
      { studentId: "S004", attention: 35.8, behaviors: { sleeping: 45, bored: 25, attentive: 20, yawning: 10 } },
      { studentId: "S005", attention: 78.9, behaviors: { attentive: 75, looking_around: 15, yawning: 8, phone: 2 } },
    ]

    for (const analysis of simulatedAnalysisResults) {
      await connection.execute(
        "INSERT INTO video_analysis (video_id, student_id, attention_percentage, behaviors) VALUES (?, ?, ?, ?)",
        [videoId, analysis.studentId, analysis.attention, JSON.stringify(analysis.behaviors)],
      )
    }

    const simulatedTimeline = [
      { timestamp_seconds: 0, behavior_type: "attentive", confidence_score: 95.2 },
      { timestamp_seconds: 10, behavior_type: "attentive", confidence_score: 92.8 },
      { timestamp_seconds: 20, behavior_type: "yawning", confidence_score: 87.5 },
      { timestamp_seconds: 30, behavior_type: "attentive", confidence_score: 94.1 },
      { timestamp_seconds: 40, behavior_type: "phone", confidence_score: 89.3 },
      { timestamp_seconds: 50, behavior_type: "attentive", confidence_score: 75.0 },
      { timestamp_seconds: 60, behavior_type: "looking_around", confidence_score: 80.0 },
      { timestamp_seconds: 70, behavior_type: "attentive", confidence_score: 88.0 },
      { timestamp_seconds: 80, behavior_type: "sleeping", confidence_score: 10.0 },
      { timestamp_seconds: 90, behavior_type: "attentive", confidence_score: 95.0 },
    ]

    const [analysisS001] = await connection.execute<RowDataPacket[]>(
      "SELECT analysis_id FROM video_analysis WHERE video_id = ? AND student_id = 'S001'",
      [videoId],
    )
    const analysisIdS001 = analysisS001[0]?.analysis_id

    if (analysisIdS001) {
      for (const timeline of simulatedTimeline) {
        await connection.execute(
          "INSERT INTO behavior_timeline (analysis_id, timestamp_seconds, behavior_type, confidence_score) VALUES (?, ?, ?, ?)",
          [analysisIdS001, timeline.timestamp_seconds, timeline.behavior_type, timeline.confidence_score],
        )
      }
    }

    return { success: true, message: "อัปโหลดวิดีโอและเรียก AI Backend สำเร็จ!", videoId }
  } catch (error) {
    console.error("Error uploading video or calling AI Backend:", error)
    return { success: false, message: `เกิดข้อผิดพลาด: ${(error as Error).message}` }
  } finally {
    if (connection) connection.release()
  }
}

// *** Get Video Analysis Data ***
export async function getVideoAnalysisData(videoId: string) {
  try {
    const [videoRows] = await pool.execute<RowDataPacket[]>(
      "SELECT video_id, video_title, subject_id, video_path, duration FROM videos WHERE video_id = ?",
      [videoId],
    )
    const video = videoRows[0]
    if (!video) return null

    const [analysisRows] = await pool.execute<RowDataPacket[]>(
      "SELECT attention_percentage, behaviors FROM video_analysis WHERE video_id = ? AND student_id = 'S001'",
      [videoId],
    )
    const analysis = analysisRows[0]

    let timelineData: any[] = []
    if (analysis) {
      const [timelineRows] = await pool.execute<RowDataPacket[]>(
        `SELECT timestamp_seconds, behavior_type, confidence_score FROM behavior_timeline bt
         JOIN video_analysis va ON bt.analysis_id = va.analysis_id
         WHERE va.video_id = ? AND va.student_id = 'S001' ORDER BY timestamp_seconds ASC`,
        [videoId],
      )
      timelineData = timelineRows.map((row) => ({
        time: row.timestamp_seconds,
        status: row.behavior_type,
        confidence: row.confidence_score,
      }))
    }

    return {
      video,
      analysis: analysis ? { ...analysis, behaviors: JSON.parse(analysis.behaviors) } : null,
      timeline: timelineData,
    }
  } catch (error) {
    console.error("Failed to fetch video analysis data:", error)
    return null
  }
}

// *** Get Student Report Data ***
export async function getStudentReportData(studentId: string) {
  try {
    const [studentRows] = await pool.execute<RowDataPacket[]>(
      "SELECT student_id, student_name, class, email, line_id FROM students WHERE student_id = ?",
      [studentId],
    )
    const studentInfo = studentRows[0]
    if (!studentInfo) return null

    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         SUM(total_videos_watched) as videosWatched,
         AVG(average_attention) as avgAttention,
         SUM(total_study_time) as totalStudyTime
       FROM daily_stats
       WHERE student_id = ?`,
      [studentId],
    )
    const summaryStats = summaryRows[0] || {}

    const [totalVideosResult] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM videos")
    const totalVideos = totalVideosResult[0]?.count || 0
    const videoProgress = totalVideos > 0 ? Math.round((summaryStats.videosWatched / totalVideos) * 100) : 0

    const [attentionByVideoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         va.attention_percentage,
         va.analysis_date,
         v.video_title
       FROM video_analysis va
       JOIN videos v ON va.video_id = v.video_id
       WHERE va.student_id = ?
       ORDER BY va.analysis_date DESC`,
      [studentId],
    )

    const skillsAssessment = [
      { skill: "ความตั้งใจ", score: Math.min(100, Math.round((summaryStats.avgAttention || 85) * 1.1)) },
      { skill: "การมีส่วนร่วม", score: Math.min(100, Math.round((summaryStats.avgAttention || 85) * 0.9)) },
      { skill: "ความสม่ำเสมอ", score: Math.min(100, Math.round((summaryStats.avgAttention || 85) * 1.05)) },
      { skill: "การจดจ่อ", score: Math.min(100, Math.round((summaryStats.avgAttention || 85) * 0.95)) },
      { skill: "ความเข้าใจ", score: Math.min(100, Math.round((summaryStats.avgAttention || 85) * 1.0)) },
    ]

    const [dailyAttentionRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE_FORMAT(date, '%Y-%m-%d') as date,
         average_attention
       FROM daily_stats
       WHERE student_id = ?
       ORDER BY date ASC`,
      [studentId],
    )
    const dailyAttention = dailyAttentionRows.map((row) => ({
      date: new Date(row.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      average_attention: row.average_attention,
    }))

    return {
      studentInfo,
      summaryStats: {
        videosWatched: summaryStats.videosWatched || 0,
        totalVideos,
        videoProgress,
        avgAttention: summaryStats.avgAttention ? Number(summaryStats.avgAttention).toFixed(0) : "0",
        totalStudyTime: summaryStats.totalStudyTime
          ? Number((summaryStats.totalStudyTime / 60).toFixed(1))
          : 0,
      },
      attentionByVideo: attentionByVideoRows,
      skillsAssessment,
      dailyAttention,
    }
  } catch (error) {
    console.error("Failed to fetch student report data:", error)
    return null
  }
}
