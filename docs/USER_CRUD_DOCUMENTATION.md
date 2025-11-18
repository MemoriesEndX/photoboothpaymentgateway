# User Management CRUD System

Complete CRUD system untuk User Management dengan Next.js 15, TypeScript, Prisma, dan Tailwind CSS.

## 📁 Struktur File

```
app/
├── api/
│   └── admin/
│       └── users/
│           ├── route.ts              # GET (list all), POST (create)
│           └── [id]/
│               └── route.ts          # GET (single), PUT (update), DELETE
├── admin/
│   └── users/
│       ├── page.tsx                  # List users page
│       ├── create/
│       │   └── page.tsx              # Create user page
│       └── edit/
│           └── [id]/
│               └── page.tsx          # Edit user page
```

---

## 🔌 API Endpoints

### 1. **GET /api/admin/users**
List semua users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "GUEST",
      "createdAt": "2025-11-18T00:00:00.000Z",
      "_count": {
        "photos": 5,
        "singlePhotos": 3
      }
    }
  ],
  "message": "Retrieved 1 users"
}
```

---

### 2. **POST /api/admin/users**
Create user baru

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "password": "password123",
  "role": "GUEST"
}
```

**Validation:**
- ✅ Email required & valid format
- ✅ Password required & min 6 characters
- ✅ Email harus unique
- ✅ Role: `SUPERADMIN` atau `GUEST`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "GUEST",
    "createdAt": "2025-11-18T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

---

### 3. **GET /api/admin/users/[id]**
Get single user by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SUPERADMIN",
    "createdAt": "2025-11-18T00:00:00.000Z",
    "_count": {
      "photos": 5,
      "singlePhotos": 3
    }
  }
}
```

---

### 4. **PUT /api/admin/users/[id]**
Update user

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "SUPERADMIN",
  "password": "newpassword123"
}
```

**Notes:**
- Semua field optional
- Password akan di-hash jika diberikan
- Email harus unique (kecuali email sendiri)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "SUPERADMIN",
    "createdAt": "2025-11-18T00:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

---

### 5. **DELETE /api/admin/users/[id]**
Delete user (CASCADE delete photos)

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUser": "user@example.com",
    "deletedPhotos": 5,
    "deletedSinglePhotos": 3
  }
}
```

---

## 🎨 Frontend Pages

### 1. **User List Page** (`/admin/users`)

**Features:**
- ✅ Table display dengan ID, Email, Name, Role, Photos count
- ✅ Create User button (blue)
- ✅ Edit button per user (green)
- ✅ Delete button per user (red)
- ✅ Confirm dialog sebelum delete
- ✅ Auto-refresh list setelah action
- ✅ Loading & error states

**UI Elements:**
- Table dengan border & hover effect
- Role badges (purple untuk SUPERADMIN, gray untuk GUEST)
- Action buttons dengan icons (Lucide React)
- Empty state jika belum ada users

---

### 2. **Create User Page** (`/admin/users/create`)

**Form Fields:**
- Email (required)
- Name (optional)
- Role (dropdown: GUEST/SUPERADMIN)
- Password (required, min 6 chars, show/hide toggle)

**Features:**
- ✅ Client-side validation
- ✅ Show/hide password toggle
- ✅ Confirm before cancel jika ada perubahan
- ✅ Auto-redirect ke list setelah sukses
- ✅ Error handling dengan toast notification

**Actions:**
- Create User (blue button)
- Cancel (gray button)

---

### 3. **Edit User Page** (`/admin/users/edit/[id]`)

**Form Fields:**
- Email (prefilled)
- Name (prefilled)
- Role (prefilled)
- Password (optional - kosong by default)

**Features:**
- ✅ Load existing data via API
- ✅ Only send changed fields ke API
- ✅ Password optional (leave blank = tidak diubah)
- ✅ Detect unsaved changes
- ✅ Confirm before cancel jika ada perubahan

**Actions:**
- Update User (green button)
- Cancel (gray button)

---

## 🔐 Security Features

1. **Password Hashing:**
   - Menggunakan `bcrypt` dengan 10 salt rounds
   - Password tidak pernah di-return dari API

2. **Validation:**
   - Email format validation
   - Password minimum length (6 characters)
   - Duplicate email check
   - Type-safe dengan TypeScript

3. **Error Handling:**
   - Try-catch di semua endpoints
   - Proper HTTP status codes
   - Clear error messages

---

## 🎯 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Password:** bcrypt
- **Client Components:** `'use client'`

---

## 📦 Dependencies Required

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "latest",
    "bcrypt": "^5.0.0",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "typescript": "^5.0.0",
    "prisma": "latest"
  }
}
```

---

## 🚀 Usage

### Akses Pages:
- **List:** `http://localhost:3000/admin/users`
- **Create:** `http://localhost:3000/admin/users/create`
- **Edit:** `http://localhost:3000/admin/users/edit/1`

### Test API (curl):

**Create User:**
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "GUEST"
  }'
```

**List Users:**
```bash
curl http://localhost:3000/api/admin/users
```

**Get Single User:**
```bash
curl http://localhost:3000/api/admin/users/1
```

**Update User:**
```bash
curl -X PUT http://localhost:3000/api/admin/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "role": "SUPERADMIN"
  }'
```

**Delete User:**
```bash
curl -X DELETE http://localhost:3000/api/admin/users/1
```

---

## ✅ Testing Checklist

- [ ] List users menampilkan semua data
- [ ] Create user dengan data valid
- [ ] Create user dengan email duplicate (harus error)
- [ ] Create user dengan password < 6 chars (harus error)
- [ ] Edit user - update email, name, role
- [ ] Edit user - update password
- [ ] Edit user tanpa perubahan (harus error)
- [ ] Delete user dengan confirmation
- [ ] Delete user cascade delete photos
- [ ] Form validation di frontend
- [ ] Loading states berfungsi
- [ ] Error states ditampilkan dengan benar

---

## 🎨 Styling Summary

### Colors:
- **Blue:** Create/Save actions
- **Green:** Update actions
- **Red:** Delete actions
- **Gray:** Cancel/Neutral actions

### Components:
- Rounded corners (`rounded-lg`)
- Shadow effects (`shadow-sm`)
- Hover transitions
- Disabled states dengan opacity

---

## 📝 Notes

- Semua kode production-ready
- Zero TypeScript errors
- Responsive design dengan Tailwind
- Native `fetch()` API (no external libraries)
- Async/await pattern
- Proper error boundaries

---

**Created by:** Senior Fullstack Engineer  
**Version:** 1.0.0  
**Date:** November 18, 2025
