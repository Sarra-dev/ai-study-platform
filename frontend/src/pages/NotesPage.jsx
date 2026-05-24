import React, { useEffect, useState, useRef } from 'react'
import { notesApi } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Sparkles, BookOpen, X, Search, FileDown, Tag, Filter } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ── Quill lazy loader ────────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Inject Quill CSS once
    if (!document.getElementById('quill-css')) {
      const link = document.createElement('link')
      link.id = 'quill-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css'
      document.head.appendChild(link)
    }

    // Load Quill JS then init
    if (window.Quill) {
      initQuill()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js'
      script.onload = initQuill
      document.head.appendChild(script)
    }

    return () => {
      quillRef.current = null
    }
  }, [])

  function initQuill() {
    if (!containerRef.current || quillRef.current) return
    const quill = new window.Quill(containerRef.current, {
      theme: 'snow',
      placeholder: 'Write your lesson notes here…',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link'],
          ['clean'],
        ],
      },
    })

    // Set initial content
    if (value) quill.root.innerHTML = value

    quill.on('text-change', () => {
      onChange(quill.root.innerHTML)
    })

    quillRef.current = quill
    setReady(true)
  }

  // Sync external value changes (e.g. opening a different note for edit)
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || ''
    }
  }, [value])

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ minHeight: 200, fontSize: 14 }} />
      <style>{`
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--border) !important; background: #f8fafc; }
        .ql-container { border: none !important; font-family: inherit; font-size: 14px; }
        .ql-editor { min-height: 160px; padding: 12px 14px; }
        .ql-editor.ql-blank::before { color: var(--text-muted); font-style: normal; }
      `}</style>
    </div>
  )
}

// ── Strip HTML tags to get plain text for display/PDF ────────────────────────
function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// ── PDF export ───────────────────────────────────────────────────────────────
async function exportToPdf(note) {
  // Load jsPDF on demand
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const margin = 18
  const pageW = doc.internal.pageSize.getWidth()
  const maxW = pageW - margin * 2
  let y = margin

  const addText = (text, size, style = 'normal', color = [15, 23, 42]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, maxW)
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += size * 0.45
    })
    y += 2
  }

  // Header bar
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageW, 12, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('AI Study Platform', margin, 8)
  y = 22

  // Title
  addText(note.title, 20, 'bold', [15, 23, 42])

  // Meta row
  const meta = [note.subject && `Subject: ${note.subject}`, note.tags && `Tags: ${note.tags}`]
    .filter(Boolean).join('   ·   ')
  if (meta) addText(meta, 9, 'normal', [100, 116, 139])
  y += 2

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, pageW - margin, y)
  y += 6

  // Content
  addText('Content', 12, 'bold', [30, 41, 59])
  addText(stripHtml(note.content), 11, 'normal', [51, 65, 85])
  y += 4

  // AI Summary
  if (note.aiSummary) {
    doc.setFillColor(240, 244, 255)
    const summaryText = stripHtml(note.aiSummary)
    const summaryLines = doc.splitTextToSize(summaryText, maxW - 8)
    const boxH = summaryLines.length * 5.5 + 18
    if (y + boxH > 270) { doc.addPage(); y = margin }
    doc.roundedRect(margin, y, maxW, boxH, 3, 3, 'F')
    y += 6
    addText('✦ AI Summary', 11, 'bold', [99, 102, 241])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    summaryLines.forEach(line => {
      doc.text(line, margin + 4, y)
      y += 5.5
    })
    y += 4
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(`Exported ${new Date().toLocaleDateString()}`, margin, 290)

  doc.save(`${note.title.replace(/\s+/g, '_')}.pdf`)
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [viewNote, setViewNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', subject: '', tags: '' })
  const [summarizing, setSummarizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // ── Search / filter state ────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  useEffect(() => { loadNotes() }, [])

  const loadNotes = async () => {
    try {
      const { data } = await notesApi.getAll()
      setNotes(data)
    } catch { toast.error('Failed to load notes') }
    finally { setLoading(false) }
  }

  // ── Derived: unique subjects for filter dropdown ─────────────────────────
  const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))]

  // ── Filtered notes ───────────────────────────────────────────────────────
  const filtered = notes.filter(note => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      note.title?.toLowerCase().includes(q) ||
      note.subject?.toLowerCase().includes(q) ||
      note.tags?.toLowerCase().includes(q) ||
      stripHtml(note.content || '').toLowerCase().includes(q)
    const matchesSubject = !filterSubject || note.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  const openCreate = () => {
    setForm({ title: '', content: '', subject: '', tags: '' })
    setModal('create')
  }

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content, subject: note.subject || '', tags: note.tags || '' })
    setModal(note)
  }

  const handleSave = async () => {
    if (!form.title || !form.content || form.content === '<p><br></p>') {
      return toast.error('Title and content are required')
    }
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

  const handleExport = async (note) => {
    setExporting(true)
    try {
      await exportToPdf(note)
      toast.success('PDF exported!')
    } catch { toast.error('Failed to export PDF') }
    finally { setExporting(false) }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Notes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            {filtered.length} of {notes.length} notes
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* ── Search & filter bar ── */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 14px', alignItems: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, subject, tags or content…"
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 14,
            background: 'transparent', minWidth: 160, padding: 0
          }}
        />
        {subjects.length > 0 && (
          <>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <Filter size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              style={{
                border: 'none', outline: 'none', fontSize: 13, background: 'transparent',
                color: filterSubject ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', padding: 0, fontWeight: filterSubject ? 600 : 400
              }}
            >
              <option value="">All subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        )}
        {(search || filterSubject) && (
          <button onClick={() => { setSearch(''); setFilterSubject('') }}
            style={{
              background: '#fee2e2', color: '#dc2626', border: 'none',
              borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500
            }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Notes grid ── */}
      {loading ? (
        <div className="loading"><div className="spinner" />Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No notes yet</h3>
          <p>Create your first note to get started</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={40} />
          <h3>No results</h3>
          <p>Try a different search term or clear the filter</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(note => (
            <div key={note.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => setViewNote(note)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, flex: 1, marginRight: 8 }}>{note.title}</h3>
                <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                  <button title="Export PDF" style={{
                    background: '#f0fdf4', color: '#16a34a', border: 'none',
                    borderRadius: 6, padding: '4px 7px', cursor: 'pointer'
                  }} onClick={() => handleExport(note)} disabled={exporting}>
                    <FileDown size={13} />
                  </button>
                  <button className="btn-secondary" style={{ padding: '4px 8px' }}
                    onClick={() => openEdit(note)}><Edit size={14} /></button>
                  <button className="btn-danger" style={{ padding: '4px 8px' }}
                    onClick={() => handleDelete(note.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Subject + tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {note.subject && (
                  <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                    {note.subject}
                  </span>
                )}
                {note.tags && note.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="badge"
                    style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>

              <p style={{
                fontSize: 13, color: 'var(--text-muted)', marginBottom: 12,
                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
              }}>
                {stripHtml(note.content)}
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
                    <Sparkles size={12} /> {summarizing ? 'Summarizing…' : 'AI Summarize'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── View modal ── */}
      {viewNote && (
        <Modal onClose={() => setViewNote(null)} title={viewNote.title} wide>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            {viewNote.subject && (
              <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                {viewNote.subject}
              </span>
            )}
            {viewNote.tags && viewNote.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="badge" style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Tag size={10} />{tag}
              </span>
            ))}
            <button onClick={() => handleExport(viewNote)} disabled={exporting}
              style={{
                marginLeft: 'auto', background: '#f0fdf4', color: '#16a34a',
                border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 12px',
                fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}>
              <FileDown size={14} /> {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>Content</div>
            {/* Render rich HTML content */}
            <div
              className="note-content-view"
              dangerouslySetInnerHTML={{ __html: viewNote.content }}
              style={{ fontSize: 14, lineHeight: 1.7 }}
            />
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
              <Sparkles size={15} /> {summarizing ? 'Generating summary…' : 'Generate AI Summary'}
            </button>
          )}
        </Modal>
      )}

      {/* ── Create / Edit modal ── */}
      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === 'create' ? 'New Note' : 'Edit Note'} wide>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Note title" />
          </div>
          <div className="form-group">
            <label>Content</label>
            <RichEditor
              value={form.content}
              onChange={content => setForm(f => ({ ...f, content }))}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Math" />
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. exam, chapter1" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </Modal>
      )}

      {/* Styles for rich content view */}
      <style>{`
        .note-content-view h1, .note-content-view h2, .note-content-view h3 { font-weight: 600; margin: 10px 0 6px; }
        .note-content-view ul, .note-content-view ol { padding-left: 22px; margin: 6px 0; }
        .note-content-view li { margin: 3px 0; }
        .note-content-view blockquote { border-left: 3px solid #6366f1; padding-left: 12px; color: var(--text-muted); margin: 8px 0; }
        .note-content-view code { background: rgba(99,102,241,0.1); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .note-content-view pre { background: #1e1b4b; color: #e0e7ff; padding: 12px; border-radius: 8px; overflow-x: auto; }
        .note-content-view strong { font-weight: 600; }
        .note-content-view a { color: var(--primary); }
      `}</style>
    </div>
  )
}

function Modal({ children, onClose, title, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: wide ? 720 : 520,
        maxHeight: '90vh', overflowY: 'auto', borderRadius: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}