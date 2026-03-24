import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SortSelectComponent from './sortSelect.component';

describe('sortSelect', () => {
  const renderComponent = () =>
    render(
      <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <SortSelectComponent />
      </BrowserRouter>
    );

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders correctly', async () => {
    const user = userEvent.setup();

    renderComponent();

    // open the dropdown menu
    await user.click(screen.getByRole('combobox', { name: 'sort.label' }));

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

    renderComponent();

    // open the dropdown menu
    await user.click(screen.getByRole('combobox', { name: 'sort.label' }));
    await user.selectOptions(screen.getByRole('listbox'), [
      screen.getByRole('option', { name: 'sort.date_desc' }),
    ]);

    expect(window.location.search).toBe(
      `?${new URLSearchParams({
        sort: JSON.stringify({ date: 'desc' }),
      }).toString()}`
    );

    // open the dropdown menu
    await user.click(screen.getByRole('combobox', { name: 'sort.label' }));
    await user.selectOptions(screen.getByRole('listbox'), [
      screen.getByRole('option', { name: 'sort.name_asc' }),
    ]);

    expect(window.location.search).toBe(
      `?${new URLSearchParams({
        sort: JSON.stringify({ name: 'asc' }),
      }).toString()}`
    );
  });

  it('shows selected sort correctly on first render', () => {
    const initialQuery = new URLSearchParams({
      sort: JSON.stringify({ fileSize: 'asc' }),
    });

    window.history.replaceState({}, '', `/?${initialQuery.toString()}`);

    renderComponent();

    expect(
      within(screen.getByRole('combobox', { name: 'sort.label' })).getByText(
        'sort.size_asc'
      )
    ).toBeInTheDocument();
  });
});
