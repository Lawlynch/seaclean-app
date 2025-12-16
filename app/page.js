'use client';

import { useState } from 'react';
import RequestForm from '@/components/RequestForm';

export default function Home() {
  const [user, setUser] = useState(null); // Stores logged-in user info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user); // Login Success! Switch to Form.
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">SeaClean</h1>
          <p className="text-slate-500 mt-2">Client Portal & Staff Access</p>
        </div>

        {/* LOGIC SWITCH: If User exists, show Form. If not, show Login. */}
        {user ? (
          <div className="animate-fade-in">
             {/* Pass the User data to the form so it knows who is asking */}
            <RequestForm user={user} />
            <button 
              onClick={() => setUser(null)} 
              className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline w-full text-center"
            >
              Log Out
            </button>
          </div>
        ) : (
<form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Client Login</h2>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
                {/* NEW: Forgot Password Link */}
                <div className="text-right mt-1">
                  <a 
                    href={`mailto:portal@seaclean.com?subject=Password Reset Request&body=Hello Admin,%0D%0A%0D%0APlease reset the password for my account associated with this email address.`}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800 transition-colors"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}