import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();
    console.log("Service called:", body);
    return NextResponse.json({ success: true, message: "Staff notified" });
}
