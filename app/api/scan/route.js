import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();
    console.log("Scan logged:", body);
    return NextResponse.json({ success: true });
}
