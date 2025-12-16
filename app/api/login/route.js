import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Search for the user by Email
    const records = await base('Users').select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const user = records[0];

    // 2. Simple Password Check (Direct comparison)
    // Note: In a real production app, we would hash passwords, but this works for your internal tool.
    if (user.fields['Password'] !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // 3. Get the list of Site IDs this user is allowed to see
    const allowedSiteIds = user.fields['Sites'] || [];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.fields['Email'],
        name: user.fields['Email'], // Or 'Name' column if you have one
        role: user.fields['Role'],
        allowedSites: allowedSiteIds
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}