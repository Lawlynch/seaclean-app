import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    const records = await base('Users').select({
      view: 'Grid view',
      cellFormat: 'string', 
      userLocale: 'en-gb',
      timeZone: 'UTC'
    }).all();

    const staff = records
      .filter(r => {
        const role = r.fields['Role'];
        return role === 'Staff' || role === 'Admin' || role === 'Moderator';
      })
      .map(r => {
        // Flatten the Sites array just in case Airtable sends it weirdly
        // If it's already an array of strings, keep it. If it's undefined, make it empty.
        const rawSites = r.fields['Sites'];
        const sites = Array.isArray(rawSites) ? rawSites : (rawSites ? [rawSites] : []);

        return {
          id: r.id,
          email: r.fields['Email'],
          role: r.fields['Role'],
          sites: sites
        };
      });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}