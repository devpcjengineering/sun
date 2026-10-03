# SUNNAKHON GROUP — เว็บไซต์ + ระบบหลังบ้าน

Next.js 16 (App Router) · Tailwind v4 · Supabase (Google login + Postgres) · Cloudinary (รูปภาพ)

## ตั้งค่าครั้งแรก

### 1) Supabase
1. สร้างโปรเจกต์ที่ https://supabase.com
2. **SQL Editor** → วางไฟล์ `supabase/schema.sql` ทั้งไฟล์ → กด **Run** (รันซ้ำได้) แล้วรันอีกบรรทัดเพื่อเพิ่มแอดมินคนแรก:
   `insert into public.admins (email) values ('อีเมล-google-ของคุณ') on conflict do nothing;`
3. **Authentication → Providers → Google** → เปิดใช้งาน แล้วใส่ Client ID / Secret
   - สร้างที่ Google Cloud Console → APIs & Services → Credentials → OAuth client (Web)
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (ตอนขึ้นจริงเปลี่ยนเป็นโดเมน `https://sunnakhongroupth.com`)
   - Redirect URLs เพิ่ม: `http://localhost:3000/auth/callback` และ `https://sunnakhongroupth.com/auth/callback`
5. **Project Settings → API** คัดลอก URL และ anon key

### 2) Cloudinary ผ่าน Supabase Edge Functions
Cloudinary secret อยู่ใน Edge Functions เท่านั้น (ไม่อยู่ใน Next.js) — `supabase/functions/cloudinary-sign` ออก signature ให้ browser อัปโหลดตรง, `cloudinary-delete` ลบรูป ทั้งสองเช็กว่าเป็นแอดมินก่อนทุกครั้ง
```bash
npm i -g supabase            # หรือ npx supabase ...
supabase login
supabase link --project-ref nbmyrdiwahklyfjgvwxq
supabase secrets set CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx
supabase functions deploy cloudinary-sign cloudinary-delete
```
ค่า Cloud name / API Key / API Secret ดูได้ที่ Cloudinary Dashboard → API Keys

### 3) Environment
```bash
cp .env.example .env.local   # ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY (= publishable key)
npm install
npm run dev
```
เปิด http://localhost:3000 · หลังบ้านที่ http://localhost:3000/admin (ล็อกอินด้วย Google ที่อยู่ในตาราง `admins`)

## ระบบหลังบ้าน (/admin)
| เมนู | ทำอะไรได้ |
|---|---|
| แดชบอร์ด | สรุปจำนวน, ข้อความล่าสุด, เช็กลิสต์ตั้งค่า |
| โพสต์/ผลงาน | เขียน/แก้/ลบ, markdown, รูปปก + แกลเลอรี, หมวดหมู่, ปักหมุด, เผยแพร่/ซ่อน |
| ลูกค้าที่เคยร่วมงาน | อัปโหลดโลโก้ทีละอันหรือหลายไฟล์พร้อมกัน, เรียงลำดับ → โลโก้วิ่งหน้าแรก |
| บริการ / แพ็คเก็จ / เสียงลูกค้า | จัดการเนื้อหา, เรียงลำดับ, เผยแพร่/ซ่อน |
| ข้อความติดต่อ | อ่านข้อความจากฟอร์มหน้าเว็บ, ทำเครื่องหมายสถานะ |
| ตั้งค่าเว็บไซต์ | ข้อความ Hero, สถิติ, ช่องทางติดต่อ, SEO |
| ผู้ดูแลระบบ | เพิ่ม/ลบอีเมล Google ที่เข้าหลังบ้านได้ |

## โลโก้
`public/brand/*.svg` — แปลงจาก PNG ต้นฉบับ (`logo-black.svg`, `logo-white.svg`) ถ้าต้องการความคมระดับไฟล์ต้นฉบับ ให้ export SVG จากไฟล์ .ait (Illustrator) มาแทนที่ชื่อเดิม

## Deploy
Vercel: ตั้งค่า env ทั้ง 5 ตัวใน `.env.example` แล้ว deploy, ผูกโดเมน `sunnakhongroupth.com`
