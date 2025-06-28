import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/lib/ocr/ocr-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Get OCR options from request
    const language = formData.get('language') as string || 'eng';
    const confidenceThreshold = parseInt(formData.get('confidenceThreshold') as string) || 60;
    const enablePreprocessing = formData.get('enablePreprocessing') === 'true';

    // Convert file to blob for OCR processing
    const imageBlob = new Blob([file], { type: file.type });

    // Extract text using OCR service
    const result = await ocrService.extractText(imageBlob, {
      language,
      confidenceThreshold,
      preprocessing: {
        resize: enablePreprocessing,
        enhance: enablePreprocessing,
        denoise: enablePreprocessing,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        confidence: result.confidence,
        processingTime: result.processingTime,
        language: result.language,
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });

  } catch (error) {
    console.error('Image extraction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract text from image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return supported languages and file types
    const languages = await ocrService.getSupportedLanguages();
    
    return NextResponse.json({
      success: true,
      data: {
        supportedLanguages: languages,
        supportedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        maxFileSize: '10MB',
        defaultLanguage: 'eng',
        defaultConfidenceThreshold: 60,
      },
    });
  } catch (error) {
    console.error('Error getting OCR info:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get OCR information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 