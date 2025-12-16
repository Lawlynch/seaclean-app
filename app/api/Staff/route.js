import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    // Get all users who have the role 'Staff'
    const records = await base('Users').select({
      filterByFormula: `{Role} = 'Staff'`,
      fields: ['Email'] // We'll use Email or Name as the label
    }).all();

    const staff = records.map(r => ({
      id: r.id,
      name: r.fields['Email'] // Or use a 'Name' field if you have one
    }));

    return NextResponse.json({ staff });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}