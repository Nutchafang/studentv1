Student Attention

## 🎯 Business Problem
With more online classes, teachers struggle to monitor student attention and engagement in real time.
This project aims to provide a tool that supports teachers by analyzing student behavior
from livestream or recorded feeds and returning interpretable engagement metrics.

## 📌 Objective
To build a web-based application that visualizes student attention levels and helps educators
understand class engagement patterns during online learning sessions.

## 🗂️ Project Overview
This system consists of:
1. **Frontend** (Next.js) – Interactive UI for users to upload video / view attention results
2. **Backend** (Python API) – Runs attention analysis logic and serves processed data
3. **Database** – Stores session results and metrics for later review

## 🛠️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS, React Components
- **Backend:** Python (Flask / FastAPI), AI Attention Models
- **Database:** Prisma ORM
- **Deployment:** (Add if you deploy, e.g., Vercel / Render)

## 🚀 How It Works (High-level)
1. User uploads or streams video via the web interface.
2. Backend processes video frames with attention analysis logic.
3. Backend returns attention scores or engagement summaries.
4. Frontend visualizes results in charts or tables.

## 📊 Business Value
- Helps teachers spot disengaged students quickly.
- Provides metrics instead of manual observation.
- Can be extended for analytics dashboards or alerts.

## 📥 Setup & Run (Summary)
1. Clone repository
2. Install frontend dependencies (`npm install`)
3. Setup Python backend environment and requirements
4. Run both servers to start the full application

## 📌 Future Improvements
- Enhance attention model accuracy
- Add reporting dashboard for teachers
- Export summaries as PDF or CSV

