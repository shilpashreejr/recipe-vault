import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

// This route supports two flows:
// 1. GET /api/extract/evernote/auth?callbackUrl=...  => returns { url, requestToken, requestTokenSecret }
// 2. GET /api/extract/evernote/auth?oauth_token=...&oauth_verifier=...&requestTokenSecret=... => exchanges for access token

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get('callbackUrl');
  const oauthToken = searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');
  const requestTokenSecret = searchParams.get('requestTokenSecret');

  const evernote = new EvernoteService(evernoteConfig);

  // Step 1: Start OAuth
  if (callbackUrl && !oauthToken && !oauthVerifier) {
    try {
      const { url, requestToken, requestTokenSecret } = await evernote.getAuthorizationUrl(callbackUrl);
      return NextResponse.json({ url, requestToken, requestTokenSecret });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Step 2: Handle callback
  if (oauthToken && oauthVerifier && requestTokenSecret) {
    try {
      const { accessToken, accessTokenSecret, userId, shardId } = await evernote.getAccessToken(
        oauthToken,
        requestTokenSecret,
        oauthVerifier
      );
      // You may want to set a cookie or session here for the user
      return NextResponse.json({ accessToken, accessTokenSecret, userId, shardId });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
} 