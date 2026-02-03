import nodemailer from "nodemailer"

// สร้าง Nodemailer transporter
// คุณจะต้องตั้งค่า Environment Variables เหล่านี้ใน Vercel หรือไฟล์ .env.local
// ตัวอย่างสำหรับ Gmail (ต้องเปิด Less secure app access หรือใช้ App password)
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=your_email@gmail.com
// EMAIL_PASS=your_app_password

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Student Attention Tracker" <${process.env.EMAIL_USER}>`, // ผู้ส่ง
      to: to, // ผู้รับ
      subject: subject, // หัวข้ออีเมล
      html: html, // เนื้อหาอีเมล (HTML)
    })
    console.log(`Email sent successfully to ${to}`)
    return { success: true }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    return { success: false, error: (error as Error).message }
  }
}
