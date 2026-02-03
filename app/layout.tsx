import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ระบบติดตามความสนใจนักเรียน",
  description: "ระบบวิเคราะห์พฤติกรรมนักเรียนในคลิปวิดีโอเรียนออนไลน์",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"), // เพิ่มบรรทัดนี้
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
