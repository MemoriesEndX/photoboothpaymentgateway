'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Images, Package, CreditCard, Users, Camera, DollarSign } from 'lucide-react'

// helper format
const fmt = (n: number) => n.toLocaleString('id-ID')

export default function PhotoAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({
    photos: 0,
    singlePhotos: 0,
    stripPhotoOriginals: 0,
    total: 0,
  })

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load stats')
        if (!mounted) return
        setCounts(data.counts)
      } catch (err: any) {
        console.error(err)
        if (mounted) setError(err.message ?? 'Error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStats()
    return () => {
      mounted = false
    }
  }, [])

  const stats = [
    {
      title: 'View Photos',
      // show total photos
      value: loading ? 'Loading...' : `${fmt(counts.total)} photos`,
      icon: <Images className="text-blue-600" />,
      color: 'bg-blue-100',
      link: 'admin/photos',
    },
    {
      title: 'Packages',
      value: '12 active',
      icon: <Package className="text-purple-600" />,
      color: 'bg-purple-100',
      link: 'admin/packages',
    },
    {
      title: 'Transactions',
      value: '432 total',
      icon: <CreditCard className="text-green-600" />,
      color: 'bg-green-100',
      link: 'admin/transactions',
    },
    {
      title: 'Payment Gateway',
      value: 'Online',
      icon: <DollarSign className="text-yellow-600" />,
      color: 'bg-yellow-100',
      link: 'admin/payment',
    },
    {
      title: 'Users',
      value: '249 members',
      icon: <Users className="text-pink-600" />,
      color: 'bg-pink-100',
      link: '/users',
    },
    {
      title: 'Photo Sessions',
      value: '7 booked',
      icon: <Camera className="text-indigo-600" />,
      color: 'bg-indigo-100',
      link: 'admin/sessions',
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">PhotoAdmin Dashboard</h1>
        <div className="text-sm text-gray-500">{loading ? 'Memuat...' : error ? `Error: ${error}` : `Total foto: ${fmt(counts.total)}`}</div>
      </div>

      {/* Statistik Cards Interaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Link href={s.link} key={s.title}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className={`p-5 rounded-xl shadow-md ${s.color} flex items-center justify-between cursor-pointer transition-all duration-300 hover:shadow-xl`}>
              <div>
                <p className="text-sm text-gray-500">{s.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">{s.value}</h2>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-inner">{s.icon}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Placeholder untuk grafik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-5 rounded-xl shadow-md h-64 flex items-center justify-center text-gray-400">Graph Placeholder</div>
        <div className="bg-white p-5 rounded-xl shadow-md h-64 flex items-center justify-center text-gray-400">Graph Placeholder</div>
        <div className="bg-white p-5 rounded-xl shadow-md h-64 flex items-center justify-center text-gray-400">Graph Placeholder</div>
      </div>
    </motion.div>
  )
}
