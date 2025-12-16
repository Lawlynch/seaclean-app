'use client';

import { useState, useEffect } from 'react';

export default function ClientRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/requests/client')
      .then(res => res.json())
      .then(data => {
        if (data.requests) setRequests(data.requests);
      });
  }, []);

  async function handleDecision(id, decision) {
    // Optimistic Update: Update the UI immediately
    setRequests(current =>
      current.map(r => r.id === id ? { ...r, approval: decision, status: decision === 'Approved' ? 'In Progress' : 'Cancelled' } : r)
    );

    // Send to API
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id, 
        // If Approved, flip status to "In Progress". If Rejected, maybe "Cancelled" or leave as is.
        status: decision === 'Approved' ? 'In Progress' : 'New Request', 
        customFields: { 'Client Approval': decision } 
      }),
    });
  }

  if (requests.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Active Requests</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-gray-500 font-bold border-b">
            <tr>
              <th className="p-4">Service</th>
              <th className="p-4">Status</th>
              <th className="p-4">Quote Details</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map(req => (
              <tr key={req.id}>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{req.service}</div>
                  <div className="text-xs text-gray-500">{new Date(req.date).toLocaleDateString()}</div>
                </td>
                
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                    req.status === 'Route for Approval' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    req.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {req.status}
                  </span>
                </td>

                <td className="p-4 text-sm">
                   {/* Only show quote details if they exist */}
                   {req.quotePrice ? (
                     <div>
                       <div className="font-bold text-green-700 text-lg">${req.quotePrice}</div>
                       <div className="text-gray-600 text-xs">{req.quoteDesc || 'No description provided'}</div>
                     </div>
                   ) : (
                     <span className="text-gray-400 text-xs italic">Pending Quote</span>
                   )}
                </td>

                <td className="p-4">
                  {/* CRITICAL LOGIC: Only show buttons if Status is 'Route for Approval' */}
                  {req.status === 'Route for Approval' ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleDecision(req.id, 'Approved')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                      >
                        ✅ Approve Quote
                      </button>
                      <button 
                        onClick={() => handleDecision(req.id, 'Rejected')}
                        className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      {req.approval === 'Approved' ? 'You approved this.' : 'No action needed.'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}