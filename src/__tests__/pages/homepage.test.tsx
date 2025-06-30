import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Homepage Feature Cards', () => {
  const push = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    push.mockClear();
  });

  it('renders all feature cards', () => {
    render(<Home />);
    expect(screen.getByTestId('feature-ai-extraction')).toBeInTheDocument();
    expect(screen.getByTestId('feature-meal-planning')).toBeInTheDocument();
    expect(screen.getByTestId('feature-photo-tracking')).toBeInTheDocument();
    expect(screen.getByTestId('feature-inventory-shopping')).toBeInTheDocument();
  });

  it('navigates to correct page when feature cards are clicked', async () => {
    render(<Home />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('feature-ai-extraction'));
    expect(screen.getByTestId('feature-ai-extraction').getAttribute('href')).toBe('/extract');
    await user.click(screen.getByTestId('feature-meal-planning'));
    expect(screen.getByTestId('feature-meal-planning').getAttribute('href')).toBe('/meal-plans');
    await user.click(screen.getByTestId('feature-photo-tracking'));
    expect(screen.getByTestId('feature-photo-tracking').getAttribute('href')).toBe('/food-logging');
    await user.click(screen.getByTestId('feature-inventory-shopping'));
    expect(screen.getByTestId('feature-inventory-shopping').getAttribute('href')).toBe('/smart-inventory');
  });
}); 