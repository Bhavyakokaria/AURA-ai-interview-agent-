import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/data';

export async function GET() {
  try {
    const candidates = getCandidates();
    return NextResponse.json({ candidates });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load candidates' }, { status: 500 });
  }
}
