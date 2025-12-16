import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    // 1. Target the "Staff" table (where Jessica & Michael live)
    const records = await base('Staff').select({
      view: 'Grid view',
      // We don't need to filter by Role because EVERYONE in this table is Staff!
    }).all();

    const staff = records.map(r => ({
      id: r.id,
      // 2. Map the correct field name: "Full Name" (from your screenshot)
      email: r.fields['Full Name'] || r.fields['Email'], 
      role: 'Staff' // We force this role since they are in the Staff table
    }));

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}