from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, json
from datetime import datetime
import mysql.connector
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename
import shutil

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# === CONFIG LOADING ===
with open("config.json") as f:
    config = json.load(f)

db_config = config["database_settings"]

# === DATABASE CONNECTION ===
def get_db_connection():
    return mysql.connector.connect(
        host=db_config["host"],
        user=db_config["user"],
        password=db_config["password"],
        database=db_config["database"]
    )

# === utils ===
def _abs_url(*parts):
    """สร้าง absolute URL จาก host_url + path ที่ส่งออก"""
    base = request.host_url.rstrip("/")  # ex. http://localhost:5000
    path = "/".join(p.strip("/") for p in parts)
    return f"{base}/{path}"

# === หน้าแรก (route /) เพื่อป้องกัน 404 ===
@app.route("/")
def home():
    return "<h1>Welcome to Student Attention Tracker API</h1><p>Use API endpoints to interact.</p>"

# -----------------------------------------------------------
#  API: UPLOAD/ANALYZE วิดีโอ  (คืน processed_url ให้เลย)
# -----------------------------------------------------------
@app.route("/upload", methods=["POST"])
@app.route("/analyze-video", methods=["POST"])  # alias เผื่อ frontend เดิมเรียกอันนี้อยู่
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["video"]
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    os.makedirs("uploads", exist_ok=True)
    upload_path = os.path.join("uploads", filename)
    file.save(upload_path)

    try:
        # วิเคราะห์ + สร้างไฟล์ผลลัพธ์
        results, processed_filename, chart_filename = analyze_attention_with_yolo(upload_path, filename)

        processed_url = _abs_url("processed", processed_filename)
        chart_url = _abs_url("static/charts", chart_filename)

        return jsonify({
            "message": "วิเคราะห์เสร็จแล้ว",
            "results": results,
            "processed_url": processed_url,   # <-- คืน URL ตรงๆ ให้ Next.js เล่นได้เลย
            "chart_url": chart_url,
            "video_name": filename
        })
    except Exception as e:
        print("❌ Analyze error:", e)
        return jsonify({"error": "Analyze failed"}), 500

# === API: รายชื่อวิดีโอ ===
@app.route("/api/videos")
def list_videos():
    videos = []
    os.makedirs("uploads", exist_ok=True)
    for filename in os.listdir("uploads"):
        if filename.lower().endswith(".mp4"):
            analyzed = os.path.exists(os.path.join("processed", f"analyzed_{filename}"))
            videos.append({
                "name": filename,
                "status": "Analyzed" if analyzed else "Pending",
                "processed_url": _abs_url("processed", f"analyzed_{filename}") if analyzed else None,
            })
    return jsonify({"videos": videos})

# === API: ดูผลวิเคราะห์จาก DB ===
@app.route("/api/results/<video_name>")
def get_analysis_result(video_name):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT analysis_json FROM analysis_results WHERE video_name = %s", (video_name,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row:
        return jsonify({"success": True, "result": json.loads(row["analysis_json"])})
    return jsonify({"success": False, "error": "No result"}), 404

# === Serve ไฟล์วิดีโอ Upload/Processed และ Charts ===
@app.route("/uploads/<path:filename>")
def get_uploaded_video(filename):
    return send_from_directory("uploads", filename, mimetype="video/mp4", as_attachment=False)

@app.route("/processed/<path:filename>")
def get_processed_video(filename):
    return send_from_directory("processed", filename, mimetype="video/mp4", as_attachment=False)

@app.route("/static/charts/<path:filename>")
def get_chart(filename):
    return send_from_directory("static/charts", filename)

# -----------------------------------------------------------
#   ฟังก์ชันวิเคราะห์ + บันทึก DB
# -----------------------------------------------------------
def analyze_attention_with_yolo(video_path, video_name):
    """
    แทนที่ mock ส่วนนี้ด้วยการเรียก YOLO จริงของคุณ
    ควร return:
      - results (dict)
      - processed_filename (ชื่อไฟล์ที่โฟลเดอร์ processed/)
      - chart_filename (ชื่อไฟล์กราฟใน static/charts/)
    """
    # === Mock ผลวิเคราะห์ ===
    results = {
        "average_attention": 0.74,
        "attentive_frames": 234,
        "inattentive_frames": 86,
        "recommendation": "ให้กระตุ้นนักเรียนช่วงกลางคลาส"
    }

    save_analysis_to_db(video_name, results)

    # --- Mock: Copy เป็น processed video ---
    os.makedirs("processed", exist_ok=True)
    processed_filename = f"analyzed_{video_name}"
    processed_path = os.path.join("processed", processed_filename)
    shutil.copy(video_path, processed_path)

    # --- Mock: ทำกราฟ ---
    os.makedirs("static/charts", exist_ok=True)
    chart_filename = f"analysis_{os.path.splitext(video_name)[0]}.png"
    chart_path = os.path.join("static/charts", chart_filename)

    plt.plot([0.7, 0.75, 0.72, 0.76, 0.74])
    plt.title("Attention Over Time")
    plt.savefig(chart_path)
    plt.close()

    return results, processed_filename, chart_filename

def save_analysis_to_db(video_name, results):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO analysis_results (video_name, analysis_json, analysis_time)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                analysis_json = VALUES(analysis_json),
                analysis_time = VALUES(analysis_time)
        """, (video_name, json.dumps(results), datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("❌ Save DB error:", e)

if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("processed", exist_ok=True)
    os.makedirs("static/charts", exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
