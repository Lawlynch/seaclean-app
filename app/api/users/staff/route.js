import { base } from '@/lib/airtable';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // 1. Validate we have an ID
    if (!id) {
      return NextResponse.json({ error: 'Missing Record ID' }, { status: 400 });
    }

    // 2. Prepare the fields for Airtable
    const airtableFields = {};

    // --- HANDLE STAFF ASSIGNMENT ---
    if (updates.assignedStaff) {
      // Airtable Linked Records MUST be an array of IDs: ['rec123...']
      airtableFields['Assigned Staff'] = [updates.assignedStaff];
    }

    // --- HANDLE STATUS ---
    if (updates.status) {
      airtableFields['Status'] = updates.status;
    }

    // --- HANDLE QUOTE PRICE ---
    if (updates.quotePrice !== undefined) {
      // Parse float to ensure it's a number, default to 0 if invalid
      const price = parseFloat(updates.quotePrice);
      airtableFields['Quote Price'] = isNaN(price) ? 0 : price;
    }

    // --- HANDLE DESCRIPTION ---
    if (updates.quotationDescription !== undefined) {
      airtableFields['Quotation Description'] = updates.quotationDescription;
    }

    // 3. Update Airtable
    const record = await base('Service Requests').update([
      {
        id: id,
        fields: airtableFields
      }
    ]);

    return NextResponse.json({ success: true, record });

  } catch (error) {
    console.error('Airtable Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update Airtable', details: error.message },
      { status: 500 }
    );
  }
}
