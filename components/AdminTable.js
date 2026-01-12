'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTable({ initialRequests, allUsers }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    serviceType: '', // Just for display
    price: '',
    description: '',
    status: ''
  });

  // Open the Modal with current data
  const handleEditClick = (req) => {
    setFormData({
      id: req.id,
      serviceType: req.serviceType,
      price: req.quotePrice,
      description: req.quotationDescription, // This requires the fix in Step 1
      status: req.status
    });
    setIsModalOpen(true);
  };

  // Save Changes to Airtable
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/update-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update');

      // Success! Close modal and refresh data
      setIsModalOpen(false);
      router.refresh(); 
    } catch (error) {
      alert('Error saving update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Staff</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {initialRequests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{req.serviceType}</div>
                <div className="text-sm text-gray-500">{req.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${req.status === 'Pending Client Approval' ? 'bg-yellow-100 text-yellow-800' : 
                    req.status === 'New Request' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {req.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.assignedToName || <span className="text-red-400 italic">Unassigned</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEditClick(req)}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm transition"
                >
                  Process / Quote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- THE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Process Request: {formData.serviceType}</h3>
            
            {/* Status Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full border rounded-md p-2"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="New Request">New Request</option>
                <option value="Pending Client Approval">Pending Client Approval</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Set to "Pending Client Approval" to show to Bob.</p>
            </div>

            {/* Price Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote Price ($)</label>
              <input 
                type="number" 
                className="w-full border rounded-md p-2"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Description</label>
              <textarea 
                className="w-full border rounded-md p-2"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Details of the quote..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}