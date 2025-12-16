import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    const records = await base('Users').select({
      view: 'Grid view'
    }).all();

    // STRICT FILTER: Only return users where Role is EXACTLY 'Staff'
    const staff = records
      .filter(r => r.fields['Role'] === 'Staff') 
      .map(r => ({
        id: r.id,
        name: r.fields['Email'], 
        role: r.fields['Role']
      }));

    return NextResponse.json({ staff });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}