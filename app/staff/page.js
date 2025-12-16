import { base } from '@/lib/airtable';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getMyTasks(userId) {
  try {
    // Fetch requests where 'Assigned Staff' contains the logged-in User ID
    const records = await base('Service Requests').select({
      filterByFormula: `FIND('${userId}', {Assigned Staff}) > 0`,
      sort: [{ field: 'Preferred Date', direction: 'asc' }]
    }).all();

    return records.map(r => ({
      id: r.id,
      service: r.fields['Service Type'],
      location: r.fields['Location Name'] || 'Site', // Ensure you have a readable location column or lookup
      date: r.fields['Preferred Date'],
      status: r.fields['Status'],
      desc: r.fields['Description']
    }));
  } catch (error) {
    return [];
  }
}

export default async function StaffPortal() {
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value;
  const role = cookieStore.get('user_role')?.value;

  // Security Check
  if (!userId || role !== 'Staff') {
    // Optional: Allow Admin to peek too?
    if (role !== 'Admin') redirect('/'); 
  }

  const tasks = await getMyTasks(userId);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">My Assignments</h1>
        <p className="text-gray-500 mb-8">Tasks assigned to you</p>

        <div className="grid gap-4">
          {tasks.length === 0 ? (
             <div className="p-8 bg-white rounded shadow text-center text-gray-500">No active tasks. Good job!</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-800">{task.service}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{task.status}</span>
                  </div>
                  <p className="text-gray-600 font-medium">{task.location}</p>
                  <p className="text-sm text-gray-500 mt-2">{task.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{task.date}</div>
                  <div className="text-xs text-gray-400 uppercase">Due Date</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <form action={async () => { 'use server'; cookies().delete('user_role'); cookies().delete('user_id'); redirect('/'); }}>
          <button className="mt-8 text-red-600 underline text-sm">Sign Out</button>
        </form>
      </div>
    </main>
  );
}