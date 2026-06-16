'use client'

import React, { useState } from 'react'

interface AuthCardProps {
  onLoginSuccess: () => void
}

import { createClient } from '@/lib/supabase/client'

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
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        })
        if (error) throw error
        setSuccessMsg('Registrasi berhasil! Cek email Anda untuk konfirmasi (jika diaktifkan) atau langsung login.')
        setIsRegistering(false)
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
    <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {isRegistering ? 'Daftar Akun Baru' : 'Masuk ke Focus & Doa'}
      </h2>

      {errorMsg && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-800"
              placeholder="Arif"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-800"
            placeholder="arif@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-800"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : isRegistering ? 'Daftar' : 'Masuk'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        {isRegistering ? (
          <p>
            Sudah punya akun?{' '}
            <button
              onClick={() => setIsRegistering(false)}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        ) : (
          <p>
            Belum punya akun?{' '}
            <button
              onClick={() => setIsRegistering(true)}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Daftar Sekarang
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
