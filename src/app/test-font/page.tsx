export default function TestFontPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-text-primary text-3xl font-bold mb-8">Font Brightness Test</h1>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* OLD - Dull Colors */}
        <div className="bg-background-card border border-border rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">❌ OLD (Dull Colors)</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500 block mb-1">text-secondary (old: #94a3b8 / slate-400)</span>
              <p style={{ color: '#94a3b8' }} className="text-base">
                This is secondary text — old dull color #94a3b8
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">text-muted (old: #6b7280 / gray-500)</span>
              <p style={{ color: '#6b7280' }} className="text-base">
                This is muted text — old dull color #6b7280
              </p>
            </div>
          </div>
        </div>

        {/* NEW - Brighter Colors */}
        <div className="bg-background-card border border-border rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">✅ NEW (Brighter Colors)</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500 block mb-1">text-secondary (new: #cbd5e1 / slate-300, +40%)</span>
              <p className="text-text-secondary text-base">
                This is secondary text — new bright color #cbd5e1
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">text-muted (new: #9ca3af / gray-400, +30%)</span>
              <p className="text-text-muted text-base">
                This is muted text — new bright color #9ca3af
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline hex verification */}
      <div className="bg-background-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-white text-xl font-semibold mb-4">🔬 Hex Verification (inline styles)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#94a3b8' }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#cbd5e1' }}></div>
            <span style={{ color: '#94a3b8' }}>Old secondary #94a3b8</span>
            <span className="text-white">→</span>
            <span style={{ color: '#cbd5e1' }}>New secondary #cbd5e1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: '#9ca3af' }}></div>
            <span style={{ color: '#6b7280' }}>Old muted #6b7280</span>
            <span className="text-white">→</span>
            <span style={{ color: '#9ca3af' }}>New muted #9ca3af</span>
          </div>
        </div>
      </div>

      {/* Tailwind class test */}
      <div className="bg-background-card border border-border rounded-xl p-6">
        <h2 className="text-white text-xl font-semibold mb-4">🎨 Tailwind Class Test</h2>
        <p className="text-text-primary mb-2">text-text-primary → #ffffff (white)</p>
        <p className="text-text-secondary mb-2">text-text-secondary → should be #cbd5e1 (slate-300)</p>
        <p className="text-text-muted mb-2">text-text-muted → should be #9ca3af (gray-400)</p>
        <p className="text-xs text-gray-500 mt-4">
          If text-text-secondary and text-text-muted appear brighter than typical slate/gray,
          the Tailwind config is working correctly.
        </p>
      </div>
    </div>
  )
}
