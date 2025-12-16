import { base } from '@/lib/airtable';
import AdminTable from '@/components/AdminTable';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    // 1. Fetch Requests
    const requestRecords = await base('Service Requests').select({
      sort: [{ field: 'Preferred Date', direction: 'desc' }],
    }).all();

    // 2. Fetch All Users (To map IDs to Names for the dropdown)
    const userRecords = await base('Users').select({
      view: 'Grid view'
    }).all();

    // Create a phonebook of users: [{id: 'rec123', name: 'bob@email.com'}, ...]
    const users = userRecords.map(u => ({
      id: u.id,
      name: u.fields['Email'] || 'Unknown',
      role: u.fields['Role']
    }));

    // 3. Process Requests
    const requests = requestRecords.map(record => {
      const fields = record.fields;
      return {
        id: record.id,
        serviceType: fields['Service Type'] || 'General',
        location: Array.isArray(fields['Location']) ? fields['Location'][0] : (fields['Location'] || 'Unknown'),
        status: fields['Status'] || 'New Request',
        date: fields['Preferred Date'] || 'N/A',
        urgency: fields['Urgency'] || 'Normal',
        
        // IMPORTANT: We get the Raw ID (rec...) so the dropdown can select the right user
        requestedById: Array.isArray(fields['Requested By']) ? fields['Requested By'][0] : null,
        
        assignedToName: Array.isArray(fields['Assigned Staff']) ? fields['Assigned Staff'][0] : (fields['Assigned Staff'] || ''),
        clientApproval: fields['Client Approval'] || 'Pending',
        quotePrice: fields['Quote Price'] || ''
      };
    });

    return { requests, users };
  } catch (error) {
    console.error('Data Fetch Error:', error);
    return { requests: [], users: [] };
  }
}

export default async function AdminDashboard() {
  const { requests, users } = await getData();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[95rem] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Manager Dashboard</h1>
            <p className="text-slate-500 mt-1">Review, quote, and assign service requests</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-blue-900">
             {requests.length} Active Requests
          </div>
        </div>
        
        {/* Pass BOTH the requests and the user list to the table */}
        <AdminTable initialRequests={requests} allUsers={users} />
      </div>
    </main>
  );
}