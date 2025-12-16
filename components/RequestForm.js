'use client';

import { useState, useEffect } from 'react';

// Accept 'user' as a prop
export default function RequestForm({ user }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/sites');
        const data = await res.json();
        
        if (data.sites) {
          // FILTER: Only keep sites that match the IDs in user.allowedSites
          // If the user has NO restricted sites (admin?), show all.
          // Assuming 'user.allowedSites' is an array of IDs like ['rec123', 'rec456']
          
          if (user.allowedSites && user.allowedSites.length > 0) {
            const mySites = data.sites.filter(site => user.allowedSites.includes(site.id));
            setSites(mySites);
          } else {
            // Fallback: If no specific sites assigned, maybe show none or all? 
            // For safety, let's show only assigned ones. If empty, show empty.
            setSites([]); 
          }
        }
      } catch (error) {
        console.error("Could not load sites", error);
      }
    }
    fetchSites();
  }, [user]); // Re-run if user changes

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = {
      serviceType: e.target.serviceType.value,
      location: e.target.location.value,
      priority: e.target.priority.value,
      description: e.target.description.value,
      date: e.target.date.value,
      userId: user.id // Send the real User ID now!
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) setSuccess(true);
      else alert("Error submitting request.");
    } catch (err) {
      alert("Network error.");
    }
    
    setLoading(false);
  }

  if (success) return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center text-green-800">
      <h3 className="text-xl font-bold">Request Sent!</h3>
      <p className="mt-2">Thank you, {user.name}</p>
      <button onClick={() => setSuccess(false)} className="mt-4 underline">New Request</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-900">Request Service</h2>
      
      {/* Service Type Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Service Type</label>
        <select name="serviceType" className="w-full p-2 border rounded bg-white" required defaultValue="">
          <option value="" disabled>Select a service...</option>
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

      {/* Location Dropdown - FILTERED BY USER */}
      <div>
        <label className="block text-sm font-medium mb-1">Location / Site</label>
        {sites.length > 0 ? (
          <select name="location" className="w-full p-2 border rounded bg-white" required defaultValue="">
            <option value="" disabled>Select a site...</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded">
            No approved sites found for your account. Please contact support.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Urgency</label>
          <select name="priority" className="w-full p-2 border rounded bg-white" defaultValue="Normal">
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows="3" className="w-full p-2 border rounded" placeholder="Details..."></textarea>
      </div>

      <button disabled={loading || sites.length === 0} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Sending...' : 'Submit Request'}
      </button>
    </form>
  );
}