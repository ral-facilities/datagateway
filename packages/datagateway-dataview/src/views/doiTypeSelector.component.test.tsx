import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseSearchToQuery, usePushQueryParams } from 'datagateway-common';
import { MemoryRouter } from 'react-router-dom';
import DOITypeSelector from './doiTypeSelector.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    usePushQueryParams: vi.fn(),
    parseSearchToQuery: vi.fn(),
  };
});

describe('DOI Type Selector', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockPushQueryParams = vi.fn();

  const renderComponent = (): RenderResult =>
    render(
      <MemoryRouter>
        <DOITypeSelector />
      </MemoryRouter>
    );

  beforeEach(() => {
    user = userEvent.setup();

    vi.mocked(usePushQueryParams).mockReturnValue(mockPushQueryParams);
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays button group correctly', () => {
    renderComponent();

    expect(
      screen.getByRole('group', {
        name: 'my_doi_table.button_group_aria_label',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.minter',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.user',
        pressed: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.session',
        pressed: false,
      })
    ).toBeInTheDocument();
  });

  it('updates filters when a button is clicked', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'my_doi_table.session',
      })
    );

    expect(mockPushQueryParams).toHaveBeenCalledWith({ doiType: 'session' });
  });

  it('parses current doiType from query params correctly', async () => {
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: 'user',
    });

    renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.user',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.minter',
        pressed: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.session',
        pressed: false,
      })
    ).toBeInTheDocument();
  });
});
