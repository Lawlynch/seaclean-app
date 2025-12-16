'use client';

import { useState, useEffect } from 'react';

export default function AdminTable({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [staffList, setStaffList] = useState([]);
  // Track which staff member is selected for each request row
  const [selections, setSelections] = useState({}); 

  // 1. Fetch Staff List on Load
  useEffect(() => {
    fetch('/api/users/staff')
      .then(res => res.json())
      .then(data => {
        if (data.staff) setStaffList(data.staff);
      });
  }, []);

  async function handleApprove(id) {
    const staffId = selections[id];
    if (!staffId) {
      alert("Please select a staff member first.");
      return;
    }

    // Optimistic Update
    setRequests(current => 
      current.map(req => req.id === id ? { ...req, status: 'Scheduled' } : req)
    );

    // Send to API
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Scheduled', assignedTo: staffId }),
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Urgency</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Service</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Assign Staff</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50">
                <td className="p-4">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}>{req.urgency}</span>
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{req.serviceType}</div>
                  <div className="text-xs text-gray-500">{req.location}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                    req.status === 'Scheduled' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>{req.status}</span>
                </td>
                
                {/* ASSIGNMENT COLUMN */}
                <td className="p-4">
                  {req.status === 'New Request' ? (
                    <select 
                      className="p-2 border rounded text-sm bg-white"
                      onChange={(e) => setSelections(prev => ({...prev, [req.id]: e.target.value}))}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Staff...</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-gray-500">Assigned</span>
                  )}
                </td>

                <td className="p-4">
                  {req.status === 'New Request' && (
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-bold"
                    >
                      Approve
                    </button>
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