'use client';

import { useState, useEffect } from 'react';

export default function AdminTable({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [staffList, setStaffList] = useState([]);

  // 1. Fetch Staff List for the dropdowns
  useEffect(() => {
    fetch('/api/users/staff')
      .then(res => res.json())
      .then(data => {
        if (data.staff) setStaffList(data.staff);
      });
  }, []);

  // 2. Helper to find Staff ID by Name (since we fetched Names in the main page)
  function getStaffIdByName(name) {
    const staff = staffList.find(s => s.email === name || s.name === name);
    return staff ? staff.id : "";
  }

  // 3. Handle Assignment Change (Instant Save)
  async function handleAssign(requestId, newStaffId) {
    // Optimistic Update: Update UI immediately
    setRequests(current => 
      current.map(req => {
        if (req.id === requestId) {
          // Find the name of the staff we just picked to update the UI correctly
          const selectedStaff = staffList.find(s => s.id === newStaffId);
          return { ...req, assignedToName: selectedStaff ? selectedStaff.email : '' };
        }
        return req;
      })
    );

    // Send to API
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: requestId, 
          // If status is 'New', flip it to 'Scheduled' automatically when assigned
          status: 'Scheduled', 
          assignedTo: newStaffId 
        }),
      });
    } catch (error) {
      console.error("Assignment failed", error);
      alert("Failed to assign staff.");
    }
  }

  // 4. Handle Status "Approve" (Manual Button)
  async function handleStatusUpdate(id, newStatus) {
    setRequests(current => 
      current.map(req => req.id === id ? { ...req, status: newStatus } : req)
    );

    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Urgency</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Service & Site</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Requested By</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Assign Staff</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    req.urgency === 'High' || req.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {req.urgency}
                  </span>
                </td>

                <td className="p-4">
                  <div className="font-bold text-gray-900">{req.serviceType}</div>
                  <div className="text-xs text-gray-500">{req.location}</div>
                </td>

                <td className="p-4 text-sm text-gray-700">
                  {req.requestedBy}
                </td>

                {/* ALWAYS VISIBLE DROPDOWN */}
                <td className="p-4">
                  <select 
                    className="p-2 border rounded text-sm bg-white w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                    // We attempt to match the name to an ID to set the default value
                    value={getStaffIdByName(req.assignedToName)}
                    onChange={(e) => handleAssign(req.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.email}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-4">
                   {/* If it's New, show Approve Button. If Scheduled/Done, show Badge */}
                   {req.status === 'New Request' ? (
                     <button 
                       onClick={() => handleStatusUpdate(req.id, 'Scheduled')}
                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-bold transition-all"
                     >
                       Approve
                     </button>
                   ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'Scheduled' ? 'bg-green-50 text-green-700 border-green-200' : 
                      req.status === 'Completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {req.status}
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