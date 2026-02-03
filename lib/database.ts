// lib/database.ts
import mysql from "mysql2/promise"

// ✅ สร้าง Connection Pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,           // เช่น "localhost"
  user: process.env.DATABASE_USER,           // เช่น "root"
  password: process.env.DATABASE_PASSWORD,   // เช่น "" หรือ "yourpassword"
  database: process.env.DATABASE_NAME,       // เช่น "student_attention_system"
  port: Number(process.env.DATABASE_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// ✅ ดึง connection จาก pool
export async function getConnection() {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error("❌ Failed to get connection from pool:", error)
    throw error
  }
}

// ✅ เพิ่มฟังก์ชัน alias ชื่อ connectDB (ใช้ชื่อเดียวกับโปรเจกต์อื่นได้)
export async function connectDB() {
  return await getConnection()
}

// ✅ ใช้สำหรับ query อย่างรวดเร็ว (พร้อมคืน connection ให้อัตโนมัติ)
export async function query(sql: string, params?: any[]) {
  const connection = await getConnection()
  try {
    const [rows] = await connection.query(sql, params)
    return rows
  } finally {
    connection.release()
  }
}
