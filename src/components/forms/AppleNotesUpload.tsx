'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AppleNotesUploadProps {
  onFileSelect: (file: File) => void;
  onValidationError: (error: string) => void;
  isLoading?: boolean;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export default function AppleNotesUpload({
  onFileSelect,
  onValidationError,
  isLoading = false,
  maxFileSize = 50, // 50MB default
  acceptedFormats = ['.html', '.txt', '.htm']
}: AppleNotesUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const validateFile = useCallback(async (file: File) => {
    setValidationState('validating');
    setValidationMessage('Validating file format...');

    try {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxFileSize}MB limit`);
      }

      // Check file extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!acceptedFormats.includes(fileExtension)) {
        throw new Error(`Unsupported file format. Please upload ${acceptedFormats.join(', ')} files`);
      }

      // Read file content for validation
      const content = await file.text();
      
      // Basic content validation
      if (content.trim().length === 0) {
        throw new Error('File appears to be empty');
      }

      // Check for Apple Notes indicators
      const hasAppleNotesContent = content.includes('note') || 
                                   content.includes('data-note-id') || 
                                   content.includes('===') ||
                                   content.includes('---') ||
                                   content.includes('***');

      if (!hasAppleNotesContent) {
        throw new Error('File does not appear to contain Apple Notes data');
      }

      setValidationState('valid');
      setValidationMessage('File validated successfully');
      setSelectedFile(file);
      onFileSelect(file);
    } catch (error) {
      setValidationState('invalid');
      setValidationMessage(error instanceof Error ? error.message : 'Validation failed');
      onValidationError(error instanceof Error ? error.message : 'Validation failed');
    }
  }, [maxFileSize, acceptedFormats, onFileSelect, onValidationError]);

  const handleFileSelect = useCallback((file: File) => {
    validateFile(file);
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getValidationColor = () => {
    switch (validationState) {
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'invalid':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="w-full">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-400 bg-blue-50' : getValidationColor()}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        animate={{
          scale: isDragOver ? 1.02 : 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{
              scale: isDragOver ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Upload className="w-12 h-12 text-gray-400" />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Apple Notes Export
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop your Apple Notes export file here, or click to browse
            </p>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Supported formats: {acceptedFormats.join(', ')}</p>
            <p>Maximum file size: {maxFileSize}MB</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-white border rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              {getValidationIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {validationMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-2 text-sm ${
                  validationState === 'valid' ? 'text-green-600' : 
                  validationState === 'invalid' ? 'text-red-600' : 
                  'text-blue-600'
                }`}
              >
                {validationMessage}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <p className="text-sm text-blue-700">
              Processing Apple Notes export file...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 