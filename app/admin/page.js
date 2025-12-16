import { base } from '@/lib/airtable';
import AdminTable from '@/components/AdminTable';

async function getRequests() {
  try {
    const records = await base('Service Requests').select({
      sort: [{ field: 'Preferred Date', direction: 'desc' }],
      cellFormat: 'string', 
      timeZone: 'UTC',
      userLocale: 'en-gb'
    }).all();

    return records.map(record => {
      const fields = record.fields;
      
      return {
        id: record.id,
        serviceType: fields['Service Type'] || 'General',
        
        // CRITICAL FIX: Flatten the Array to a simple String
        // Before: ['Maplewood Elementary']  ->  After: 'Maplewood Elementary'
        location: Array.isArray(fields['Location']) ? fields['Location'][0] : (fields['Location'] || 'Unknown'),
        
        status: fields['Status'] || 'New Request',
        date: fields['Preferred Date'] || 'N/A',
        urgency: fields['Urgency'] || 'Normal',
        description: fields['Description'] || '',
        
        // Flatten Requested By as well
        requestedBy: Array.isArray(fields['Requested By']) ? fields['Requested By'][0] : (fields['Requested By'] || 'Guest'),
        
        assignedToName: Array.isArray(fields['Assigned Staff']) ? fields['Assigned Staff'][0] : (fields['Assigned Staff'] || '')
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
            <p className="text-slate-500 mt-1">Review and assign incoming service requests</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-blue-900">
              {requests.length} Active Requests
            </div>
          </div>
        </div>
        
        <AdminTable initialRequests={requests} />
      </div>
    </main>
  );
}