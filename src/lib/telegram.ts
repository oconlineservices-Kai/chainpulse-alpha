import TelegramBot from 'node-telegram-bot-api'

const bot = process.env.TELEGRAM_BOT_TOKEN 
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  : null

export async function notifyPremiumUser(userId: string, event: string) {
  if (!bot) return
  
  const messages: Record<string, string> = {
    subscription_activated: '🎉 Premium activated! You now have unlimited access to all alpha signals.',
    subscription_cancelled: 'Your subscription has been cancelled. You\'ll keep access until the end of your billing period.',
    credit_added: '💳 1 credit added to your account.',
    signal_unlocked: '🔓 Signal unlocked! Check your dashboard.',
  }
  
  // In production, lookup user's telegram chat ID from database
  console.log(`Notification for user ${userId}: ${messages[event] || event}`)
}

export { bot }
