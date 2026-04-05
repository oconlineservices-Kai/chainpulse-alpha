// Whale Wallet Tracker
// Monitors whale wallet movements

const { ethers } = require('ethers')

const WHALE_WALLETS = [
  // Add tracked whale wallets here
]

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL)

async function checkWhaleActivity() {
  for (const wallet of WHALE_WALLETS) {
    try {
      const balance = await provider.getBalance(wallet)
      console.log(`Wallet ${wallet}: ${ethers.formatEther(balance)} ETH`)
    } catch (error) {
      console.error(`Error checking wallet ${wallet}:`, error)
    }
  }
}

module.exports = { checkWhaleActivity }
