from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
import requests
import os
import json
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# โหลดโมเดล YOLOv8
model = YOLO("yolov8n.pt")

# กำหนดชื่อคลาสสำหรับพฤติกรรมที่ต้องการตรวจจับ
BEHAVIOR_CLASSES = {
    0: 'attentive',
    1: 'yawning',
    2: 'bored',
    3: 'phone',
    4: 'looking_around',
    5: 'sleeping'
}

# ตั้งค่าการเชื่อมต่อฐานข้อมูลจาก environment variables
DB_CONFIG = {
    'host': os.environ.get('DATABASE_HOST', 'localhost'),
    'user': os.environ.get('DATABASE_USER', 'root'),
    'password': os.environ.get('DATABASE_PASSWORD', ''),
    'database': os.environ.get('DATABASE_NAME', 'student_attention_system'),
    'port': int(os.environ.get('DATABASE_PORT', 3306))
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

@app.route("/")
def home():
    return "AI Backend is running"

@app.route('/analyze-video', methods=['POST'])
def analyze_video():
    data = request.get_json()
    video_id = data.get('videoId')
    video_url = data.get('videoUrl')
    student_ids = data.get('studentIds', [])

    if not video_url or not video_id:
        return jsonify({"error": "Missing videoUrl or videoId"}), 400

    print(f"Received request to analyze video ID: {video_id} from URL: {video_url}")

    try:
        # ดาวน์โหลดวิดีโอ
        video_response = requests.get(video_url, stream=True)
        video_response.raise_for_status()
        temp_video_path = f"/tmp/video_{video_id}.mp4"
        with open(temp_video_path, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Video downloaded to {temp_video_path}")

        # เปิดวิดีโอ
        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            raise Exception("Could not open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        all_behaviors_detected = {s_id: {b: 0 for b in BEHAVIOR_CLASSES.values()} for s_id in student_ids}
        timeline_results = []

        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame, verbose=False)
            frame_behaviors = {cls_name: 0 for cls_name in BEHAVIOR_CLASSES.values()}
            for r in results:
                for c in r.boxes.cls:
                    class_id = int(c)
                    if class_id in BEHAVIOR_CLASSES:
                        behavior_name = BEHAVIOR_CLASSES[class_id]
                        frame_behaviors[behavior_name] += 1

            total_detected = sum(frame_behaviors.values())
            if total_detected > 0:
                attentive_count = frame_behaviors.get('attentive', 0)
                simulated_attention_percentage = (attentive_count / total_detected) * 100
            else:
                simulated_attention_percentage = 80

            current_time_seconds = int(frame_idx / fps)

            # ตัวอย่างเฉพาะ student ID 'S001' เก็บ timeline behavior
            if 'S001' in student_ids:
                main_behavior = max(frame_behaviors, key=frame_behaviors.get)
                confidence = min(99.99, max(0.01, np.random.normal(simulated_attention_percentage, 10)))
                timeline_results.append({
                    "timestamp_seconds": current_time_seconds,
                    "behavior_type": main_behavior,
                    "confidence_score": round(confidence, 2)
                })

            for s_id in student_ids:
                for b_name, count in frame_behaviors.items():
                    all_behaviors_detected[s_id][b_name] += count

            frame_idx += 1
            # ตัวอย่างแสดงความคืบหน้า ทุก 10 วิ
            if frame_idx % (fps * 10) == 0:
                print(f"Processed {current_time_seconds} seconds. Behaviors: {frame_behaviors}")

        cap.release()
        os.remove(temp_video_path)

        # บันทึกผลลงฐานข้อมูล
        conn = get_db_connection()
        cursor = conn.cursor()

        # ลบผลเก่าก่อน
        cursor.execute("DELETE FROM behavior_timeline WHERE analysis_id IN (SELECT analysis_id FROM video_analysis WHERE video_id = %s)", (video_id,))
        cursor.execute("DELETE FROM video_analysis WHERE video_id = %s", (video_id,))
        conn.commit()

        for s_id in student_ids:
            total_behaviors = sum(all_behaviors_detected[s_id].values())
            attentive_count = all_behaviors_detected[s_id].get('attentive', 0)
            attention_percentage = (attentive_count / total_behaviors) * 100 if total_behaviors > 0 else 85

            cursor.execute(
                "INSERT INTO video_analysis (video_id, student_id, attention_percentage, behaviors) VALUES (%s, %s, %s, %s)",
                (video_id, s_id, round(attention_percentage, 2), json.dumps(all_behaviors_detected[s_id]))
            )
            analysis_id = cursor.lastrowid

            if s_id == 'S001':
                for tl in timeline_results:
                    cursor.execute(
                        "INSERT INTO behavior_timeline (analysis_id, timestamp_seconds, behavior_type, confidence_score) VALUES (%s, %s, %s, %s)",
                        (analysis_id, tl['timestamp_seconds'], tl['behavior_type'], tl['confidence_score'])
                    )

        cursor.execute("UPDATE videos SET processed = TRUE WHERE video_id = %s", (video_id,))
        conn.commit()
        cursor.close()
        conn.close()

        print(f"Analysis results saved for video ID {video_id}")
        return jsonify({"message": "Video analysis completed and results saved.", "videoId": video_id}), 200

    except Exception as e:
        print(f"Error during video analysis: {e}")
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE videos SET processed = FALSE WHERE video_id = %s", (video_id,))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as db_err:
            print(f"Error updating video status to FALSE: {db_err}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
