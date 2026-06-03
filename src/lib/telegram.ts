/**
 * ChainPulse Alpha — Telegram Broadcast Module
 *
 * Posts signals to the public @chainpulse_alpha channel.
 * Called after signal generation completes.
 *
 * Uses Telegram Bot HTTP API (no client library needed).
 */

const TELEGRAM_API = 'https://api.telegram.org/bot'

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured')
  return token
}

function getChannelId(): string {
  // Public channel username
  return '@chainpulse_alpha'
}

interface TelegramMessageResult {
  ok: boolean
  message_id?: number
  error?: string
}

// ── Post a text message to the channel ──────────────────────────────────────

export async function sendTelegramMessage(
  text: string,
  options: { parseMode?: 'HTML' | 'MarkdownV2'; disablePreview?: boolean } = {}
): Promise<TelegramMessageResult> {
  const token = getBotToken()
  const url = `${TELEGRAM_API}${token}/sendMessage`

  try {
    const body: Record<string, any> = {
      chat_id: getChannelId(),
      text,
      parse_mode: options.parseMode || 'HTML',
      disable_web_page_preview: options.disablePreview ?? true,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('[Telegram] API error:', data.description)
      return { ok: false, error: data.description }
    }

    return { ok: true, message_id: data.result?.message_id }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Telegram] Send failed:', msg)
    return { ok: false, error: msg }
  }
}

// ── Format a signal for Telegram channel post ───────────────────────────────

interface SignalForPost {
  tokenSymbol: string
  tokenName: string
  sentimentScore: number
  whaleConfidence: number
  correlationScore: number
  isDiamondSignal: boolean
  entryPrice: number
  currentPrice: number
  priceChangePct: number
  twitterMentions: number
}

const SIGNAL_EMOJIS: Record<string, string> = {
  BTC: '₿',
  ETH: '⟠',
  SOL: '◎',
  BNB: '◆',
  XRP: '✕',
  ADA: '🅰',
  DOT: '●',
  LINK: '⬡',
  MATIC: '⬠',
  AVAX: '▲',
  UNI: '🦄',
  ATOM: '⚛',
  LTC: 'Ł',
  FIL: '◉',
  APT: '△',
  ARB: '🌀',
  OP: '⏫',
  INJ: '⚡',
  NEAR: '○',
  SUI: '◈',
  SEI: '▣',
  TIA: '◬',
  PEPE: '🐸',
  DOGE: '🐕',
  SHIB: '💧',
  WIF: '🧢',
  BONK: '💀',
}

function emojiForToken(symbol: string): string {
  return SIGNAL_EMOJIS[symbol] || '💎'
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(8)}`
}

function changeEmoji(pct: number): string {
  if (pct > 5) return '🟢🚀'
  if (pct > 2) return '🟢'
  if (pct > 0) return '🔵'
  if (pct > -2) return '🟡'
  if (pct > -5) return '🟠'
  return '🔴'
}

export function formatSignalPost(signal: SignalForPost): string {
  const emoji = emojiForToken(signal.tokenSymbol)
  const changeEmoj = changeEmoji(signal.priceChangePct)
  const diamondBadge = signal.isDiamondSignal ? ' 💎⛏️' : ''
  const priceDir = signal.priceChangePct >= 0 ? '+' : ''

  let text = ''

  if (signal.isDiamondSignal) {
    text += `🚨🔷 <b>DIAMOND SIGNAL</b> 🔷🚨\n\n`
  }

  text += `${emoji} <b>${signal.tokenSymbol}</b> — ${signal.tokenName}${diamondBadge}\n`
  text += `━━━━━━━━━━━━━━━━\n`
  text += `💵 <b>Price:</b> ${formatPrice(signal.currentPrice)} (${changeEmoj} ${priceDir}${signal.priceChangePct.toFixed(2)}%)\n`
  text += `📊 <b>Sentiment:</b> ${signal.sentimentScore}/100\n`
  text += `🐋 <b>Whale Confidence:</b> ${signal.whaleConfidence}/100\n`
  text += `🔗 <b>Correlation:</b> ${signal.correlationScore}/100\n`
  text += `🐦 <b>Mentions:</b> ${signal.twitterMentions.toLocaleString()}\n\n`

  if (signal.isDiamondSignal) {
    text += `🔹 <b>Entry Zone:</b> ${formatPrice(signal.entryPrice)}\n`
    text += `🎯 <b>Target:</b> ${formatPrice(signal.entryPrice * 1.25)} (+25%)\n`
    text += `🛑 <b>Stop:</b> ${formatPrice(signal.entryPrice * 0.92)} (-8%)\n\n`
  }

  text += `━━━━━━━━━━━━━━━━\n`
  text += `🔗 <a href='https://chainpulsealpha.com/dashboard'>View Full Analysis →</a>\n`
  text += `━─────── ⋆⋅☆⋅⋆ ───────━`

  return text
}

// ── Post a batch of top signals to the channel ─────────────────────────────

export interface BatchPostResult {
  posted: number
  failed: number
  errors: string[]
}

export async function postTopSignalsToChannel(
  signals: SignalForPost[],
  maxPosts: number = 5
): Promise<BatchPostResult> {
  const result: BatchPostResult = { posted: 0, failed: 0, errors: [] }

  // Sort: diamond signals first, then by sentiment score
  const sorted = [...signals].sort((a, b) => {
    if (a.isDiamondSignal && !b.isDiamondSignal) return -1
    if (!a.isDiamondSignal && b.isDiamondSignal) return 1
    return b.sentimentScore - a.sentimentScore
  })

  const toPost = sorted.slice(0, maxPosts)

  for (const signal of toPost) {
    try {
      // Small delay between posts to avoid rate limits
      if (result.posted > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const text = formatSignalPost(signal)
      const res = await sendTelegramMessage(text)

      if (res.ok) {
        result.posted++
      } else {
        result.failed++
        result.errors.push(`${signal.tokenSymbol}: ${res.error}`)
      }
    } catch (error) {
      result.failed++
      result.errors.push(`${signal.tokenSymbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return result
}

// ── Post a daily roundup message ────────────────────────────────────────────

export async function postDailyRoundup(
  totalSignals: number,
  diamondSignals: number,
  topToken: string,
  topReturn: string
): Promise<TelegramMessageResult> {
  const text = `📅 <b>Daily Signal Roundup</b>\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📊 <b>Signals Generated:</b> ${totalSignals}\n` +
    `💎 <b>Diamond Signals:</b> ${diamondSignals}\n` +
    `🏆 <b>Top Performer:</b> ${topToken} (${topReturn})\n\n` +
    `🚀 <a href='https://chainpulsealpha.com'>Start Trading →</a>\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `━─────── ⋆⋅☆⋅⋆ ───────━`

  return sendTelegramMessage(text, { parseMode: 'HTML' })
}
