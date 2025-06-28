import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../ImageUpload';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

describe('ImageUpload Component', () => {
  const mockOnImageSelect = jest.fn();
  const mockOnImageRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area when no file is selected', () => {
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    expect(screen.getByText('Upload Recipe Image')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your recipe image here/)).toBeInTheDocument();
    expect(screen.getByText(/browse files/)).toBeInTheDocument();
  });

  it('shows supported formats and max size', () => {
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        maxSize={5}
      />
    );

    expect(screen.getByText(/Supported formats: JPEG, JPG, PNG, WEBP/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum size: 5MB/)).toBeInTheDocument();
  });

  it('handles file selection via file input', async () => {
    const user = userEvent.setup();
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /browse files/i });

    await user.click(input);

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('displays selected file information', () => {
    const file = new File(['test content'], 'recipe.jpg', { type: 'image/jpeg' });
    
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        selectedFile={file}
      />
    );

    expect(screen.getByText('recipe.jpg')).toBeInTheDocument();
    expect(screen.getByText('12 Bytes')).toBeInTheDocument(); // File size
  });

  it('handles file removal', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        selectedFile={file}
      />
    );

    const removeButton = screen.getByRole('button', { name: '' }); // X button
    await user.click(removeButton);

    expect(mockOnImageRemove).toHaveBeenCalled();
  });

  it('shows loading state when processing', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        selectedFile={file}
        isLoading={true}
      />
    );

    expect(screen.getByText('Processing image...')).toBeInTheDocument();
  });

  it('validates file type and shows error for unsupported format', async () => {
    const user = userEvent.setup();
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /browse files/i });

    await user.click(input);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/File type not supported/)).toBeInTheDocument();
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });

  it('validates file size and shows error for oversized file', async () => {
    const user = userEvent.setup();
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        maxSize={1} // 1MB limit
      />
    );

    // Create a file larger than 1MB
    const largeContent = 'x'.repeat(1024 * 1024 + 1); // 1MB + 1 byte
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    
    const input = screen.getByRole('button', { name: /browse files/i });
    await user.click(input);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/File size too large/)).toBeInTheDocument();
    });

    expect(mockOnImageSelect).not.toHaveBeenCalled();
  });

  it('handles drag and drop events', () => {
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const uploadArea = screen.getByText('Upload Recipe Image').closest('div');
    
    // Test drag over
    fireEvent.dragOver(uploadArea!);
    expect(uploadArea).toHaveClass('border-blue-400', 'bg-blue-50');

    // Test drag leave
    fireEvent.dragLeave(uploadArea!);
    expect(uploadArea).not.toHaveClass('border-blue-400', 'bg-blue-50');
  });

  it('handles file drop', () => {
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const uploadArea = screen.getByText('Upload Recipe Image').closest('div');

    fireEvent.drop(uploadArea!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
  });

  it('disables interaction when loading', () => {
    render(
      <ImageUpload
        onImageSelect={mockOnImageSelect}
        onImageRemove={mockOnImageRemove}
        isLoading={true}
      />
    );

    const uploadArea = screen.getByText('Upload Recipe Image').closest('div');
    expect(uploadArea).toHaveClass('opacity-50', 'pointer-events-none');
  });
}); 