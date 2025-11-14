'use client'

interface TopbarProps {
  userRole?: string // Role dari database (contoh: "Super Admin", "Admin", "User")
}

export default function Topbar({ userRole = 'Admin' }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      {/* Kiri - Nama Aplikasi */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2 text-gray-800">
          📸 <span>PhotoBooth <span className="text-gray-600">Memories EndXYZ</span></span>
        </h1>
      </div>

      {/* Kanan - Info User */}
      <div className="text-right">
        <p className="text-sm text-gray-500 font-light">Selamat datang kembali,</p>
        <p className="text-lg font-semibold text-gray-800 leading-tight">{userRole} 👋</p>
      </div>
    </header>
  )
}
