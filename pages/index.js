// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [bucket, setBucket] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(
        `https://nq9nrz0shi.execute-api.ap-southeast-2.amazonaws.com/default/scan?bucket=${bucket}&region=${region}`
      );
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">🔍 Kumo24 Bucket Scanner</h1>

        <input
          type="text"
          placeholder="S3 Bucket Name"
          value={bucket}
          onChange={(e) => setBucket(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="AWS Region (e.g., us-east-1)"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />

        <button
          onClick={handleScan}
          disabled={loading || !bucket || !region}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Scanning...' : 'Scan Bucket'}
        </button>

        {error && <p className="mt-4 text-red-600 font-medium">❌ {error}</p>}

        {result && (
          <div className="mt-6 text-sm">
            <h2 className="font-bold text-lg mb-2">✅ Scan Result</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
