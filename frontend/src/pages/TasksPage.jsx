import React, { useEffect, useState } from 'react'
import { tasksApi } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, X, CheckSquare, Circle, Clock } from 'lucide-react'

const STATUSES = [
  { key: 'TODO', label: 'To Do', color: '#64748b', bg: '#f1f5f9', icon: Circle },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  { key: 'DONE', label: 'Done', color: '#10b981', bg: '#f0fdf4', icon: CheckSquare },
]

const PRIORITIES = {
  HIGH: { label: 'High', color: '#ef4444', bg: '#fee2e2' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  LOW: { label: 'Low', color: '#10b981', bg: '#f0fdf4' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', priority:'MEDIUM', dueDate:'', subject:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const { data } = await tasksApi.getAll()
      setTasks(data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      const { data } = await tasksApi.create({ ...form, status: 'TODO' })
      setTasks([data, ...tasks])
      setModal(false)
      toast.success('Task created')
    } catch { toast.error('Failed to create task') }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await tasksApi.updateStatus(id, newStatus)
      setTasks(tasks.map(t => t.id === id ? data : t))
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async (id) => {
    try {
      await tasksApi.delete(id)
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const byStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:700 }}>Tasks</h1>
          <p style={{ color:'var(--text-muted)',fontSize:14,marginTop:2 }}>{tasks.length} tasks</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({title:'',description:'',priority:'MEDIUM',dueDate:'',subject:''}); setModal(true) }}
          style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
          {STATUSES.map(({ key, label, color, bg, icon: Icon }) => (
            <div key={key}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                <Icon size={16} color={color} />
                <span style={{ fontWeight:600,fontSize:14 }}>{label}</span>
                <span style={{ marginLeft:'auto', background:bg, color, borderRadius:999, padding:'1px 8px', fontSize:12, fontWeight:600 }}>
                  {byStatus(key).length}
                </span>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {byStatus(key).map(task => (
                  <div key={task.id} className="card" style={{ padding:14 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                      <span style={{ fontWeight:600,fontSize:13,flex:1,marginRight:8 }}>{task.title}</span>
                      <button className="btn-danger" style={{ padding:'2px 6px', flexShrink:0 }}
                        onClick={() => handleDelete(task.id)}><Trash2 size={12} /></button>
                    </div>
                    {task.description && (
                      <p style={{ fontSize:12,color:'var(--text-muted)',marginBottom:8 }}>{task.description}</p>
                    )}
                    <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:8 }}>
                      {PRIORITIES[task.priority] && (
                        <span className="badge" style={{
                          background: PRIORITIES[task.priority].bg,
                          color: PRIORITIES[task.priority].color,
                          fontSize:11
                        }}>{PRIORITIES[task.priority].label}</span>
                      )}
                      {task.dueDate && (
                        <span className="badge" style={{ background:'#f0f9ff',color:'#0369a1',fontSize:11 }}>
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                    <select value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value)}
                      style={{ fontSize:12,padding:'5px 8px' }}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                ))}
                {byStatus(key).length === 0 && (
                  <div style={{ textAlign:'center',padding:'20px 10px',color:'var(--text-muted)',fontSize:13,
                    border:'2px dashed var(--border)',borderRadius:10 }}>
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20 }}>
          <div className="card" style={{ width:'100%',maxWidth:480,borderRadius:16 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
              <h2 style={{ fontSize:18,fontWeight:700 }}>New Task</h2>
              <button onClick={() => setModal(false)} className="btn-secondary" style={{ padding:'4px 8px' }}><X size={16}/></button>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What needs to be done?" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Details..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Math" />
            </div>
            <div style={{ display:'flex',gap:8,justifyContent:'flex-end' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
