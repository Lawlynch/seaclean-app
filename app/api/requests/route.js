import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

// 1. POST: Create a new request (Used by the Client Form)
export async function POST(request) {
  try {
    const body = await request.json();
    // We now accept 'userId' from the form to link the specific client
    const { serviceType, location, priority, description, date, userId } = body;

    // Validation
    if (!serviceType || !location || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const record = await base('Service Requests').create([
      {
        fields: {
          'Service Type': serviceType,
          'Status': 'New Request',
          'Location': [location],      // Linked Record ID must be in array
          'Urgency': priority,         // Correct column name
          'Description': description,
          'Preferred Date': date,
          // Link the real user ID if we have it, otherwise fallback or leave empty
          'Requested By': userId ? [userId] : null 
        }
      }
    ], { typecast: true });

    return NextResponse.json({ success: true, id: record[0].id });
  } catch (error) {
    console.error('Airtable Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. PUT: Update status AND assignment
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, assignedTo } = body; // <--- Accept assignedTo

    const updateData = { 'Status': status };
    
    // If an assignment was sent, add it to the update
    if (assignedTo) {
      updateData['Assigned Staff'] = [assignedTo]; // Linked records need an array
    }

    await base('Service Requests').update([{ id, fields: updateData }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}