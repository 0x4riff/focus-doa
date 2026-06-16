'use client'

import React, { useState, useEffect } from 'react'
import { getReminders, createReminder, deleteReminder, Reminder } from '@/lib/db/reminders'

export function RemindersTab() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('08:00')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    setLoading(true)
    const data = await getReminders()
    setReminders(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !time) return
    const newRem = await createReminder({
      title,
      reminder_time: time,
      message,
      active_days: [0, 1, 2, 3, 4, 5, 6],
      is_active: true,
    })
    if (newRem) {
      setTitle('')
      setTime('08:00')
      setMessage('')
      loadReminders()
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    const success = await deleteReminder(id)
    if (success) loadReminders()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Reminder Kustom</h2>

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
            placeholder="Nama Pengingat (contoh: Dzikir Pagi)"
          />
        </div>
        <div>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
          />
        </div>
        <div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
            placeholder="Pesan pengingat harian (opsional)"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
        >
          Tambah Pengingat
        </button>
      </form>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat pengingat...</div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
          Belum ada pengingat yang dibuat.
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition">
              <div className="flex items-center space-x-3">
                <span className="text-lg">⏰</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{r.title}</h3>
                  {r.message && <p className="text-xs text-gray-500">{r.message}</p>}
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Pukul {r.reminder_time.slice(0, 5)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-gray-400 hover:text-red-500 text-xs font-semibold px-2 py-1"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
