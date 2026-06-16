'use client'

import React, { useState, useEffect } from 'react'
import { getDailyPlans, createDailyPlan, updateDailyPlan, deleteDailyPlan, DailyPlan } from '@/lib/db/dailyPlans'

export function PlannerTab() {
  const [plans, setPlans] = useState<DailyPlan[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<DailyPlan['priority']>('medium')
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true)
      const data = await getDailyPlans(todayStr)
      setPlans(data)
      setLoading(false)
    }
    loadPlans()
  }, [todayStr])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const loadPlans = async () => {
      setLoading(true)
      const data = await getDailyPlans(todayStr)
      setPlans(data)
      setLoading(false)
    }
    const newPlan = await createDailyPlan({
      plan_date: todayStr,
      title,
      description,
      priority,
      status: 'todo',
    })
    if (newPlan) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      loadPlans()
    }
  }

  const handleToggleStatus = async (plan: DailyPlan) => {
    if (!plan.id) return
    const nextStatusMap: Record<DailyPlan['status'], DailyPlan['status']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    }
    const nextStatus = nextStatusMap[plan.status]
    const loadPlans = async () => {
      setLoading(true)
      const data = await getDailyPlans(todayStr)
      setPlans(data)
      setLoading(false)
    }
    const success = await updateDailyPlan(plan.id, { status: nextStatus })
    if (success) loadPlans()
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    const loadPlans = async () => {
      setLoading(true)
      const data = await getDailyPlans(todayStr)
      setPlans(data)
      setLoading(false)
    }
    const success = await deleteDailyPlan(id)
    if (success) loadPlans()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Target Harian ({todayStr})</h2>

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
            placeholder="Judul Target Harian"
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
            placeholder="Catatan tambahan (opsional)"
          />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-500 font-medium">Prioritas:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as DailyPlan['priority'])}
            className="px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none text-gray-800"
          >
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
        >
          Tambah Target
        </button>
      </form>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat target...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
          Belum ada target untuk hari ini.
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition"
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleToggleStatus(p)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                    p.status === 'done'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : p.status === 'in_progress'
                      ? 'bg-amber-400 border-amber-400 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {p.status === 'done' ? '✓' : p.status === 'in_progress' ? '❯' : ''}
                </button>
                <div>
                  <h3
                    className={`text-sm font-semibold text-gray-800 ${
                      p.status === 'done' ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {p.title}
                  </h3>
                  {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.priority === 'high'
                          ? 'bg-red-50 text-red-600'
                          : p.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {p.priority === 'high' ? 'Tinggi' : p.priority === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {p.status === 'done' ? 'Selesai' : p.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Belum Dimulai'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
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
