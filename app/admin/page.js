import { base } from '@/lib/airtable';
import AdminTable from '@/components/AdminTable';

// Server Component: Fetches data before sending to the browser
async function getRequests() {
  try {
    const records = await base('Service Requests').select({
      sort: [{ field: 'Preferred Date', direction: 'desc' }],
      // MAGIC TRICK: This asks Airtable for the "Name" of linked records, not the ID!
      cellFormat: 'string', 
      timeZone: 'UTC',
      userLocale: 'en-gb'
    }).all();

    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        // Since we used cellFormat: 'string', these will be real names now!
        serviceType: fields['Service Type'] || 'General',
        location: fields['Location'] || 'Unknown', 
        status: fields['Status'] || 'New Request',
        date: fields['Preferred Date'] || 'N/A',
        urgency: fields['Urgency'] || 'Normal',
        description: fields['Description'] || '',
        // 'Requested By' is a list (linked record), so we join it if there are multiple
        requestedBy: Array.isArray(fields['Requested By']) 
          ? fields['Requested By'].join(', ') 
          : (fields['Requested By'] || 'Guest')
      };
    });
  } catch (error) {
    console.error('Data Fetch Error:', error);
    return [];
  }
}

export default async function AdminDashboard() {
  const requests = await getRequests();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Manager Dashboard</h1>
            <p className="text-slate-500 mt-1">Review and approve incoming service requests</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-blue-900">
            {requests.length} Active Requests
          </div>
        </div>
        
        {/* Pass the richer data to the table */}
        <AdminTable initialRequests={requests} />
      </div>
    </main>
  );
}