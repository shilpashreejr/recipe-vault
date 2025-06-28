import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaMetadataPreservation } from '@/lib/extractors/social-media-metadata';

// Global instance of the metadata preservation system
const metadataPreservation = new SocialMediaMetadataPreservation();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform, contentId, url, rawData, metadata, config } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create_metadata':
        if (!platform || !contentId || !url || !rawData) {
          return NextResponse.json(
            { error: 'Platform, contentId, url, and rawData are required for create_metadata action' },
            { status: 400 }
          );
        }
        
        const newMetadata = metadataPreservation.createMetadata(platform, contentId, url, rawData);
        const validation = metadataPreservation.validateMetadata(newMetadata);
        
        return NextResponse.json({
          success: true,
          metadata: newMetadata,
          validation
        });

      case 'update_metadata':
        if (!metadata || !rawData) {
          return NextResponse.json(
            { error: 'Metadata and rawData are required for update_metadata action' },
            { status: 400 }
          );
        }
        
        const updatedMetadata = metadataPreservation.updateMetadata(metadata, rawData);
        const updateValidation = metadataPreservation.validateMetadata(updatedMetadata);
        
        return NextResponse.json({
          success: true,
          metadata: updatedMetadata,
          validation: updateValidation
        });

      case 'validate_metadata':
        if (!metadata) {
          return NextResponse.json(
            { error: 'Metadata is required for validate_metadata action' },
            { status: 400 }
          );
        }
        
        const validationResult = metadataPreservation.validateMetadata(metadata);
        
        return NextResponse.json({
          success: true,
          validation: validationResult
        });

      case 'get_metadata_summary':
        if (!metadata) {
          return NextResponse.json(
            { error: 'Metadata is required for get_metadata_summary action' },
            { status: 400 }
          );
        }
        
        const summary = metadataPreservation.getMetadataSummary(metadata);
        const isExpired = metadataPreservation.isMetadataExpired(metadata);
        
        return NextResponse.json({
          success: true,
          summary,
          isExpired
        });

      case 'update_config':
        if (!config || typeof config !== 'object') {
          return NextResponse.json(
            { error: 'Valid config is required for update_config action' },
            { status: 400 }
          );
        }
        
        metadataPreservation.updateConfig(config);
        
        return NextResponse.json({
          success: true,
          message: 'Configuration updated',
          config: metadataPreservation.getConfig()
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Metadata preservation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to perform metadata preservation action: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'get_config') {
      const config = metadataPreservation.getConfig();
      
      return NextResponse.json({
        success: true,
        config
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Metadata preservation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to get metadata preservation info: ${errorMessage}` },
      { status: 500 }
    );
  }
} 