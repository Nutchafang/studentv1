-- เพิ่มข้อมูลตัวอย่าง
USE student_attention_system;

-- เพิ่มข้อมูลอาจารย์
INSERT INTO teachers (teacher_id, teacher_name, email) VALUES
('T001', 'อาจารย์สมชาย ใจดี', 'somchai@school.ac.th'),
('T002', 'อาจารย์สุดา รักเรียน', 'suda@school.ac.th'),
('T003', 'อาจารย์มานะ ขยัน', 'mana@school.ac.th');

-- เพิ่มข้อมูลวิชา
INSERT INTO subjects (subject_id, subject_name, teacher_id) VALUES
('MATH001', 'คณิตศาสตร์', 'T001'),
('SCI001', 'วิทยาศาสตร์', 'T002'),
('ENG001', 'ภาษาอังกฤษ', 'T003'),
('THAI001', 'ภาษาไทย', 'T001'),
('SOC001', 'สังคมศึกษา', 'T002');

-- เพิ่มข้อมูลนักเรียน
INSERT INTO students (student_id, student_name, class, email, line_id) VALUES
('S001', 'นางสาวสมใจ ใจดี', 'ม.4/1', 'somjai@student.ac.th', 'somjai_line'),
('S002', 'นายสมชาย รักเรียน', 'ม.4/1', 'somchai.s@student.ac.th', 'somchai_line'),
('S003', 'นางสาวมาลี สนใจ', 'ม.4/1', 'malee@student.ac.th', 'malee_line'),
('S004', 'นายสมศักดิ์ เหนื่อย', 'ม.4/1', 'somsak@student.ac.th', 'somsak_line'),
('S005', 'นางสาวสุดา ดีใจ', 'ม.4/1', 'suda.s@student.ac.th', 'suda_line'),
('S006', 'นายวิชัย ตั้งใจ', 'ม.4/2', 'wichai@student.ac.th', 'wichai_line'),
('S007', 'นางสาวนิดา เรียนดี', 'ม.4/2', 'nida@student.ac.th', 'nida_line'),
('S008', 'นายประยุทธ์ มุ่งมั่น', 'ม.4/2', 'prayut@student.ac.th', 'prayut_line');

-- เพิ่มข้อมูลวิดีโอ
INSERT INTO videos (video_title, subject_id, video_path, duration, processed) VALUES
('บทที่ 1: พื้นฐานคณิตศาสตร์', 'MATH001', '/videos/math_ch1.mp4', 930, TRUE),
('บทที่ 2: สมการเชิงเส้น', 'MATH001', '/videos/math_ch2.mp4', 1200, TRUE),
('บทที่ 3: เรขาคณิต', 'MATH001', '/videos/math_ch3.mp4', 1080, TRUE),
('บทที่ 1: ฟิสิกส์พื้นฐาน', 'SCI001', '/videos/physics_ch1.mp4', 900, TRUE),
('บทที่ 2: แรงและการเคลื่อนที่', 'SCI001', '/videos/physics_ch2.mp4', 1150, TRUE);

-- เพิ่มข้อมูลผลการวิเคราะห์ตัวอย่าง
INSERT INTO video_analysis (video_id, student_id, attention_percentage, behaviors) VALUES
(1, 'S001', 92.5, '{"attentive": 85, "yawning": 8, "phone": 5, "looking_around": 2}'),
(1, 'S002', 88.3, '{"attentive": 82, "yawning": 10, "phone": 6, "looking_around": 2}'),
(1, 'S003', 45.2, '{"attentive": 40, "phone": 35, "yawning": 15, "looking_around": 10}'),
(1, 'S004', 35.8, '{"sleeping": 45, "bored": 25, "attentive": 20, "yawning": 10}'),
(1, 'S005', 78.9, '{"attentive": 75, "looking_around": 15, "yawning": 8, "phone": 2}'),
(2, 'S001', 89.1, '{"attentive": 82, "yawning": 12, "phone": 4, "looking_around": 2}'),
(2, 'S002', 85.7, '{"attentive": 80, "yawning": 12, "phone": 6, "looking_around": 2}'),
(2, 'S003', 52.3, '{"attentive": 48, "phone": 28, "yawning": 18, "looking_around": 6}');

-- เพิ่มข้อมูลไทม์ไลน์พฤติกรรม
INSERT INTO behavior_timeline (analysis_id, timestamp_seconds, behavior_type, confidence_score) VALUES
(1, 30, 'attentive', 95.2),
(1, 60, 'attentive', 92.8),
(1, 90, 'yawning', 87.5),
(1, 120, 'attentive', 94.1),
(1, 150, 'phone', 89.3),
(2, 30, 'attentive', 91.5),
(2, 60, 'attentive', 88.7),
(2, 90, 'looking_around', 85.2);

-- เพิ่มข้อมูลสถิติรายวัน
INSERT INTO daily_stats (student_id, date, total_videos_watched, average_attention, total_study_time) VALUES
('S001', '2024-01-15', 3, 89.5, 45),
('S001', '2024-01-16', 2, 91.2, 35),
('S002', '2024-01-15', 3, 86.8, 42),
('S003', '2024-01-15', 2, 48.7, 28),
('S004', '2024-01-15', 1, 35.8, 15),
('S005', '2024-01-15', 2, 78.9, 38);
