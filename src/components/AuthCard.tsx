'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthCardProps {
  onLoginSuccess: () => void
}

export function AuthCard({ onLoginSuccess }: AuthCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}` 
        : 'https://focus-doa.vercel.app'

      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        })
        if (error) throw error
        setSuccessMsg('Pendaftaran berhasil! Silakan periksa email masuk atau folder spam untuk memverifikasi akun Anda.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onLoginSuccess()
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMsg(error.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isRegistering ? 'Mulai Langkah Baikmu' : 'Selamat Datang Kembali'}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isRegistering 
            ? 'Buat akun untuk melacak fokus, doa, dan ibadah harianmu.' 
            : 'Masuk untuk melanjutkan aktivitas produktif dan ibadahmu.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 mb-5 text-xs font-semibold text-red-700 bg-red-50/50 rounded-2xl border border-red-100 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-5 text-xs font-semibold text-emerald-700 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm text-gray-800 transition-all"
              placeholder="Arif Widi"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm text-gray-800 transition-all"
            placeholder="arif@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm text-gray-800 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-2xl hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Memproses...' : isRegistering ? 'Daftar Sekarang' : 'Masuk Akun'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
        {isRegistering ? (
          <p>
            Sudah memiliki akun?{' '}
            <button
              onClick={() => setIsRegistering(false)}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition"
            >
              Masuk
            </button>
          </p>
        ) : (
          <p>
            Belum terdaftar?{' '}
            <button
              onClick={() => setIsRegistering(true)}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition"
            >
              Mulai Daftar
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
