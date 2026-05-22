import React, { useEffect, useState } from 'react'
import { quizzesApi } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Sparkles, Brain, X, CheckCircle, XCircle } from 'lucide-react'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'generate' | 'create'
  const [activeQuiz, setActiveQuiz] = useState(null) // quiz being taken
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [genForm, setGenForm] = useState({ text: '', numberOfQuestions: 5, subject: '' })

  useEffect(() => { loadQuizzes() }, [])

  const loadQuizzes = async () => {
    try {
      const { data } = await quizzesApi.getAll()
      setQuizzes(data)
    } catch { toast.error('Failed to load quizzes') }
    finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    if (!genForm.text) return toast.error('Please enter text to generate quiz from')
    setGenerating(true)
    try {
      const { data } = await quizzesApi.generate(genForm)
      setQuizzes([data, ...quizzes])
      setModal(null)
      toast.success(`Quiz with ${data.questions?.length} questions generated!`)
    } catch { toast.error('Failed to generate quiz') }
    finally { setGenerating(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return
    try {
      await quizzesApi.delete(id)
      setQuizzes(quizzes.filter(q => q.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz)
    setAnswers({})
    setSubmitted(false)
  }

  const score = activeQuiz && submitted
    ? activeQuiz.questions.filter(q => answers[q.id] === q.correctAnswer).length
    : 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quizzes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{quizzes.length} quizzes</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setModal('create')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Manual
          </button>
          <button className="btn-primary" onClick={() => setModal('generate')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} /> AI Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state">
          <Brain size={48} />
          <h3>No quizzes yet</h3>
          <p>Generate a quiz with AI from your notes</p>
        </div>
      ) : (
        <div className="grid-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>{quiz.title}</h3>
                <button className="btn-danger" style={{ padding: '2px 6px' }}
                  onClick={() => handleDelete(quiz.id)}><Trash2 size={13} /></button>
              </div>
              {quiz.subject && (
                <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', marginBottom: 8, display: 'block', width: 'fit-content' }}>
                  {quiz.subject}
                </span>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                {quiz.questions?.length || 0} questions
              </p>
              <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}
                onClick={() => startQuiz(quiz)}>
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Generate modal */}
      {modal === 'generate' && (
        <Modal onClose={() => setModal(null)} title="Generate Quiz with AI" wide>
          <div style={{ marginBottom: 16 }}>
            <div className="ai-badge" style={{ marginBottom: 12 }}><Sparkles size={12} /> AI-Powered MCQ Generation</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Paste your study notes or any text and the AI will generate multiple choice questions for you.
            </p>
          </div>
          <div className="form-group">
            <label>Study Text / Notes</label>
            <textarea value={genForm.text}
              onChange={e => setGenForm({...genForm, text: e.target.value})}
              placeholder="Paste your lesson notes, textbook excerpt, or any educational text here..."
              rows={8} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Number of Questions</label>
              <select value={genForm.numberOfQuestions}
                onChange={e => setGenForm({...genForm, numberOfQuestions: Number(e.target.value)})}>
                {[3,5,8,10].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject (optional)</label>
              <input value={genForm.subject}
                onChange={e => setGenForm({...genForm, subject: e.target.value})}
                placeholder="e.g. Biology" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleGenerate} disabled={generating}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} /> {generating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </Modal>
      )}

      {/* Take quiz modal */}
      {activeQuiz && (
        <Modal onClose={() => setActiveQuiz(null)} title={activeQuiz.title} wide>
          {submitted && (
            <div style={{
              background: score >= activeQuiz.questions.length / 2 ? '#d1fae5' : '#fee2e2',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontWeight: 600, color: score >= activeQuiz.questions.length / 2 ? '#065f46' : '#991b1b'
            }}>
              Score: {score} / {activeQuiz.questions.length}
              ({Math.round(score / activeQuiz.questions.length * 100)}%)
            </div>
          )}
          {activeQuiz.questions?.map((q, i) => (
            <div key={q.id} style={{ marginBottom: 24 }}>
              <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>
                {i + 1}. {q.questionText}
              </p>
              {['A','B','C','D'].map(opt => {
                const val = q['option' + opt]
                const isSelected = answers[q.id] === opt
                const isCorrect = submitted && opt === q.correctAnswer
                const isWrong = submitted && isSelected && opt !== q.correctAnswer
                return (
                  <div key={opt} onClick={() => !submitted && setAnswers({...answers, [q.id]: opt})}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 14px', borderRadius: 8, marginBottom: 6, cursor: submitted ? 'default' : 'pointer',
                      border: `1px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isCorrect ? '#d1fae5' : isWrong ? '#fee2e2' : isSelected ? '#e0e7ff' : 'var(--bg)',
                      fontSize: 13,
                    }}>
                    {submitted && isCorrect && <CheckCircle size={15} color="#10b981" />}
                    {submitted && isWrong && <XCircle size={15} color="#ef4444" />}
                    <span style={{ fontWeight: 600, minWidth: 20 }}>{opt}.</span> {val}
                  </div>
                )
              })}
              {submitted && q.explanation && (
                <div style={{ fontSize: 12, color: '#6366f1', marginTop: 6, padding: '6px 10px',
                  background: '#e0e7ff', borderRadius: 6 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
          {!submitted ? (
            <button className="btn-primary" style={{ width: '100%', padding: 12 }}
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < (activeQuiz.questions?.length || 0)}>
              Submit Quiz
            </button>
          ) : (
            <button className="btn-secondary" style={{ width: '100%' }}
              onClick={() => { setAnswers({}); setSubmitted(false) }}>
              Try Again
            </button>
          )}
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, title, wide }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20 }}>
      <div className="card" style={{ width:'100%',maxWidth:wide?700:520,maxHeight:'90vh',overflowY:'auto',borderRadius:16 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <h2 style={{ fontSize:18,fontWeight:700 }}>{title}</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding:'4px 8px' }}><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}
