import { base } from '@/lib/airtable';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, price, description, status } = body;

    // Update Airtable
    await base('Service Requests').update([
      {
        id: id,
        fields: {
          "Quote Price": parseFloat(price) || 0,
          "Quotation Description": description || "",
          "Status": status
        }
      }
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Airtable Update Error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}