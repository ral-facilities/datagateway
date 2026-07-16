import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseSearchToQuery, usePushQueryParams } from 'datagateway-common';
import React from 'react';
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

  const renderComponent = (
    type: React.ComponentProps<typeof DOITypeSelector>['type']
  ): RenderResult =>
    render(
      <MemoryRouter>
        <DOITypeSelector type={type} />
      </MemoryRouter>
    );

  beforeEach(() => {
    user = userEvent.setup();

    vi.mocked(usePushQueryParams).mockReturnValue(mockPushQueryParams);
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays button group correctly', () => {
    renderComponent('myDOIs');

    expect(
      screen.getByRole('group', {
        name: 'my_doi_table.type_button_group_aria_label',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.all',
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

  it('displays myDOIs button groups correctly with session DOI type selected', () => {
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: { view: 'session', open: true },
    });
    renderComponent('myDOIs');

    expect(
      screen.getByRole('group', {
        name: 'my_doi_table.type_button_group_aria_label',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.all',
        pressed: false,
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
        pressed: true,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('group', {
        name: 'my_doi_table.open_button_group_aria_label',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.open_or_closed',
        pressed: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.open',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.closed',
        pressed: false,
      })
    ).toBeInTheDocument();
  });

  it('displays button group correctly for all dois type', () => {
    renderComponent('allDOIs');

    expect(
      screen.getByRole('group', {
        name: 'all_doi_table.type_button_group_aria_label',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.all',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.user',
        pressed: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.session',
        pressed: false,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('group', {
        name: 'all_doi_table.open_button_group_aria_label',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.open_or_closed',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.open',
        pressed: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'all_doi_table.closed',
        pressed: false,
      })
    ).toBeInTheDocument();
  });

  it('updates filters when a type button is clicked', async () => {
    renderComponent('myDOIs');

    await user.click(
      screen.getByRole('button', {
        name: 'my_doi_table.session',
      })
    );

    expect(mockPushQueryParams).toHaveBeenCalledWith({
      doiType: { view: 'session' },
    });
  });

  it('updates filters when open button is clicked', async () => {
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: { view: 'all', open: true },
    });
    renderComponent('myDOIs');

    await user.click(
      screen.getByRole('button', {
        name: 'my_doi_table.open_or_closed',
      })
    );

    expect(mockPushQueryParams).toHaveBeenCalledWith({
      doiType: { view: 'all' },
    });
  });

  it('updates filters when open and closed button is clicked', async () => {
    renderComponent('allDOIs');

    await user.click(
      screen.getByRole('button', {
        name: 'all_doi_table.open',
      })
    );

    expect(mockPushQueryParams).toHaveBeenCalledWith({
      doiType: { view: 'all', open: true },
    });
  });

  it('parses current doiType from query params correctly', async () => {
    vi.mocked(parseSearchToQuery, { partial: true }).mockReturnValue({
      doiType: { view: 'user' },
    });

    renderComponent('myDOIs');

    expect(
      screen.getByRole('button', {
        name: 'my_doi_table.user',
        pressed: true,
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
