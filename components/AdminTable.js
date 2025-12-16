'use client';

import { useState } from 'react';

export default function AdminTable({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);

  async function updateStatus(id, newStatus) {
    // 1. Optimistic Update
    setRequests(current => 
      current.map(req => req.id === id ? { ...req, status: newStatus } : req)
    );

    // 2. Send to API
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error('Update failed:', error);
      alert("Failed to save change");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto"> {/* Allows scrolling if table is too wide */}
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Urgency</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service & Site</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Description</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested By</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">No requests found.</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Date */}
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap font-mono">{req.date}</td>
                  
                  {/* Urgency Badge */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      req.urgency === 'Critical' || req.urgency === 'High' ? 'bg-red-100 text-red-700' :
                      req.urgency === 'Low' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>

                  {/* Service & Location (Combined for neatness) */}
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{req.serviceType}</div>
                    <div className="text-xs text-gray-500">{req.location}</div>
                  </td>

                  {/* Description (Truncated nicely) */}
                  <td className="p-4 text-sm text-gray-600 max-w-xs">
                    <div className="line-clamp-2" title={req.description}>
                      {req.description || <span className="text-gray-300 italic">No details</span>}
                    </div>
                  </td>

                  {/* Requested By */}
                  <td className="p-4 text-sm text-gray-700 font-medium">
                    {req.requestedBy}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'New Request' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      req.status === 'Scheduled' ? 'bg-green-50 text-green-700 border-green-200' : 
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="p-4">
                    {req.status !== 'Scheduled' && (
                      <button 
                        onClick={() => updateStatus(req.id, 'Scheduled')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-bold transition-all"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}