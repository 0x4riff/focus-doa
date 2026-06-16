'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getDailyPlans, createDailyPlan, updateDailyPlan, deleteDailyPlan, DailyPlan } from '@/lib/db/dailyPlans'

export function PlannerTab() {
  const [plans, setPlans] = useState<DailyPlan[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<DailyPlan['priority']>('medium')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null) // Micro-animation tracker

  const todayStr = new Date().toISOString().split('T')[0]

  const loadPlans = useCallback(async (showSilent = false) => {
    if (!showSilent) setLoading(true)
    const data = await getDailyPlans(todayStr)
    setPlans(data)
    setLoading(false)
  }, [todayStr])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    setActionId('create')
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
      await loadPlans(true)
    }
    setActionId(null)
  }

  const handleToggleStatus = async (plan: DailyPlan) => {
    if (!plan.id) return
    setActionId(plan.id)
    const nextStatusMap: Record<DailyPlan['status'], DailyPlan['status']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    }
    const nextStatus = nextStatusMap[plan.status]
    const success = await updateDailyPlan(plan.id, { status: nextStatus })
    if (success) {
      await loadPlans(true)
    }
    setActionId(null)
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    setActionId(id)
    const success = await deleteDailyPlan(id)
    if (success) {
      await loadPlans(true)
    }
    setActionId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800">Target Harian ({todayStr})</h2>

      <form onSubmit={handleCreate} className="p-5 bg-white rounded-3xl border border-gray-100/80 shadow-sm space-y-4">
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl outline-none text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            placeholder="Judul Target Harian"
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-2xl outline-none text-gray-800 text-sm h-20 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
            placeholder="Catatan tambahan (opsional)"
          />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Prioritas:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as DailyPlan['priority'])}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-xl outline-none text-gray-800 font-medium transition-all"
          >
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={actionId === 'create'}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          {actionId === 'create' ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Tambah Target</span>
          )}
        </button>
      </form>

      {loading ? (
        <div className="flex flex-col items-center py-10 space-y-2">
          <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider animate-pulse">Memuat...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
          🌱 Belum ada target untuk hari ini.
        </div>
      ) : (
        <div className="space-y-2.5">
          {plans.map((p) => {
            const isToggling = actionId === p.id
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow transition-all duration-300"
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => handleToggleStatus(p)}
                    disabled={isToggling}
                    className={`mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center text-xs transition-all duration-300 transform active:scale-90 ${
                      p.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : p.status === 'in_progress'
                        ? 'bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-400/20'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {isToggling ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : p.status === 'done' ? (
                      '✓'
                    ) : p.status === 'in_progress' ? (
                      '❯'
                    ) : (
                      ''
                    )}
                  </button>
                  <div>
                    <h3
                      className={`text-sm font-bold text-gray-800 transition-all ${
                        p.status === 'done' ? 'line-through text-gray-400 opacity-70' : ''
                      }`}
                    >
                      {p.title}
                    </h3>
                    {p.description && <p className="text-xs text-gray-400 mt-1">{p.description}</p>}
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          p.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : p.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {p.priority === 'high' ? 'Tinggi' : p.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {p.status === 'done' ? 'Selesai' : p.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Todo'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={isToggling}
                  className="text-gray-300 hover:text-red-500 active:scale-95 text-xs font-semibold px-2 py-1 transition-all"
                >
                  Hapus
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
