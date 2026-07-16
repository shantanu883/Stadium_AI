import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '../../src/components/GlassCard';

describe('GlassCard Component', () => {
  it('should render children correctly', () => {
    render(
      <GlassCard>
        <p>Test content</p>
      </GlassCard>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(
      <GlassCard>
        <p>Test content</p>
      </GlassCard>
    );
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('glass-card');
    expect(cardElement).toHaveClass('rounded-xl');
    expect(cardElement).toHaveClass('p-5');
  });

  it('should merge additional className prop', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <p>Test content</p>
      </GlassCard>
    );
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('custom-class');
    expect(cardElement).toHaveClass('glass-card'); // Should still have default classes
  });

  it('should render with complex nested content', () => {
    render(
      <GlassCard>
        <div>
          <h2>Card Title</h2>
          <p>Card description</p>
          <button>Action Button</button>
        </div>
      </GlassCard>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    const { container } = render(<GlassCard />);
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toBeInTheDocument();
  });

  it('should apply accent classes correctly', () => {
    const { container } = render(
      <GlassCard accent="blue">
        <p>Blue accent card</p>
      </GlassCard>
    );
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('border-l-fifa-accent');
  });

  it('should handle onClick prop', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <GlassCard onClick={handleClick}>
        <p>Clickable card</p>
      </GlassCard>
    );
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('cursor-pointer');
  });
});