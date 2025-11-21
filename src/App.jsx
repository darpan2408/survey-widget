
import { useEffect, useState } from 'react'
import './App.css'

const RATING_OPTIONS = [1, 2, 3, 4, 5]
const EMOJI_BY_SCORE = {
  1: { symbol: '😣', label: 'Not Satisfied' },
  2: { symbol: '😕', label: 'Slightly Satisfied' },
  3: { symbol: '😐', label: 'Neutral' },
  4: { symbol: '😊', label: 'Satisfied' },
  5: { symbol: '🤩', label: 'Very Satisfied' },
}
const CONFETTI_COLORS = ['#1d4ed8', '#2563eb', '#38bdf8', '#0ea5e9', '#22c55e', '#6366f1']
const MOOD_CLASSES = ['mood-low', 'mood-neutral', 'mood-happy', 'mood-wow']
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJUT-b4JIRrjsRZ3uqCVAGBe0'

const getMoodClass = (value) => {
  if (!value) return ''
  if (value <= 2) return 'mood-low'
  if (value === 3) return 'mood-neutral'
  if (value === 4) return 'mood-happy'
  return 'mood-wow'
}

function ConfettiBurst({ trigger }) {
  const [burstId, setBurstId] = useState(0)

  useEffect(() => {
    if (trigger) {
      setBurstId((id) => id + 1)
    }
  }, [trigger])

  if (!trigger) return null

  return (
    <div className="confetti-layer" key={burstId}>
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={`${burstId}-${index}`}
          className="confetti-piece"
          style={{
            backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.2}s`,
            animationDuration: `${0.9 + Math.random() * 0.6}s`,
            '--drift': `${Math.random() * 80 - 40}px`,
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')
  const isLowScore = score !== null && score <= 2

  useEffect(() => {
    const moodClass = getMoodClass(score)
    MOOD_CLASSES.forEach((cls) => document.body.classList.remove(cls))
    if (moodClass) {
      document.body.classList.add(moodClass)
    }
    return () => {
      MOOD_CLASSES.forEach((cls) => document.body.classList.remove(cls))
    }
  }, [score])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'NPS_WIDGET_RESET') {
        setScore(null)
        setFeedback('')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="app-shell">
      <ConfettiBurst trigger={score === 5} />
      <h1>How likely are you to recommend us?</h1>
      <p>Please rate us on a scale of 1 (not likely) to 5 (very likely).</p>

      <div
        className={`rating-bar ${isLowScore ? 'shake' : ''}`}
        role="radiogroup"
        aria-label="Star rating"
      >
        {RATING_OPTIONS.map((value) => {
          const isActive = score !== null && value <= score
          return (
            <button
              key={value}
              type="button"
              className={`star-button ${isActive ? 'active' : ''}`}
              onClick={() => setScore(value)}
              aria-checked={score === value}
              role="radio"
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3.2l2.8 5.7 6.3.9-4.5 4.4 1.1 6.4L12 17.8 6.3 20.6l1.1-6.4L2.9 9.8l6.3-.9L12 3.2z" />
              </svg>
            </button>
          )
        })}
      </div>
      {score !== null && (
        <div className={`emoji-feedback ${isLowScore ? 'emoji-shake' : ''}`} aria-live="polite">
          <span className="emoji" role="img" aria-label={EMOJI_BY_SCORE[score].label}>
            {EMOJI_BY_SCORE[score].symbol}
          </span>
          <span className="emoji-label">{EMOJI_BY_SCORE[score].label}</span>
        </div>
      )}

      {score !== null && score >= 4 && (
        <div className="follow-up positive">
          <h2>Thank you!</h2>
          <p>
            We appreciate your score. Could you spare a minute to share a quick review on Google?
          </p>
          <a className="review-link" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">
            Leave a Google review
          </a>
        </div>
      )}

      {score !== null && score <= 3 && (
        <div className="follow-up negative">
          <h2>We&apos;re sorry to hear that.</h2>
          <p>Please let us know what went wrong so we can improve.</p>
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            spellCheck={false}
          />
          <button
            className="submit-button"
            type="button"
            onClick={() => {
              if (!feedback.trim()) {
                alert('Please share a quick note so we can help.')
                return
              }
              alert('Thanks for letting us know. We are on it!')
              setFeedback('')
              setScore(null)
            }}
          >
            Submit feedback
          </button>
        </div>
      )}
    </div>
  )
}
export default App
