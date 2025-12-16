'use client';

import { useState } from 'react';

export default function AdminTable({ initialRequests }) {
  const [requests, setRequests] = useState(initialRequests || []);

  async function updateStatus(id, newStatus) {
    // 1. Update UI instantly (Optimistic)
    setRequests(current => 
      current.map(req => req.id === id ? { ...req, status: newStatus } : req)
    );

    // 2. Send update to Airtable
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to save change");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-700 text-sm">Service Type</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Location</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Date</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Status</th>
            <th className="p-4 font-semibold text-gray-700 text-sm">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-blue-50 transition-colors">
              <td className="p-4 text-sm font-medium text-gray-900">{req.serviceType}</td>
              <td className="p-4 text-sm text-gray-500">{req.location}</td>
              <td className="p-4 text-sm text-gray-500">{req.date}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  req.status === 'New Request' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {req.status}
                </span>
              </td>
              <td className="p-4">
                {req.status !== 'Scheduled' && (
                  <button 
                    onClick={() => updateStatus(req.id, 'Scheduled')}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm"
                  >
                    Approve / Schedule
                  </button>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-400">No requests found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}