'use client';

import { useState } from 'react';

export default function AdminTable({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);

  async function updateStatus(id, newStatus) {
    // 1. Optimistic Update (Instant UI change)
    setRequests(current => 
      current.map(req => req.id === id ? { ...req, status: newStatus } : req)
    );

    // 2. Send to API
    try {
      await fetch('/api/requests/route', { // Ensure path matches your folder structure
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-sm font-semibold">Service</th>
            <th className="p-4 text-sm font-semibold">Location</th>
            <th className="p-4 text-sm font-semibold">Date</th>
            <th className="p-4 text-sm font-semibold">Status</th>
            <th className="p-4 text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {requests.length === 0 ? (
            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No requests found</td></tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td className="p-4">{req.serviceType}</td>
                <td className="p-4 text-gray-600">{req.location}</td>
                <td className="p-4 text-gray-600">{req.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    req.status === 'New Request' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4">
                  {req.status !== 'Scheduled' && (
                    <button 
                      onClick={() => updateStatus(req.id, 'Scheduled')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
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
  );
}