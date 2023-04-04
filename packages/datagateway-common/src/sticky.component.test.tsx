import React from 'react';
import { render, screen } from '@testing-library/react';
import Sticky from './sticky.component';
import useSticky from './hooks/useSticky';

jest.mock('./hooks/useSticky', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Sticky component', () => {
  it('renders children with fixed position and 100% width when sticky', async () => {
    (useSticky as jest.MockedFn<typeof useSticky>).mockReturnValue({
      isSticky: true,
    });
    render(
      <Sticky>
        <div />
      </Sticky>
    );

    const paper = screen.getByTestId('sticky-paper');

    // should be elevated when sticky
    expect(paper).toHaveStyle(
      'z-index: 9; position: fixed; width: 100%; top: 0'
    );
  });

  it('renders children normally when not sticky', () => {
    (useSticky as jest.MockedFn<typeof useSticky>).mockReturnValue({
      isSticky: false,
    });
    render(
      <Sticky>
        <div />
      </Sticky>
    );

    const paper = screen.getByTestId('sticky-paper');

    // should not be elevated
    expect(paper).not.toHaveStyle('position: fixed; width: 100%; top: 0');
    expect(paper).toHaveStyle('z-index: 9');
  });
});
