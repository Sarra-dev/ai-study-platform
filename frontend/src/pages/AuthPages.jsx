import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', background: 'rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 12, marginBottom: 16
          }}>
            <Sparkles size={28} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{subtitle}</p>
        </div>
        <div className="card" style={{ borderRadius: 16 }}>{children}</div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your study platform">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className="btn-primary"
          style={{ width: '100%', padding: '12px', marginTop: 8, fontSize: 15 }}
          disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Register</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Start your AI-powered study journey">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input placeholder="yourname" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Min. 6 characters" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
        </div>
        <button type="submit" className="btn-primary"
          style={{ width: '100%', padding: '12px', marginTop: 8, fontSize: 15 }}
          disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
