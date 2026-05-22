import React, { useEffect, useState } from 'react'
import { notesApi } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Sparkles, BookOpen, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | note object
  const [viewNote, setViewNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', subject: '', tags: '' })
  const [summarizing, setSummarizing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadNotes() }, [])

  const loadNotes = async () => {
    try {
      const { data } = await notesApi.getAll()
      setNotes(data)
    } catch { toast.error('Failed to load notes') }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm({ title: '', content: '', subject: '', tags: '' })
    setModal('create')
  }

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content, subject: note.subject || '', tags: note.tags || '' })
    setModal(note)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Title and content are required')
    setSaving(true)
    try {
      if (modal === 'create') {
        const { data } = await notesApi.create(form)
        setNotes([data, ...notes])
        toast.success('Note created')
      } else {
        const { data } = await notesApi.update(modal.id, form)
        setNotes(notes.map(n => n.id === modal.id ? data : n))
        toast.success('Note updated')
      }
      setModal(null)
    } catch { toast.error('Failed to save note') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return
    try {
      await notesApi.delete(id)
      setNotes(notes.filter(n => n.id !== id))
      if (viewNote?.id === id) setViewNote(null)
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleSummarize = async (note) => {
    setSummarizing(true)
    try {
      const { data } = await notesApi.summarize(note.id)
      setNotes(notes.map(n => n.id === note.id ? data : n))
      if (viewNote?.id === note.id) setViewNote(data)
      toast.success('Summary generated!')
    } catch { toast.error('Failed to summarize') }
    finally { setSummarizing(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Notes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{notes.length} notes</p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No notes yet</h3>
          <p>Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid-2">
          {notes.map(note => (
            <div key={note.id} className="card" style={{ cursor: 'pointer' }}
              onClick={() => setViewNote(note)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{note.title}</h3>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}
                    onClick={() => openEdit(note)}><Edit size={14} /></button>
                  <button className="btn-danger" style={{ padding: '4px 8px' }}
                    onClick={() => handleDelete(note.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {note.subject && (
                <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca', marginBottom: 8 }}>
                  {note.subject}
                </span>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12,
                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {note.content}
              </p>
              {note.aiSummary ? (
                <div style={{ fontSize: 12, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={12} /> AI summary available
                </div>
              ) : (
                <button className="btn-secondary" style={{ fontSize: 12, padding: '5px 10px', width: 'auto' }}
                  onClick={e => { e.stopPropagation(); handleSummarize(note) }}
                  disabled={summarizing}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} /> {summarizing ? 'Summarizing...' : 'AI Summarize'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {viewNote && (
        <Modal onClose={() => setViewNote(null)} title={viewNote.title} wide>
          {viewNote.subject && (
            <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca', marginBottom: 12, display: 'inline-block' }}>
              {viewNote.subject}
            </span>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>Content</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{viewNote.content}</div>
          </div>
          {viewNote.aiSummary && (
            <div className="ai-response">
              <div className="ai-badge"><Sparkles size={12} /> AI Summary</div>
              <ReactMarkdown>{viewNote.aiSummary}</ReactMarkdown>
            </div>
          )}
          {!viewNote.aiSummary && (
            <button className="btn-primary" onClick={() => handleSummarize(viewNote)} disabled={summarizing}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <Sparkles size={15} /> {summarizing ? 'Generating summary...' : 'Generate AI Summary'}
            </button>
          )}
        </Modal>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === 'create' ? 'New Note' : 'Edit Note'}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Note title" />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Write your lesson notes here..." rows={6} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Math" />
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="e.g. exam, chapter1" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, title, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: wide ? 700 : 520,
        maxHeight: '90vh', overflowY: 'auto', borderRadius: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '4px 8px' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
