import { base } from '@/lib/airtable';
import AdminTable from '@/components/AdminTable';

// This function runs on the server to fetch fresh data every time you load the page
async function getRequests() {
  try {
    const records = await base('Service Requests').select({
      sort: [{ field: 'Preferred Date', direction: 'desc' }]
    }).all();

    return records.map(record => ({
      id: record.id,
      serviceType: record.fields['Service Type'] || 'General',
      location: record.fields['Location'] || 'Unknown', // Note: If this is a linked record, it might be an array
      status: record.fields['Status'] || 'New Request',
      date: record.fields['Preferred Date'] || 'N/A',
      priority: record.fields['Priority'] || 'Normal'
    }));
  } catch (error) {
    console.error('Data Fetch Error:', error);
    return [];
  }
}

export default async function AdminDashboard() {
  const requests = await getRequests();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Manager Dashboard</h1>
            <p className="text-gray-500">Overview of all client requests</p>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow text-sm font-bold text-blue-900">
            {requests.length} Active Requests
          </div>
        </div>
        
        {/* Pass the data to the client-side table component */}
        <AdminTable initialRequests={requests} />
      </div>
    </main>
  );
}