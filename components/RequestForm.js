'use client';

import { useState, useEffect } from 'react';

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]); // Store the list of sites here

  // 1. Fetch the Sites from Airtable when the page loads
  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/sites');
        const data = await res.json();
        if (data.sites) setSites(data.sites);
      } catch (error) {
        console.error("Could not load sites", error);
      }
    }
    fetchSites();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = {
      serviceType: e.target.serviceType.value,
      location: e.target.location.value, // This will now send the Site Name
      priority: e.target.priority.value,
      description: e.target.description.value,
      date: e.target.date.value,
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) setSuccess(true);
      else alert("Error submitting request");
    } catch (err) {
      alert("Network error");
    }
    
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
      
      {/* UPDATED SERVICE TYPES TO MATCH YOUR SCREENSHOT */}
      <div>
        <label className="block text-sm font-medium mb-1">Service Type</label>
        <select name="serviceType" className="w-full p-2 border rounded bg-white" required>
          <option value="" disabled selected>Select a service...</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Supplies">Supplies</option>
          <option value="Plumbing">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="Carpentry">Carpentry</option>
          <option value="IT Support">IT Support</option>
          <option value="Pest Control">Pest Control</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Janitorial">Janitorial</option>
          <option value="Security">Security</option>
          <option value="Safety">Safety</option>
        </select>
      </div>

      {/* NEW DYNAMIC LOCATION DROPDOWN */}
      <div>
        <label className="block text-sm font-medium mb-1">Location / Site</label>
        {sites.length > 0 ? (
          <select name="location" className="w-full p-2 border rounded bg-white" required>
            <option value="" disabled selected>Select a site...</option>
            {sites.map(site => (
              <option key={site.id} value={site.name}>
                {site.name}
              </option>
            ))}
          </select>
        ) : (
          // Fallback to text input if sites fail to load
          <input name="location" type="text" className="w-full p-2 border rounded" placeholder="Loading sites..." required />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select name="priority" className="w-full p-2 border rounded bg-white">
            <option>Normal</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows="3" className="w-full p-2 border rounded" placeholder="Details..."></textarea>
      </div>

      <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors">
        {loading ? 'Sending...' : 'Submit Request'}
      </button>
    </form>
  );
}