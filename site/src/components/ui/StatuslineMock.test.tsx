import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useWizardStore } from '@/lib/store';
import { StatuslineMock } from './StatuslineMock';

beforeEach(() => {
  useWizardStore.getState().reset();
});

describe('StatuslineMock', () => {
  it('renders rows of enabled cells in canonical order', () => {
    // Default state has 5h, 7d, session, ctxbar enabled
    const { container } = render(<StatuslineMock />);
    // Two rows in wide mode
    const rows = container.querySelectorAll('[data-row]');
    expect(rows.length).toBe(2);
    // First row: 5h + 7d
    expect(rows[0]?.textContent).toMatch(/5h/);
    expect(rows[0]?.textContent).toMatch(/7d/);
    // Second row: session + ctxbar
    expect(rows[1]?.textContent).toMatch(/session/);
    expect(rows[1]?.textContent).toMatch(/ctxbar/);
  });

  it('shows session cost from store', () => {
    render(<StatuslineMock />);
    // Default sessionMock.cost is 0.42
    expect(screen.getByText(/\$0\.42/)).toBeInTheDocument();
  });

  it('updates rows when cells are toggled', () => {
    useWizardStore.getState().toggleCell('5h');  // turn off
    useWizardStore.getState().toggleCell('today'); // turn on
    const { container } = render(<StatuslineMock />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\b5h\b/);  // 5h gone
    expect(text).toMatch(/today/);  // today appears
  });

  it('renders empty placeholder when no cells enabled', () => {
    // Toggle off all defaults
    for (const k of ['5h', '7d', 'session', 'ctxbar'] as const) {
      useWizardStore.getState().toggleCell(k);
    }
    render(<StatuslineMock />);
    expect(screen.getByText(/no cells enabled/i)).toBeInTheDocument();
  });
});
