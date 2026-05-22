import React, { useState, useRef, useEffect } from 'react'
import { aiApi } from '../services/api'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Send, User, Bot, Trash2, Lightbulb } from 'lucide-react'

const SUGGESTIONS = [
  "Explain the Pythagorean theorem with an example",
  "What is photosynthesis and why is it important?",
  "Summarize the main causes of World War I",
  "How does Newton's second law work?",
  "What is the difference between RAM and ROM?",
  "Explain DNA replication in simple terms",
]

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI study assistant powered by Claude. I can help you understand concepts, explain topics, answer questions, and support your learning. What would you like to learn today?",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMessage = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const context = messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
        .join('\n')

      const { data } = await aiApi.chat(msg, context)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      toast.error('Failed to get AI response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please check your API key and try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you study today?"
    }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10, padding: 8, display: 'flex'
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>AI Study Assistant</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Powered by Claude</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={clearChat}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', marginBottom: 16,
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: '4px 2px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start'
          }}>
            {/* Avatar */}
            <div style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white'
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'var(--surface)',
              color: msg.role === 'user' ? 'white' : 'var(--text)',
              borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
              padding: '12px 16px',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 14, lineHeight: 1.7,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              {msg.role === 'assistant' ? (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white'
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '4px 18px 18px 18px', padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#8b5cf6', opacity: 0.7,
                    animation: `bounce 1s ${delay}s infinite`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show when only welcome message) */}
      {messages.length === 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-muted)', fontSize: 12 }}>
            <Lightbulb size={13} /> Try asking:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '5px 12px', fontSize: 12,
                  color: 'var(--text)', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#6366f1' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '10px 10px 10px 16px',
        display: 'flex', alignItems: 'flex-end', gap: 10,
        boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your studies... (Enter to send)"
          rows={1}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontSize: 14, lineHeight: 1.5, maxHeight: 120,
            background: 'transparent', padding: 0
          }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
              : 'var(--border)',
            color: input.trim() && !loading ? 'white' : 'var(--text-muted)',
            border: 'none', borderRadius: 10, width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.15s', flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-weight: 600; margin: 10px 0 6px;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 20px; margin: 6px 0;
        }
        .markdown-body li { margin: 3px 0; }
        .markdown-body code {
          background: rgba(99,102,241,0.1); padding: 1px 5px;
          border-radius: 4px; font-family: monospace; font-size: 13px;
        }
        .markdown-body pre {
          background: #1e1b4b; color: #e0e7ff; padding: 12px;
          border-radius: 8px; overflow-x: auto; margin: 8px 0;
        }
        .markdown-body pre code { background: none; color: inherit; }
        .markdown-body p { margin: 4px 0; }
        .markdown-body strong { font-weight: 600; }
      `}</style>
    </div>
  )
}
