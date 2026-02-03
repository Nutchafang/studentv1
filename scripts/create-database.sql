-- สร้างฐานข้อมูลสำหรับระบบติดตามความสนใจนักเรียน
CREATE DATABASE IF NOT EXISTS student_attention_system;
USE student_attention_system;

-- ตารางข้อมูลนักเรียน
CREATE TABLE students (
    student_id VARCHAR(10) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    class VARCHAR(20),
    email VARCHAR(100),
    line_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางข้อมูลอาจารย์
CREATE TABLE teachers (
    teacher_id VARCHAR(10) PRIMARY KEY,
    teacher_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางข้อมูลวิชา
CREATE TABLE subjects (
    subject_id VARCHAR(10) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    teacher_id VARCHAR(10),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- ตารางข้อมูลวิดีโอ
CREATE TABLE videos (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    video_title VARCHAR(200) NOT NULL,
    subject_id VARCHAR(10),
    video_path VARCHAR(500),
    duration INT, -- ระยะเวลาเป็นวินาที
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- ตารางผลการวิเคราะห์วิดีโอ
CREATE TABLE video_analysis (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT,
    student_id VARCHAR(10),
    attention_percentage DECIMAL(5,2),
    behaviors JSON, -- เก็บข้อมูลพฤติกรรมเป็น JSON
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(video_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ตารางพฤติกรรมแต่ละช่วงเวลา
CREATE TABLE behavior_timeline (
    timeline_id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT,
    timestamp_seconds INT,
    behavior_type ENUM('attentive', 'yawning', 'bored', 'sleeping', 'phone', 'looking_around'),
    confidence_score DECIMAL(5,2),
    FOREIGN KEY (analysis_id) REFERENCES video_analysis(analysis_id)
);

-- ตารางการแจ้งเตือน
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    video_id INT,
    notification_type ENUM('email', 'line'),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (video_id) REFERENCES videos(video_id)
);

-- ตารางสถิติรายวัน
CREATE TABLE daily_stats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10),
    date DATE,
    total_videos_watched INT DEFAULT 0,
    average_attention DECIMAL(5,2),
    total_study_time INT, -- เป็นนาที
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
