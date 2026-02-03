import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'

export default function ResultPage() {
  const router = useRouter()
  const { video_name } = router.query
  const videoName = Array.isArray(video_name) ? video_name[0] : video_name

  if (!videoName) {
    return <div>กรุณาระบุชื่อวิดีโอใน URL</div>
  }

  const { data, error } = useSWR(`/api/results/${videoName}`, fetcher)

  if (error) return <div>เกิดข้อผิดพลาดในการโหลดผลวิเคราะห์</div>
  if (!data) return <div>กำลังโหลด...</div>
  if (!data.success) return <div>{data.error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ผลวิเคราะห์วิดีโอ: {videoName}</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        {JSON.stringify(data.result, null, 2)}
      </pre>
    </div>
  )
}
