# เว็บร้านหนังสือ (ออกแบบโดย AI: GLM & Minimax)

โปรเจ็คนี้เป็นตัวอย่างการออกแบบเว็บร้านขายหนังสือ (e-commerce bookstore) โดยร่วมออกแบบระหว่าง AI สองตัวคือ **GLM** และ **Minimax** โดยมี backend เป็นชุด API เขียนด้วย **PHP** และใช้ฐานข้อมูล **MySQL** พร้อม Framework เล็กๆ ที่ชื่อว่า **Haekkhon PHP Framework** (ไฟล์อยู่ใน `framework/haekkhon.php`) เพื่อให้สามารถทดลองใช้งานและขยายต่อได้อย่างรวดเร็ว

## ภาพรวมสถาปัตยกรรม

- Frontend: มีตัวอย่าง frontend สองชุดในโฟลเดอร์ `glm/` และ `minimax/` (แต่ละชุดมีไฟล์ `index.html`, `cart.html`, `checkout.html` และ `app.js` ของตัวเอง)
  - `minimax/` ใช้เป็น frontend ที่ออกแบบโดย Minimax (ไฟล์ `index.html`, `app.js` เป็นต้น)
  - `glm/` เป็น frontend ตัวอย่างอีกชุดที่แสดงการออกแบบโดย GLM
- Backend API: ไฟล์ PHP อยู่ในโฟลเดอร์ `api/` (หลักคือ `index.php` ใช้ Haekkhon PHP Framework เป็น router และ `db.php` สำหรับเชื่อมต่อฐานข้อมูล) ใช้ร่วมกัน
- Database: MySQL (ตัวอย่างชื่อฐานข้อมูลที่ตั้งค่าเริ่มต้นคือ `book_store`) — ตารางหลักคือ `books` และ `categories` (สามารถขยายเป็น `authors`, `orders` ฯลฯ ได้)

## โครงสร้างไฟล์ที่สำคัญ

- `minimax/` — frontend assets (HTML, CSS, JS)
- `glm/` — alternative frontend prototype (HTML, CSS, JS)
- `api/` — API entrypoint และ DB helper
  - `api/index.php` — routes สำหรับ API (เช่น `/api/books`, `/api/categories`, `/api/book`)
  - `api/db.php` — helper สำหรับเชื่อมต่อ MySQL (แก้ค่าได้จาก environment variables หรือไฟล์)
- `framework/haekkhon.php` — micro PHP Framework router/utility สำหรับ API

## ฟีเจอร์สำคัญของตัวอย่าง

- ค้นหา และกรองตามหมวดหมู่และช่วงราคา
- ตะกร้าสินค้า (localStorage) พร้อมคำนวณยอดรวมและภาษีตัวอย่าง
- หน้า checkout พร้อมการจำลองการชำระเงินและสรุปคำสั่งซื้อ
- API สำหรับดึงหนังสือและหมวดหมู่

## การติดตั้งและรัน (อย่างรวดเร็ว)

ต้องการ: PHP >= 7.4 (เพื่อรัน built-in server), MySQL/MariaDB

1. สร้างฐานข้อมูลและผู้ใช้ (ตัวอย่าง):

```sql
CREATE DATABASE IF NOT EXISTS book_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'book_user'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON book_store.* TO 'book_user'@'localhost';
FLUSH PRIVILEGES;
```

2. ปรับการตั้งค่าเชื่อมต่อฐานข้อมูล

แก้ไฟล์ `api/db.php` หรือกำหนด environment variables:

- DB_HOST (default: 127.0.0.1)
- DB_NAME (default: book_store)
- DB_USER (default: root)
- DB_PASS (default: '')

ตัวอย่างการตั้งค่าก่อนรัน (Linux/macOS):

```bash
export DB_HOST=127.0.0.1
export DB_NAME=book_store
export DB_USER=book_user
export DB_PASS=secret
```

3. สร้างตารางตัวอย่าง (SQL migration)

ตัวอย่าง schema ที่รองรับ API ในโปรเจ็ค วางในไฟล์ `schema.sql` (มีอยู่แล้ว) แล้วรันใน MySQL:

```sql
-- ตารางหมวดหมู่
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางหนังสือ (รองรับฟิลด์ที่ API คาดหวัง)
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  category_id INT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2) DEFAULT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INT DEFAULT 0,
  featured TINYINT(1) DEFAULT 0,
  description TEXT,
  cover VARCHAR(500),
  is_featured TINYINT(1) DEFAULT 0,
  stock INT DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

4. รันเว็บเซิร์ฟเวอร์แบบง่าย (สำหรับการพัฒนา)

จากโฟลเดอร์โปรเจ็ค root (`/path/to/book`) รัน:

```bash
php -S localhost:8000
```

แล้วเปิดเบราว์เซอร์ไปที่:

- Frontend (ตัวอย่าง): http://localhost:8000/minimax/index.html
- API (ตัวอย่าง): http://localhost:8000/api/ping

หมายเหตุ: ในการใช้งานจริงแนะนำใช้เว็บเซิร์ฟเวอร์อย่าง Apache หรือ Nginx และตั้ง DocumentRoot ให้ถูกต้อง

## API endpoints (สรุป)

- GET /api/ping — health check
- GET /api/books — ดึงรายการหนังสือ (query: search, limit, offset)
- GET /api/books/{id} — ดึงหนังสือโดย id
- GET /api/book?id=123 — alternative query param variant
- GET /api/books/featured — ดึงหนังสือ featured
- GET /api/categories — ดึงรายการหมวดหมู่

ตัวอย่างการเรียก (curl):

```bash
curl http://localhost:8000/api/categories
curl "http://localhost:8000/api/books?search=clean&limit=10"
```

## ข้อเสนอแนะ/งานต่อยอด

- เพิ่มตาราง `authors`, `orders`, `order_items` เพื่อรองรับกระบวนการสั่งซื้อจริง
- เพิ่มระบบ authentication (JWT) สำหรับการสั่งซื้อและดูประวัติคำสั่งซื้อ
- ปรับ API ให้รองรับ CORS รวมถึง csrf และเพิ่ม rate-limiting เมื่อเปิดใช้งานสาธารณะ
- เพิ่ม unit tests ให้กับ API (PHPUnit) และ E2E tests สำหรับ frontend (Puppeteer / Playwright)

## ทิ้งท้าย

โปรเจ็คนี้เป็นตัวอย่างการออกแบบที่เน้นความเรียบง่าย โดยสอง AI (GLM และ Minimax) ช่วยออกแบบและ prototype frontend/backed ร่วมกัน
