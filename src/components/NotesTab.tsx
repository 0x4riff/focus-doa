'use client'

import React, { useState, useEffect } from 'react'
import { getNotes, createNote, deleteNote, Note } from '@/lib/db/notes'

export function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    const data = await getNotes()
    setNotes(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return
    const newNote = await createNote({
      title,
      body,
      category,
      note_date: todayStr,
    })
    if (newNote) {
      setTitle('')
      setBody('')
      setCategory('General')
      loadNotes()
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    const success = await deleteNote(id)
    if (success) loadNotes()
  }

  const categories = ['General', 'Ide', 'Syukur', 'Muhasabah', 'Target']

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Catatan Harian</h2>

      <form onSubmit={handleCreate} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm"
            placeholder="Judul Catatan"
          />
        </div>
        <div>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 text-sm h-24"
            placeholder="Tulis catatan Anda..."
          />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-500 font-medium">Kategori:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none text-gray-800"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
        >
          Simpan Catatan
        </button>
      </form>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Memuat catatan...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
          Belum ada catatan yang disimpan.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2 relative">
              <div className="flex justify-between items-start">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">
                  {n.category}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                >
                  Hapus
                </button>
              </div>
              <h3 className="text-sm font-bold text-gray-800">{n.title}</h3>
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{n.body}</p>
              <p className="text-[9px] text-gray-400 mt-1">{n.note_date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
