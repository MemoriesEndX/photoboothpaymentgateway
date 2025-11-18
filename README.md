# 📸 Advanced Photo Booth Web App

**Next.js 15 • Prisma • PostgreSQL • NextAuth • Resend • Local Storage • Queue System • AI Agent Integration**

Aplikasi photobooth modern dengan fokus pada:

* **Keamanan dan privasi foto**
* **Private session storage**
* **Auto queue system**
* **Penyimpanan lokal di VPS / Server**
* Upgrade opsional: **S3 / GCS / R2**
* **NextAuth admin login**
* **Resend email integration**
* Middleware proteksi file berbasis session

---

## ✨ Features Overview

### 📸 Photo Capture

* Real-time webcam capture
* Single-photo mode
* Auto-save ke Prisma (`SinglePhoto`)
* Private folder per session

### 🎨 Editor Tools

* Stickers (fabric.js)
* Custom frames & backgrounds
* Photo strip 3–5 panel

### 🔒 Authentication (NextAuth)

* Credentials Provider (email + password)
* JWT-based session
* Admin-only dashboard

### 📧 Email Integration (Resend)

* Pengiriman link galeri
* Notifikasi event
* Bisa dikembangkan ke OTP/verification

### 🗂 Storage Options

**Default: Local Storage di Server / VPS**

```
/public/uploads/{sessionId}/{filename}.jpg
```

✔ Cocok untuk event
✔ Cepat, tanpa biaya storage
✔ Bisa dibuat private via middleware

**Optional Upgrade:**

* Amazon S3
* Google Cloud Storage
* Cloudflare R2

### 🔢 Queue System (Antrian)

* Pengunjung otomatis mendapat nomor antrian
* SessionId + queue number tersimpan di cookie
* Cocok untuk event photobooth besar

### 🧠 AI Agent Integration

* Validasi environment
* Cek koneksi database
* Memantau upload system
* Auto-debug engine

### 🌍 Additional Features

* i18n multi-language
* PWA-ready
* Responsive mobile

---

# 🧩 Key Features (Detail)

## 🔒 Private Photo Sessions

Setiap pengunjung mendapatkan sessionId unik.
Semua foto hanya bisa diakses oleh session tersebut.

```
/public/uploads/{sessionId}/
```

Middleware otomatis memblokir akses asing.

---

## 🔢 Queue System

* Pengunjung baru → auto-generate queue number
* Cocok untuk:

  * Event photobooth
  * Wedding photo corner
  * Booth expo / pameran

---

## 📸 Capture & Upload Flow

1. Browser → capture foto
2. Kirim ke API Next.js
3. API simpan ke local storage
4. Prisma mencatat metadata foto

---

## 🗄 Storage Layer

### **Local Storage** *(default & recommended)*

```
/public/uploads/sessionId/filename.jpg
```

### **Cloud Storage (Optional)**

Support:

* S3
* Google Cloud Storage
* Cloudflare R2

Prisma tetap menyimpan URL.

---

# 🚀 Quick Start

## 1. Clone Repo

```bash
git clone https://github.com/yourrepo/photobooth
cd photobooth
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Setup Environment

```bash
cp .env.example .env
```

Isi sesuai kebutuhan:

```env
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=xxxx
NEXTAUTH_URL=http://localhost:3000

# Storage
STORAGE_MODE=local

# Email
RESEND_API_KEY=your_api_key
SUPPORT_EMAIL=your@email
```

## 4. Setup Database

```bash
npx prisma migrate dev
```

## 5. Start Development

```bash
npm run dev
```

---

# 🏗 Architecture Overview

## 🎨 Frontend

* Next.js 15 (App Router)
* TailwindCSS
* React Server Components
* Dynamic import optimization

## 🔧 Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* Secure upload pipeline
* Session-bound filesystem

## 🗄 Storage Layer

### Local Mode

* Per-session folder
* Middleware access control
* Best for performance

### Cloud Mode

* S3/GCS/R2 ready
* Private/public mode

---

# 📦 Dependencies (FULL)

## **Main Dependencies**

| Package                    | Description              |
| -------------------------- | ------------------------ |
| @aws-sdk/client-s3         | Opsional untuk upload S3 |
| @prisma/client             | ORM database             |
| @radix-ui/*                | UI primitives            |
| fabric                     | Editor image engine      |
| framer-motion              | Animations               |
| next                       | App framework            |
| react                      | UI library               |
| resend                     | Email service            |
| next-auth                  | Authentication           |
| prisma                     | ORM engine               |
| bcrypt / bcryptjs          | Hash password            |
| html2canvas                | Screenshot               |
| lucide-react               | Icons                    |
| qrcode / qrcode.react      | QR generator             |
| nodemailer                 | Email (optional)         |
| tailwindcss / autoprefixer | Styling                  |
| uuid                       | ID generator             |
| clsx / cva                 | Class utilities          |
| next-themes                | Dark mode                |
| sonner                     | Toast UI                 |
| recharts                   | Analytics graphs         |

## **Dev Dependencies**

| Package                     | Description          |
| --------------------------- | -------------------- |
| prisma                      | Schema & migration   |
| typescript                  | TS support           |
| ts-node                     | Run TS scripts       |
| eslint + eslint-config-next | Linting              |
| prettier                    | Formatting           |
| postcss                     | Tailwind integration |
| @types/*                    | TS type definitions  |

---

# 🔧 Configuration Notes

### Browser Requirements

* HTTPS untuk akses kamera
* iOS/Android mobile tested
* Desktop Chrome/Firefox/Edge

### Camera Handling

* Full HD support
* Fallback detection jika kamera tidak ada

---

# 🐛 Troubleshooting

| Masalah                 | Penyebab             | Solusi                         |
| ----------------------- | -------------------- | ------------------------------ |
| Foto tidak tersimpan    | Permissions VPS      | `chmod -R 755 public/uploads`  |
| Session hilang          | Cookie tidak persist | Set domain & path secara benar |
| Kamera tidak terdeteksi | Tidak HTTPS          | Gunakan localhost atau HTTPS   |

---

# 📄 License

MIT License — bebas dipakai untuk proyek personal/komersial.

---

# 👨‍💻 Author & Support

Jika butuh bantuan integrasi NextAuth, Prisma, middleware, deployment VPS, atau setup AI Agent:

📧 Email: **[your-email@example.com](mailto:your-email@example.com)**
💬 ChatGPT: tinggal bilang **"lanjutkan setup"**

---

### **🆘 The Original Repository**

| Type | Where to Go | Description |
|------|-------------|-------------|
| 🐛 **Bug Reports** | [Create Issue](../../issues/new?template=bug_report.md) | Use our structured bug report template |
| ✨ **Feature Requests** | [Create Issue](../../issues/new?template=feature_request.md) | Suggest new features with detailed requirements |
| 📚 **Documentation** | [Create Issue](../../issues/new?template=documentation.md) | Help improve our guides and docs |
| 💬 **Questions** | [GitHub Discussions](../../discussions) | Ask questions and share ideas |
| � **Security Issues** | [gmail@tedyfazrin.com](mailto:gmail@tedyfazrin.com) | Private security vulnerability reporting |
| 📧 **Direct Contact** | [gmail@tedyfazrin.com](mailto:gmail@tedyfazrin.com) | General inquiries and business |

---
