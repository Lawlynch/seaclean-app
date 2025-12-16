import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    // 1. Fetch all records from the "Sites" table
    const records = await base('Sites').select().all();

    // 2. Format them nicely for the frontend
    const sites = records.map(record => ({
      id: record.id,
      // We try to find the name in a few common column names
      name: record.fields['Name'] || record.fields['Site Name'] || record.fields['Location'] || record.id
    }));

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Sites Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}