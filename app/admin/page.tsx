import { cookies } from "next/headers"

export default function AdminPage() {
  const role = cookies().get("user_role")?.value

  if (role !== "SUPERADMIN") {
    return <p>Akses ditolak. Anda bukan Super Admin.</p>
  }

  return (
    <div>
      <h1>📸 Dashboard Super Admin</h1>
      <p>Lihat semua foto, kelola sistem, dan payment.</p>
    </div>
  )
}
