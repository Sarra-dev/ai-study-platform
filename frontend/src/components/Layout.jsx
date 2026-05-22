import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, CheckSquare, Brain, MessageCircle,
  LogOut, LayoutDashboard, Menu, X, Sparkles
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
  { to: '/quizzes', icon: Brain, label: 'Quizzes' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/ai-chat', icon: MessageCircle, label: 'AI Chat' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:10 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1e1b4b', color: 'white',
        display: 'flex', flexDirection: 'column', padding: '0',
        position: 'fixed', height: '100vh', zIndex: 20,
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              borderRadius: 10, padding: 8, display: 'flex'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>AI Study</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Assistant Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'rgba(129,140,248,0.2)' : 'transparent',
                color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{user?.username}</div>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white',
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px'
          }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
