import { render, screen } from '@testing-library/react';
import SortSelectComponent from './sortSelect.component';
import { MemoryRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

describe('sortSelect', () => {
  it('renders correctly', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SortSelectComponent />
      </MemoryRouter>
    );

    // open the dropdown menu
    await user.click(screen.getByRole('button', { name: /sort.label/ }));

    expect(
      await screen.findByRole('option', { name: 'sort.date_desc' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'sort.date_asc' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'sort.name_asc' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'sort.size_asc' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'sort.size_desc' })
    ).toBeInTheDocument();
  });

  it('updates URL correctly accordingly to selected sort', async () => {
    const user = userEvent.setup();
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <SortSelectComponent />
      </Router>
    );

    // open the dropdown menu
    await user.click(screen.getByRole('button', { name: /sort.label/ }));
    await user.selectOptions(screen.getByRole('listbox'), [
      screen.getByRole('option', { name: 'sort.date_desc' }),
    ]);

    expect(history.location.search).toBe(
      `?${new URLSearchParams({
        sort: JSON.stringify({ date: 'desc' }),
      }).toString()}`
    );

    // open the dropdown menu
    await user.click(screen.getByRole('button', { name: /sort.label/ }));
    await user.selectOptions(screen.getByRole('listbox'), [
      screen.getByRole('option', { name: 'sort.name_asc' }),
    ]);

    expect(history.location.search).toBe(
      `?${new URLSearchParams({
        sort: JSON.stringify({ name: 'asc' }),
      }).toString()}`
    );
  });

  it('shows selected sort correctly on first render', () => {
    const initialQuery = new URLSearchParams({
      sort: JSON.stringify({ fileSize: 'asc' }),
    });

    const history = createMemoryHistory();
    history.replace({
      search: `?${initialQuery.toString()}`,
    });

    render(
      <Router history={history}>
        <SortSelectComponent />
      </Router>
    );

    expect(
      screen.getByRole('button', { name: 'sort.label sort.size_asc' })
    ).toBeInTheDocument();
  });
});
