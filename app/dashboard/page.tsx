"use client"
import { useEffect, useState } from "react"
import TeacherDashboard from "@/components/TeacherDashboard"
import StudentDashboard from "@/components/StudentDashboard"

export default function DashboardPage({
  userType,
  onLogout,
}: {
  userType: "teacher" | "student"
  onLogout: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ระบบติดตามความสนใจนักเรียน</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          ออกจากระบบ
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {userType === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </div>
  )
}
