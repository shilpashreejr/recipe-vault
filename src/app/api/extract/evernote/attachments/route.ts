import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');
  const resourceGuid = searchParams.get('resourceGuid');

  if (!accessToken || !resourceGuid) {
    return NextResponse.json(
      { error: 'Missing accessToken or resourceGuid' },
      { status: 400 }
    );
  }

  try {
    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get the resource data
    const resourceData = await evernote.getResourceData(resourceGuid);
    
    if (!resourceData) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Convert base64 data to buffer
    const buffer = Buffer.from(resourceData.body, 'base64');
    
    // Return the image data with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg', // Default to JPEG, could be made dynamic
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, noteGuid } = await req.json();

    if (!accessToken || !noteGuid) {
      return NextResponse.json(
        { error: 'Missing accessToken or noteGuid' },
        { status: 400 }
      );
    }

    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get all resources for the note
    const resources = await evernote.getNoteResources(noteGuid);
    
    // Filter for image resources
    const imageResources = resources.filter(resource => 
      resource.mime && resource.mime.startsWith('image/')
    );

    // Return metadata about the images
    const images = imageResources.map(resource => ({
      guid: resource.guid,
      mime: resource.mime,
      width: resource.width,
      height: resource.height,
      url: `/api/extract/evernote/attachments?accessToken=${accessToken}&resourceGuid=${resource.guid}`,
    }));

    return NextResponse.json({ images });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 