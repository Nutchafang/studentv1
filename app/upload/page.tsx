"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Link from "next/link";

type AnalyzeResponse = {
  message: string;
  output_url?: string;
  output_filename?: string;
  videoId?: string; // สมมติ backend ส่งกลับมา
};

export default function VideoUploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const backend = process.env.NEXT_PUBLIC_AI_BACKEND_URL;

  const handleUpload = async () => {
    if (!videoFile || !backend) return;
    setLoading(true);
    setResultMsg(null);
    setProcessedUrl(null);
    setVideoId(null);

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const { data } = await axios.post<AnalyzeResponse>(
        `${backend}/analyze-video`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResultMsg(data.message || "วิเคราะห์เสร็จแล้ว");

      if (data.output_url) {
        setProcessedUrl(data.output_url);
      } else if (data.output_filename) {
        setProcessedUrl(`${backend}/outputs/${data.output_filename}`);
      }

      if (data.videoId) {
        setVideoId(data.videoId);
      }
    } catch (err) {
      console.error(err);
      setResultMsg("เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">อัปโหลดวิดีโอ</h1>

      <Input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setVideoFile(file);
          setPreviewUrl(file ? URL.createObjectURL(file) : null);
        }}
      />

      <Button onClick={handleUpload} disabled={loading || !videoFile}>
        {loading ? "กำลังอัปโหลด..." : "อัปโหลดและวิเคราะห์"}
      </Button>

      {resultMsg && (
        <p className={resultMsg.startsWith("เกิดข้อผิดพลาด") ? "text-red-600" : "text-green-600"}>
          {resultMsg}
        </p>
      )}

      {previewUrl && (
        <div className="mt-4">
          <p className="font-medium mb-1">วิดีโอต้นฉบับ</p>
          <video controls className="w-full" src={previewUrl} />
        </div>
      )}

      {processedUrl && (
        <div className="mt-6">
          <p className="font-medium mb-1">วิดีโอผลการวิเคราะห์</p>
          <video controls className="w-full" src={processedUrl} crossOrigin="anonymous" />
        </div>
      )}

      {/* ปุ่มลิงก์ไปดูหน้าวิดีโอ player */}
      {videoId && (
        <div className="mt-4">
          <Link href={`/video/${videoId}`}>
            <Button variant="outline" className="w-full">
              ดูวิดีโอผลการวิเคราะห์แบบละเอียด
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
