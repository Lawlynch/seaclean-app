import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function POST(request) {
  try {
    const body = await request.json();
    const { serviceType, location, priority, description, date } = body;

    // Matches your Airtable column names exactly
    const record = await base('Service Requests').create([
      {
        fields: {
          'Service Type': serviceType,
          'Status': 'New Request',
          'Location': location, 
          'Priority': priority,
          'Description': description,
          'Preferred Date': date,
          'Client Email': 'client@seaclean.com' 
        }
      }
    ]);

    return NextResponse.json({ success: true, id: record[0].id });
  } catch (error) {
    console.error('Airtable Error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}