import { useState } from 'react';

export default function Onboarding() {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const res = await fetch('/api/save-aws-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey, secretKey, region }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('success');
    } else {
      setStatus(`error: ${data.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">🔐 Connect Your AWS</h1>
        <input
          type="text"
          placeholder="AWS Access Key ID"
          className="w-full p-2 border border-gray-300 rounded"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="AWS Secret Access Key"
          className="w-full p-2 border border-gray-300 rounded"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="AWS Region (e.g. us-east-1)"
          className="w-full p-2 border border-gray-300 rounded"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          Save & Start First Scan
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-sm text-center mt-2">
            ✅ Credentials saved and first scan started!
          </p>
        )}
        {status && status !== 'submitting' && status !== 'success' && (
          <p className="text-red-600 text-sm text-center mt-2">{status}</p>
        )}
      </form>
    </div>
  );
}