import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';
import { cookies } from 'next/headers'; // <--- IMPORTANT IMPORT

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Find User
    const records = await base('Users').select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const user = records[0];

    // 2. Check Password
    if (user.fields['Password'] !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const userRole = user.fields['Role'] || 'User';
    const allowedSiteIds = user.fields['Sites'] || [];

    // 3. SET COOKIE (The "Badge")
    // This allows the middleware to see the role on other pages
    cookies().set('user_role', userRole, { 
      httpOnly: true, 
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.fields['Email'],
        name: user.fields['Email'],
        role: userRole,
        allowedSites: allowedSiteIds
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}