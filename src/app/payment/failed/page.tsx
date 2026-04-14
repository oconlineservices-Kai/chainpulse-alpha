export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Failed</h1>
        <p className="text-gray-400 mb-6">Something went wrong with your payment. Please try again.</p>
        <a href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4">
          Try Again
        </a>
        <a href="/" className="text-gray-400 hover:text-white">
          Go Home
        </a>
      </div>
    </div>
  );
}
