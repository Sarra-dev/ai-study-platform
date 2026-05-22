import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notesApi, quizzesApi, tasksApi } from '../services/api'
import { BookOpen, Brain, CheckSquare, MessageCircle, Sparkles, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ notes: 0, quizzes: 0, tasks: 0, done: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([notesApi.getAll(), quizzesApi.getAll(), tasksApi.getAll()])
      .then(([n, q, t]) => {
        const tasks = t.data
        setStats({
          notes: n.data.length,
          quizzes: q.data.length,
          tasks: tasks.length,
          done: tasks.filter(t => t.status === 'DONE').length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Notes', value: stats.notes, icon: BookOpen, color: '#6366f1', to: '/notes' },
    { label: 'Quizzes', value: stats.quizzes, icon: Brain, color: '#8b5cf6', to: '/quizzes' },
    { label: 'Tasks', value: stats.tasks, icon: CheckSquare, color: '#10b981', to: '/tasks' },
    { label: 'Completed', value: stats.done, icon: TrendingUp, color: '#f59e0b', to: '/tasks' },
  ]

  const quickLinks = [
    { to: '/notes', label: 'Write a note', desc: 'Capture and organize your lessons', icon: BookOpen, color: '#6366f1' },
    { to: '/quizzes', label: 'Generate AI quiz', desc: 'Create MCQ from your notes', icon: Brain, color: '#8b5cf6' },
    { to: '/tasks', label: 'Add a task', desc: 'Track your study goals', icon: CheckSquare, color: '#10b981' },
    { to: '/ai-chat', label: 'Ask AI anything', desc: 'Your 24/7 study assistant', icon: MessageCircle, color: '#ec4899' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
          borderRadius: 16, padding: '28px 32px', color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Sparkles size={22} />
            <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>AI Study Platform</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
            Welcome back, {user?.username}! 👋
          </h1>
          <p style={{ opacity: 0.7 }}>
            Ready to learn? Your AI assistant is here to help.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {cards.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{
                background: color + '18', borderRadius: 12,
                padding: 14, color: color
              }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {loading ? '—' : value}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
      <div className="grid-2">
        {quickLinks.map(({ to, label, desc, icon: Icon, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${color}`, transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Icon size={18} color={color} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
