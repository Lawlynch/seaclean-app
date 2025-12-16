'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = {
      serviceType: e.target.serviceType.value,
      location: e.target.location.value,
      priority: e.target.priority.value,
      description: e.target.description.value,
      date: e.target.date.value,
    };

    const res = await fetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) setSuccess(true);
    setLoading(false);
  }

  if (success) return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center text-green-800">
      <h3 className="text-xl font-bold">Request Sent!</h3>
      <p className="mt-2">Head Office has been notified.</p>
      <button onClick={() => setSuccess(false)} className="mt-4 underline">New Request</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-900">Request Service</h2>
      
<div>
        <label className="block text-sm font-medium mb-1">Service Type</label>
        {/* These values MUST match your Airtable 'Service Type' options exactly */}
        <select name="serviceType" className="w-full p-2 border rounded" required>
          <option value="Plumbing">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="Carpentry">Carpentry</option>
          <option value="IT Support">IT Support</option>
          <option value="Pest Control">Pest Control</option>
          <option value="General Maintenance">General Maintenance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location / Site</label>
        <input name="location" type="text" className="w-full p-2 border rounded" required placeholder="e.g. Main Office" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select name="priority" className="w-full p-2 border rounded">
            <option>Normal</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows="3" className="w-full p-2 border rounded" placeholder="Details..."></textarea>
      </div>

      <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
        {loading ? 'Sending...' : 'Submit Request'}
      </button>
    </form>
  );
}