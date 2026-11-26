import { NextRequest, NextResponse } from 'next/server';
import { redisGet, redisSet } from '@/lib/redis';

export interface StoredUserProfile {
  name: string;
  gmail: string;
  phone: string;
  updatedAt: string;
}

const PROFILE_PREFIX = 'goldstar:vantage:profile:';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  try {
    const emailParam = req.nextUrl.searchParams.get('email') ?? '';
    const email = normalizeEmail(emailParam);
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const profile = await redisGet<StoredUserProfile>(PROFILE_PREFIX + email);
    return NextResponse.json({ success: true, profile: profile ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gmail = normalizeEmail(String(body.gmail ?? ''));
    const phone = String(body.phone ?? '').trim();
    const name = String(body.name ?? '').trim();

    if (!isValidEmail(gmail)) {
      return NextResponse.json({ success: false, error: 'Valid Gmail / email is required' }, { status: 400 });
    }
    if (phone.replace(/[^0-9]/g, '').length < 7) {
      return NextResponse.json({ success: false, error: 'Valid phone number is required' }, { status: 400 });
    }

    const profile: StoredUserProfile = {
      name,
      gmail,
      phone,
      updatedAt: new Date().toISOString(),
    };

    await redisSet(PROFILE_PREFIX + gmail, profile);
    return NextResponse.json({ success: true, profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save profile';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
