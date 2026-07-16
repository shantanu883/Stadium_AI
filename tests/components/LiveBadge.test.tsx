import React from 'react';
import { render, screen } from '@testing-library/react';
import { LiveBadge } from '../../src/components/LiveBadge';

describe('LiveBadge Component', () => {
  it('should render Normal status by default', () => {
    render(<LiveBadge />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should render custom status correctly', () => {
    render(<LiveBadge status="overcrowded" />);
    expect(screen.getByText('Overcrowded')).toBeInTheDocument();
  });

  it('should render custom label when provided', () => {
    render(<LiveBadge label="LIVE" />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should apply correct styling for different statuses', () => {
    const { container } = render(<LiveBadge status="overcrowded" />);
    const badge = container.firstChild as HTMLElement;
    
    expect(badge).toHaveClass('text-fifa-neonRed');
    expect(badge).toHaveClass('bg-fifa-neonRed/10');
  });

  it('should render status dot indicator', () => {
    const { container } = render(<LiveBadge status="normal" />);
    
    const dot = container.querySelector('.w-2.h-2.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('should handle different status types', () => {
    const statuses: Array<'normal' | 'medium' | 'overcrowded' | 'critical'> = [
      'normal', 'medium', 'overcrowded', 'critical'
    ];
    
    statuses.forEach((status) => {
      const { container, unmount } = render(<LiveBadge status={status} />);
      
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      
      unmount();
    });
  });
});