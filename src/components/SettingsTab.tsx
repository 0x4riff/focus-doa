'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile, updateProfile } from '@/lib/db/profile'
import { getWeton } from '@/utils/javaneseCalendar'

export function SettingsTab() {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      const prof = await getCurrentProfile()
      if (prof) {
        setFullName(prof.full_name || '')
        setDob(prof.date_of_birth || '')
        setCity(prof.city || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const success = await updateProfile({
      full_name: fullName,
      date_of_birth: dob || null,
      city,
    })

    if (success) {
      setMsg('Profil berhasil disimpan.')
    } else {
      setMsg('Gagal menyimpan profil.')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const userWeton = dob ? getWeton(dob) : ''

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Pengaturan Profil</h2>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat profil...</div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSave} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-4">
            {msg && (
              <div className="p-2.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                {msg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir (Untuk Weton)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              {userWeton && (
                <p className="text-xs text-emerald-600 font-semibold mt-1.5">Weton Anda: {userWeton}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kota Asal (Untuk Jadwal Shalat)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Jakarta"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-100 transition"
          >
            Keluar dari Aplikasi
          </button>
        </div>
      )}
    </div>
  )
}
