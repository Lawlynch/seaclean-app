import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { base } from '@/lib/airtable';
import ClientRequests from '@/components/ClientRequests'; 
import RequestForm from '@/components/RequestForm';

// Helper to get user details server-side
async function getClientDetails(userId) {
  try {
    const record = await base('Users').find(userId);
    return {
      id: record.id,
      name: record.fields['Name'],
      email: record.fields['Email'],
      // Ensure allowedSites is an array, or empty if undefined
      allowedSites: record.fields['Allowed Sites'] || []
    };
  } catch (error) {
    return null;
  }
}

export default async function ClientDashboardPage() {
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value;
  const role = cookieStore.get('user_role')?.value;

  // 1. Security Check
  if (!userId || (role !== 'Client' && role !== 'Admin')) {
    redirect('/'); 
  }

  // 2. Fetch User Data (So the RequestForm knows their sites)
  const user = await getClientDetails(userId);
  if (!user) redirect('/');

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">Welcome, {user.name}</h1>
            <p className="text-slate-500">Client Dashboard</p>
          </div>
          <form action={async () => { 'use server'; cookies().delete('user_role'); cookies().delete('user_id'); redirect('/'); }}>
            <button className="text-red-600 font-medium hover:underline text-sm">Sign Out</button>
          </form>
        </div>

        {/* 3. The Request Form (Now passed the full user object) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 mb-8">
           <RequestForm user={user} />
        </div>

        {/* 4. The History List */}
        <ClientRequests />
        
      </div>
    </main>
  );
}