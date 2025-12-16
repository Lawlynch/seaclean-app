'use client';

import { useState, useEffect } from 'react';

export default function AdminTable({ initialRequests = [], allUsers = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [staffList, setStaffList] = useState([]);

  // Fetch Staff for the "Assign Staff" column
  useEffect(() => {
    fetch('/api/users/staff')
      .then(res => res.json())
      .then(data => {
        if (data.staff) {
          setStaffList(data.staff.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        }
      });
  }, []);

  // Helper to find Staff ID
  function getStaffIdByName(name) {
    const staff = staffList.find(s => s.name === name);
    return staff ? staff.id : "";
  }

  // --- ACTIONS ---

  async function handleAssign(requestId, newStaffId) {
    setRequests(current => 
      current.map(req => {
        if (req.id === requestId) {
          const selectedStaff = staffList.find(s => s.id === newStaffId);
          return { ...req, assignedToName: selectedStaff ? selectedStaff.name : '' };
        }
        return req;
      })
    );
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: requestId, assignedTo: newStaffId }),
    });
  }

  async function handleStatusChange(id, newStatus) {
    setRequests(current => current.map(req => req.id === id ? { ...req, status: newStatus } : req));
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }

  // NEW: Handle Changing the Requester (Client)
  async function handleRequesterChange(id, newUserId) {
    // 1. Update UI Instantly
    setRequests(current => current.map(req => req.id === id ? { ...req, requestedById: newUserId } : req));
    
    // 2. Save to Airtable
    await fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id, 
        customFields: { 'Requested By': [newUserId] } // Array format required for Linked Records
      }),
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="p-4 w-24">Urgency</th>
              <th className="p-4 w-64">Service & Site</th>
              <th className="p-4 w-56">Requester (Client)</th>
              <th className="p-4 w-48">Assign Staff</th>
              <th className="p-4 w-40">Status</th>
              <th className="p-4 w-32">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                
                {/* 1. URGENCY */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    req.urgency === 'High' || req.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {req.urgency}
                  </span>
                </td>

                {/* 2. DETAILS */}
                <td className="p-4">
                  <div className="font-bold text-gray-900">{req.serviceType}</div>
                  <div className="text-xs text-gray-500">{req.location}</div>
                  {req.quotePrice && (
                    <div className="mt-1 text-xs text-green-700 font-bold">
                      Quote: ${req.quotePrice}
                    </div>
                  )}
                </td>

                {/* 3. REQUESTER DROPDOWN (NEW FIX) */}
                <td className="p-4">
                   <select
                     className="p-2 border rounded text-xs w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                     value={req.requestedById || ""}
                     onChange={(e) => handleRequesterChange(req.id, e.target.value)}
                   >
                     <option value="">Guest / Unknown</option>
                     {/* Show all Users so you can assign 'Bob' instead of 'Guest' */}
                     {allUsers.map(user => (
                       <option key={user.id} value={user.id}>
                         {user.name} ({user.role})
                       </option>
                     ))}
                   </select>
                </td>

                {/* 4. STAFF ASSIGNMENT */}
                <td className="p-4">
                  <select 
                    className="p-2 border rounded text-xs w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={getStaffIdByName(req.assignedToName)}
                    onChange={(e) => handleAssign(req.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* 5. STATUS */}
                <td className="p-4">
                   <select
                     value={req.status}
                     onChange={(e) => handleStatusChange(req.id, e.target.value)}
                     className={`p-2 border rounded text-xs font-bold uppercase w-full outline-none ${
                       req.status === 'Route for Approval' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                       req.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                       'bg-white text-gray-900 border-gray-200'
                     }`}
                   >
                     <option value="New Request">New Request</option>
                     <option value="Route for Approval">Route for Approval</option>
                     <option value="Scheduled">Scheduled</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Completed">Completed</option>
                   </select>
                </td>

                {/* 6. CLIENT DECISION */}
                <td className="p-4">
                  {req.status === 'Route for Approval' && req.clientApproval === 'Pending' && (
                    <span className="text-orange-600 text-xs font-bold animate-pulse">⏳ Waiting...</span>
                  )}
                  {req.clientApproval === 'Approved' && (
                    <span className="text-green-600 text-xs font-bold">✅ Approved</span>
                  )}
                  {req.clientApproval === 'Rejected' && (
                    <span className="text-red-600 text-xs font-bold">❌ Rejected</span>
                  )}
                   {req.status !== 'Route for Approval' && req.clientApproval === 'Pending' && (
                    <span className="text-gray-400 text-xs">-</span>
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