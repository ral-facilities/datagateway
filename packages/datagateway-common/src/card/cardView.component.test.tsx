import { Accordion, Chip } from '@mui/material';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import axios from 'axios';
import { CardViewProps, default as CardView } from './cardView.component';
import { TextColumnFilter } from '..';
import { Entity, Investigation } from '../app.types';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Card View', () => {
  let props: CardViewProps;
  let user: UserEvent;

  const createWrapper = (props: CardViewProps): ReactWrapper => {
    return mount(<CardView {...props} />);
  };

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
        name: 'Test 1',
        visitId: '1',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 2,
        title: 'Test 2',
        name: 'Test 2',
        visitId: '2',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 3,
        title: 'Test 3',
        name: 'Test 3',
        visitId: '3',
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

  it('applying custom filter on panel and on card', async () => {
    let updatedProps = {
      ...props,
      customFilters: [
        {
          label: 'Type ID',
          dataKey: 'type.id',
          filterItems: [
            {
              name: '1',
              count: '1',
            },
            {
              name: '2',
              count: '1',
            },
          ],
        },
      ],
    };

    const { rerender } = render(<CardView {...updatedProps} />);

    // Open custom filters
    await user.click(await screen.findByText('Type ID'));

    const chipList = within(await screen.findByLabelText('filter-by-list'));
    expect(chipList.getByLabelText('1')).toBeInTheDocument();
    expect(chipList.getByLabelText('2')).toBeInTheDocument();

    // Apply custom filters
    await user.click(chipList.getByLabelText('1'));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onFilter).toHaveBeenNthCalledWith(1, 'type.id', ['1']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      page: 1,
      filters: { 'type.id': ['1'] },
    };

    // Mock console.error() when updating the filter panels. We use Accordions
    // with dynamic default values, which works, but would log an error.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
    rerender(<CardView {...updatedProps} />);

    // Apply second filter
    await user.click(
      within(await screen.findByLabelText('filter-by-list')).getByText('2')
    );

    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
    expect(onFilter).toHaveBeenNthCalledWith(2, 'type.id', ['1', '2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      filters: { 'type.id': ['1', '2'] },
    };
    rerender(<CardView {...updatedProps} />);

    // Remove filter
    expect(await screen.findByText('Type ID - 1')).toBeInTheDocument();
    // focus on the chip, then press the backspace key to remove the chip
    screen.getByText('Type ID - 1').parentElement.focus();
    await user.keyboard('{Backspace}');
    expect(onPageChange).toHaveBeenNthCalledWith(3, 1);
    expect(onFilter).toHaveBeenNthCalledWith(3, 'type.id', ['2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      filters: { 'type.id': ['2'] },
    };
    rerender(<CardView {...updatedProps} />);

    // Remove second filter
    expect(await screen.findByText('Type ID - 2')).toBeInTheDocument();
    // focus on the chip, then press the backspace key to remove the chip
    screen.getByText('Type ID - 2').parentElement.focus();
    await user.keyboard('{Backspace}');
    expect(onPageChange).toHaveBeenNthCalledWith(4, 1);
    expect(onFilter).toHaveBeenNthCalledWith(4, 'type.id', null);
  });

  it('custom filter applied when non-custom filter already in state', () => {
    const updatedProps = {
      ...props,
      customFilters: [
        {
          label: 'Type ID',
          dataKey: 'type.id',
          filterItems: [
            {
              name: '1',
              count: '1',
            },
            {
              name: '2',
              count: '1',
            },
          ],
        },
      ],
      filters: { 'type.id': { value: 'abc', type: 'include' } },
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[data-testid="card"]').at(0).find(Chip).text()
    ).toEqual('1');

    // Open custom filters
    const typePanel = wrapper.find(Accordion).first();
    typePanel.find('div').at(1).simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');

    // Apply custom filters
    typePanel.find(Chip).first().find('div').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onFilter).toHaveBeenNthCalledWith(1, 'type.id', ['1']);
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
    for (const element of await screen.findAllByText('Title')) {
      expect(element).toBeInTheDocument();
    }
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
      buttons: [(entity: Entity) => <button>TEST</button>],
    };
    render(<CardView {...updatedProps} />);
    for (const btn of await screen.findAllByRole('button', { name: 'TEST' })) {
      expect(btn).toBeInTheDocument();
    }
  });

  it('moreInformation displays correctly', async () => {
    const moreInformation = (entity: Entity): React.ReactElement => <p>TEST</p>;
    const updatedProps = {
      ...props,
      moreInformation: moreInformation,
    };
    render(<CardView {...updatedProps} />);
    for (const element of await screen.findAllByLabelText(
      'card-more-information'
    )) {
      expect(element).toBeInTheDocument();
    }
  });

  it('title.content displays correctly', async () => {
    const content = (entity: Entity): React.ReactElement => (
      <p id="test-title-content">TEST</p>
    );
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', content: content },
    };
    render(<CardView {...updatedProps} />);
    for (const element of await screen.findAllByText('TEST')) {
      expect(element).toBeInTheDocument();
    }
  });

  it('sort applied correctly', async () => {
    let updatedProps = { ...props, page: 1 };
    const { rerender } = render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by TITLE' })
    );
    expect(onSort).toHaveBeenNthCalledWith(1, 'title', 'asc', 'push');

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
    expect(onSort).toHaveBeenNthCalledWith(2, 'title', 'desc', 'push');

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
    expect(onSort).toHaveBeenNthCalledWith(3, 'title', null, 'push');
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

    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'replace');
    expect(onSort).toHaveBeenCalledWith('name', 'desc', 'replace');
    expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace');
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
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push');
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
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push');
  });

  it('page changed when sort applied', async () => {
    const updatedProps = { ...props, page: 2 };
    render(<CardView {...updatedProps} />);

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by TITLE' })
    );

    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'push');
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
          content: (entity: Entity) => 'Content',
        },
      ],
      page: 1,
    };
    render(<CardView {...updatedProps} />);

    for (const element of await screen.findAllByText('visitId:')) {
      expect(element).toBeInTheDocument();
    }
    for (const element of await screen.findAllByText('1')) {
      expect(element).toBeInTheDocument();
    }
    for (const element of await screen.findAllByText('Name:')) {
      expect(element).toBeInTheDocument();
    }
    for (const element of await screen.findAllByText('Content')) {
      expect(element).toBeInTheDocument();
    }

    // Click to sort ascending
    await user.click(
      await screen.findByRole('button', { name: 'Sort by VISITID' })
    );
    expect(onSort).toHaveBeenCalledWith('visitId', 'asc', 'push');
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
          content: (entity: Entity) => 'Content',
          noTooltip: true,
        },
      ],
    };
    render(<CardView {...updatedProps} />);

    for (const element of await screen.findAllByText('Name:')) {
      expect(element).toBeInTheDocument();
    }
    for (const element of await screen.findAllByText('Content')) {
      expect(element).toBeInTheDocument();
    }
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
