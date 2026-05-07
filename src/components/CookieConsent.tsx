'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'chainpulse-cookie-consent'

type ConsentChoice = 'accepted' | 'rejected' | null

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
    setVisible(false)
  }

  function handleReject() {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setConsent('rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in"
      style={{
        animation: 'fadeInUp 0.4s ease-out',
      }}
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white mb-1">🍪 Cookie Consent</p>
            <p>
              We use essential cookies for site security and analytics to improve
              your experience. You can choose which cookies to allow.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={handleReject}
              className="rounded-lg border border-slate-600 px-5 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
