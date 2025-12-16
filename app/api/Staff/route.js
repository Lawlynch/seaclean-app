import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    const records = await base('Users').select({
      view: 'Grid view',
      // CRITICAL: This forces Linked Records (like Sites) to return Names ("London"), not IDs ("rec...")
      cellFormat: 'string', 
      userLocale: 'en-gb',
      timeZone: 'UTC'
    }).all();

    const staff = records
      .filter(r => {
        const role = r.fields['Role'];
        return role === 'Staff' || role === 'Admin' || role === 'Moderator';
      })
      .map(r => ({
        id: r.id,
        email: r.fields['Email'],
        role: r.fields['Role'],
        // Returns an array of site names: ['Riverside Pump Station', 'Central Park']
        sites: r.fields['Sites'] || [] 
      }));

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}