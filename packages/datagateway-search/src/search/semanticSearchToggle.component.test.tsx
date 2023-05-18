import * as React from 'react';
import type { History } from 'history';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';
import SemanticSearchToggle from './semanticSearchToggle.component';
import userEvent from '@testing-library/user-event';

describe('SemanticSearchToggle', () => {
  let history: History;

  function Wrapper({
    children,
  }: {
    children: React.ReactElement;
  }): JSX.Element {
    return <Router history={history}>{children}</Router>;
  }

  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('is switched on when semantic search is enabled in URL', () => {
    history.replace('?semanticSearch=true');

    render(<SemanticSearchToggle />, { wrapper: Wrapper });

    expect(
      screen.getByRole('checkbox', { name: 'Use semantic search' })
    ).toBeChecked();
  });

  it('is switched off when semantic search is disabled in URL', () => {
    history.replace('?semanticSearch=false');

    render(<SemanticSearchToggle />, { wrapper: Wrapper });

    expect(
      screen.getByRole('checkbox', { name: 'Use semantic search' })
    ).not.toBeChecked();
  });

  it('can be toggled and updates URL query params accordingly', async () => {
    const user = userEvent.setup();

    history.replace('?semanticSearch=true');

    render(<SemanticSearchToggle />, { wrapper: Wrapper });

    const toggle = screen.getByRole('checkbox', {
      name: 'Use semantic search',
    });

    await user.click(
      screen.getByRole('checkbox', { name: 'Use semantic search' })
    );

    expect(toggle).not.toBeChecked();
    expect(history.location.search).toEqual('?semanticSearch=false');
  });
});
