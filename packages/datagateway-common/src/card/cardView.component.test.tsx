import * as React from 'react';
import axios from 'axios';
import CardView, { type CardViewProps } from './cardView.component';
import { TextColumnFilter } from '..';
import type { Entity, Investigation } from '../app.types';
import { render, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Card View', () => {
  let props: CardViewProps;
  let user: UserEvent;

  const onFilter = jest.fn();
  const onPageChange = jest.fn();
  const onSort = jest.fn();
  const onResultsChange = jest.fn();

  beforeEach(() => {
    user = userEvent.setup();
    const data: Investigation[] = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test name 1',
        visitId: 'visit id 1',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 2,
        title: 'Test 2',
        name: 'Test name 2',
        visitId: 'visit id 2',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 3,
        title: 'Test 3',
        name: 'Test name 3',
        visitId: 'visit id 3',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
    ];
    props = {
      data,
      totalDataCount: 3,
      sort: {},
      filters: {},
      page: null,
      results: null,
      paginationPosition: 'both',
      loadedCount: true,
      loadedData: true,
      title: { dataKey: 'title' },
      onPageChange: onPageChange,
      onFilter: onFilter,
      onSort: onSort,
      onResultsChange: onResultsChange,
    };

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = render(<CardView {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('advancedFilter displayed when filter component given', async () => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={{ value: '', type: 'include' }}
        onChange={jest.fn()}
      />
    );
    const updatedProps = {
      ...props,
      title: {
        dataKey: 'title',
        label: 'Title',
        filterComponent: textFilter,
      },
    };

    render(<CardView {...updatedProps} />);

    await user.click(
      screen.getByRole('button', { name: 'advanced_filters.show' })
    );

    expect(
      screen.getByRole('textbox', { name: 'Filter by Title', hidden: true })
    ).toBeInTheDocument();
  });

  it('filter message displayed when loadedData and totalDataCount is 0', async () => {
    const updatedProps = {
      ...props,
      loadedData: true,
      totalDataCount: 0,
    };
    render(<CardView {...updatedProps} />);
    expect(
      await screen.findByText('loading.filter_message')
    ).toBeInTheDocument();
  });

  it('buttons display correctly', async () => {
    const updatedProps = {
      ...props,
      buttons: [(entity: Entity) => <button>{entity.name}</button>],
    };

    render(<CardView {...updatedProps} />);

    const cards = screen.getAllByTestId('card');

    expect(
      within(within(cards[0]).getByLabelText('card-buttons')).getByRole(
        'button',
        { name: 'Test name 1' }
      )
    ).toBeInTheDocument();
    expect(
      within(within(cards[1]).getByLabelText('card-buttons')).getByRole(
        'button',
        { name: 'Test name 2' }
      )
    ).toBeInTheDocument();
    expect(
      within(within(cards[2]).getByLabelText('card-buttons')).getByRole(
        'button',
        { name: 'Test name 3' }
      )
    ).toBeInTheDocument();
  });

  it('moreInformation displays correctly', async () => {
    const moreInformation = (entity: Entity): React.ReactElement => (
      <p>More information for {entity.name}</p>
    );
    const updatedProps = {
      ...props,
      moreInformation: moreInformation,
    };

    render(<CardView {...updatedProps} />);

    const cards = screen.getAllByTestId('card');

    await user.click(
      within(cards[0]).getByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      within(
        within(cards[0]).getByLabelText('card-more-info-details')
      ).getByText('More information for Test name 1')
    ).toBeInTheDocument();

    await user.click(
      within(cards[1]).getByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      within(
        within(cards[1]).getByLabelText('card-more-info-details')
      ).getByText('More information for Test name 2')
    ).toBeInTheDocument();

    await user.click(
      within(cards[2]).getByRole('button', { name: 'card-more-info-expand' })
    );
    expect(
      within(
        within(cards[2]).getByLabelText('card-more-info-details')
      ).getByText('More information for Test name 3')
    ).toBeInTheDocument();
  });

  it('title.content displays correctly', async () => {
    const content = (entity: Entity): React.ReactElement => (
      <p>Custom {entity.title}</p>
    );
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', content: content },
    };

    render(<CardView {...updatedProps} />);

    const cards = screen.getAllByTestId('card');

    expect(
      within(within(cards[0]).getByLabelText('card-title')).getByText(
        'Custom Test 1'
      )
    ).toBeInTheDocument();
    expect(
      within(within(cards[1]).getByLabelText('card-title')).getByText(
        'Custom Test 2'
      )
    ).toBeInTheDocument();
    expect(
      within(within(cards[2]).getByLabelText('card-title')).getByText(
        'Custom Test 3'
      )
    ).toBeInTheDocument();
  });

  it('sort applied correctly', async () => {
    let updatedProps = { ...props, page: 1 };
    const { rerender } = render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by TITLE' })
    );
    expect(onSort).toHaveBeenNthCalledWith(1, 'title', 'asc', 'push', false);

    updatedProps = {
      ...updatedProps,
      sort: { title: 'asc' },
    };
    rerender(<CardView {...updatedProps} />);

    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by TITLE, current direction ascending',
      })
    );
    expect(onSort).toHaveBeenNthCalledWith(2, 'title', 'desc', 'push', false);

    updatedProps = {
      ...updatedProps,
      sort: { title: 'desc' },
    };
    rerender(<CardView {...updatedProps} />);

    await user.click(
      await screen.findByRole('button', {
        name: 'Sort by TITLE, current direction descending',
      })
    );
    expect(onSort).toHaveBeenNthCalledWith(3, 'title', null, 'push', false);
  });

  it('default sort applied correctly', () => {
    const updatedProps: CardViewProps = {
      ...props,
      title: { ...props.title, defaultSort: 'asc' },
      description: { dataKey: 'name', label: 'Name', defaultSort: 'desc' },
      information: [
        { dataKey: 'visitId' },
        {
          dataKey: 'test',
          label: 'Name',
          defaultSort: 'asc',
        },
      ],
    };
    render(<CardView {...updatedProps} />);

    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'replace', false);
    expect(onSort).toHaveBeenCalledWith('name', 'desc', 'replace', false);
    expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace', false);
  });

  it('can sort by description with label', async () => {
    const updatedProps = {
      ...props,
      page: 1,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', label: 'Name' },
    };
    render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by NAME' })
    );
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push', false);
  });

  it('can sort by description without label', async () => {
    const updatedProps = {
      ...props,
      page: 1,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name' },
    };
    render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by NAME' })
    );
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push', false);
  });

  it('page changed when sort applied', async () => {
    const updatedProps = { ...props, page: 2 };
    render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by TITLE' })
    );

    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'push', false);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('information displays and sorts correctly', async () => {
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [
        { dataKey: 'visitId' },
        {
          dataKey: 'name',
          label: 'Name',
          content: (entity: Entity) => entity.name,
        },
      ],
      page: 1,
    };
    render(<CardView {...updatedProps} />);

    const cards = await screen.findAllByTestId('card');

    expect(within(cards[0]).getByText('visitId:')).toBeInTheDocument();
    expect(within(cards[0]).getByText('visit id 1')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Name:')).toBeInTheDocument();
    expect(
      within(cards[0]).getByLabelText('card-description')
    ).toHaveTextContent('Test name 1');
    // information content is wrapped with ArrowTooltip, which automatically gives its child
    // an aria-label that is the same as the content of the tooltip
    expect(within(cards[0]).getByLabelText('Test name 1')).toHaveTextContent(
      'Test name 1'
    );

    expect(within(cards[1]).getByText('visitId:')).toBeInTheDocument();
    expect(within(cards[1]).getByText('visit id 2')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Name:')).toBeInTheDocument();
    expect(
      within(cards[1]).getByLabelText('card-description')
    ).toHaveTextContent('Test name 2');
    expect(within(cards[1]).getByLabelText('Test name 2')).toHaveTextContent(
      'Test name 2'
    );

    expect(within(cards[2]).getByText('visitId:')).toBeInTheDocument();
    expect(within(cards[2]).getByText('visit id 3')).toBeInTheDocument();
    expect(within(cards[2]).getByText('Name:')).toBeInTheDocument();
    expect(
      within(cards[2]).getByLabelText('card-description')
    ).toHaveTextContent('Test name 3');
    expect(within(cards[2]).getByLabelText('Test name 3')).toHaveTextContent(
      'Test name 3'
    );

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by VISITID' })
    );
    expect(onSort).toHaveBeenCalledWith('visitId', 'asc', 'push', false);
  });

  it('calls onSort with correct parameters when shift key is pressed', async () => {
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [
        { dataKey: 'visitId' },
        {
          dataKey: 'name',
          label: 'Name',
          content: (entity: Entity) => entity.name,
        },
      ],
      page: 1,
    };
    render(<CardView {...updatedProps} />);

    // Click with shift to sort ascending
    await user.keyboard('{Shift>}');
    await user.click(
      await screen.findByRole('button', { name: 'Sort by VISITID' })
    );
    await user.keyboard('{/Shift}');

    expect(onSort).toHaveBeenCalledWith('visitId', 'asc', 'push', true);

    await user.click(
      await screen.findByRole('button', { name: 'Sort by NAME' })
    );

    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push', false);
  });

  it('displays correct icon when no sort applied', async () => {
    render(<CardView {...props} />);

    const cards = await screen.findAllByRole('button', { name: /Sort by/ });
    expect(
      within(cards[0]).getByTestId(`ArrowDownwardIcon`)
    ).toBeInTheDocument();

    await user.keyboard('{Shift>}');
    expect(within(cards[0]).getByTestId(`AddIcon`)).toBeInTheDocument();
    await user.keyboard('{/Shift}');
  });

  it('information displays with content that has no tooltip', async () => {
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [
        {
          dataKey: 'name',
          label: 'Name',
          content: (entity: Entity) => entity.name,
          noTooltip: true,
        },
      ],
    };

    render(<CardView {...updatedProps} />);

    const cards = await screen.findAllByTestId('card');

    expect(within(cards[0]).getByText('Name:')).toBeInTheDocument();
    expect(
      within(cards[0]).getByLabelText('card-description')
    ).toHaveTextContent('Test name 1');
    expect(
      within(cards[0]).getByTestId(`card-info-data-Name`)
    ).toHaveTextContent('Test name 1');

    expect(within(cards[1]).getByText('Name:')).toBeInTheDocument();
    expect(
      within(cards[1]).getByLabelText('card-description')
    ).toHaveTextContent('Test name 2');
    expect(
      within(cards[1]).getByTestId(`card-info-data-Name`)
    ).toHaveTextContent('Test name 2');
  });

  it('cannot sort when fields are disabled', async () => {
    const updatedProps = {
      ...props,
      page: 1,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [{ dataKey: 'visitId', disableSort: true }],
    };
    render(<CardView {...updatedProps} />);
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Sort by TITLE' })
      ).toBeNull();
      expect(screen.queryByRole('button', { name: 'Sort by NAME' })).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Sort by VISITID' })
      ).toBeNull();
    });
  });

  it('pagination dispatches onPageChange', async () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1],
      results: 1,
    };

    render(<CardView {...updatedProps} />);

    await user.click(
      (
        await screen.findAllByRole('button', { name: 'page 1' })
      )[0]
    );
    expect(onPageChange).toHaveBeenCalledTimes(0);

    await user.click(
      (
        await screen.findAllByRole('button', { name: 'Go to page 2' })
      )[1]
    );
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
  });

  it('page changed when max page exceeded', () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1],
      results: 1,
      page: 4,
    };
    render(<CardView {...updatedProps} />);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
  });

  it('results changed when max results exceeded', () => {
    const updatedProps = {
      ...props,
      totalDataCount: 100,
      resultsOptions: [10, 20, 30],
      results: 40,
      page: 1,
    };
    render(<CardView {...updatedProps} />);
    expect(onResultsChange).toHaveBeenNthCalledWith(1, 10);
  });

  it('results changed when max results exceeded when total data count is between 10 and 20)', () => {
    const updatedProps = {
      ...props,
      totalDataCount: 14,
      resultsOptions: [10, 20, 30],
      results: 30,
      page: 1,
    };
    render(<CardView {...updatedProps} />);
    expect(onResultsChange).toHaveBeenNthCalledWith(1, 10);
  });

  it('selector sends pushQuery with results', async () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1, 2, 3],
      results: 1,
      page: 2,
    };

    render(<CardView {...updatedProps} />);

    await user.selectOptions(
      await screen.findByLabelText('app.max_results'),
      '2'
    );

    expect(onResultsChange).toHaveBeenNthCalledWith(2, '2');
  });

  it('selector sends pushQuery with results and page', async () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1, 2, 3],
      results: 1,
      page: 2,
    };

    render(<CardView {...updatedProps} />);

    await user.selectOptions(
      await screen.findByLabelText('app.max_results'),
      '3'
    );

    expect(onResultsChange).toHaveBeenNthCalledWith(2, '3');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
  });
});
