import * as React from 'react';
import Table, { ColumnType } from './table.component';
import { formatBytes } from './cellRenderers/cellContentRenderers';
import { TableCellProps } from 'react-virtualized';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import { render, screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Table component', () => {
  let user: UserEvent;

  const onSort = jest.fn();

  const tableProps = {
    data: [
      {
        id: 1,
        TEST1: 'test1',
        TEST2: 2,
      },
    ],
    loadMoreRows: jest.fn(),
    totalRowCount: 50,
    sort: {},
    onSort,
    columns: [
      {
        label: 'Test 1',
        dataKey: 'TEST1',
        filterComponent: function textFilter(
          label: string,
          dataKey: string
        ): React.ReactElement {
          return (
            <TextColumnFilter
              label={label}
              onChange={jest.fn()}
              value={undefined}
            />
          );
        },
      },
      {
        label: 'Test 2',
        dataKey: 'TEST2',
        cellContentRenderer: (cellProps: TableCellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
    ] as ColumnType[],
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    onSort.mockClear();
  });

  it('renders data columns correctly', async () => {
    render(<Table {...tableProps} />);

    // expect "Test 1" and "Test 2" column to exist
    expect(await screen.findByText('Test 1')).toBeInTheDocument();
    expect(await screen.findByText('Test 2')).toBeInTheDocument();

    expect(await screen.findByText('test1')).toBeInTheDocument();
    expect(await screen.findByText('2 B')).toBeInTheDocument();
  });

  it('calls onSort function when sort label clicked', async () => {
    render(<Table {...tableProps} />);
    await user.click(await screen.findByText('Test 1'));
    expect(onSort).toHaveBeenCalledWith('TEST1', 'asc', 'push');
  });

  it('calls onSort function when defaultSort has been specified', () => {
    const sortedTableProps = {
      ...tableProps,
      columns: [
        { ...tableProps.columns[0], defaultSort: 'asc' },
        { ...tableProps.columns[1], defaultSort: 'desc' },
      ],
    };
    render(<Table {...sortedTableProps} />);

    expect(onSort).toHaveBeenCalledWith('TEST1', 'asc', 'replace');
    expect(onSort).toHaveBeenCalledWith('TEST2', 'desc', 'replace');
  });

  it('renders select column correctly', async () => {
    render(
      <Table
        {...tableProps}
        selectedRows={[]}
        onCheck={jest.fn()}
        onUncheck={jest.fn()}
        selectAllSetting={true}
      />
    );

    expect(
      await screen.findByRole('checkbox', { name: 'select all rows' })
    ).toBeInTheDocument();
  });

  it.skip('resizes data columns correctly when a column is resized', () => {
    // TODO: I think testing-library doesn't support dragging interaction at the moment
    //       the drag example code here only works with ar eal browser:
    //       https://testing-library.com/docs/example-drag/
  });

  it.skip('resizes all data columns correctly when a column is resized and there are expand, select and action columns', () => {
    // TODO: I think testing-library doesn't support dragging interaction at the moment
    //       the drag example code here only works with ar eal browser:
    //       https://testing-library.com/docs/example-drag/
  });

  it('renders details column correctly', async () => {
    render(
      <Table
        {...tableProps}
        detailsPanel={function detailsPanel() {
          return <div>Details panel</div>;
        }}
      />
    );

    expect(
      await screen.findByRole('button', { name: 'Show details' })
    ).toBeInTheDocument();
  });

  it('renders detail panel when expand button is clicked and derenders when hide button is clicked', async () => {
    render(
      <Table
        {...tableProps}
        detailsPanel={function detailsPanel() {
          return <div data-testid="details-panel">Details panel</div>;
        }}
      />
    );

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(await screen.findByTestId('details-panel')).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', { name: 'Hide details' })
    );

    await waitFor(() => {
      expect(screen.queryByRole('details-panel')).toBeNull();
    });
  });

  it('renders actions column correctly', async () => {
    render(
      <Table
        {...tableProps}
        actions={[
          function action() {
            return (
              <button key="test" onClick={jest.fn()}>
                I am an action
              </button>
            );
          },
        ]}
      />
    );

    expect(await screen.findByText('Actions')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'I am an action' })
    ).toBeInTheDocument();
  });

  it('renders correctly when no infinite loading properties are defined', async () => {
    render(
      <Table
        {...tableProps}
        loadMoreRows={undefined}
        totalRowCount={undefined}
      />
    );

    expect(await screen.findByText('test1')).toBeInTheDocument();
  });

  it('throws error when only one of loadMoreRows or totalRowCount are defined', () => {
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {
      // suppress react uncaught error warning as we're deliberately triggering an error!
    });

    expect(() =>
      render(<Table {...tableProps} totalRowCount={undefined} />)
    ).toThrowError(
      'Only one of loadMoreRows and totalRowCount was defined - either define both for infinite loading functionality or neither for no infinite loading'
    );

    expect(() =>
      render(<Table {...tableProps} loadMoreRows={undefined} />)
    ).toThrowError(
      'Only one of loadMoreRows and totalRowCount was defined - either define both for infinite loading functionality or neither for no infinite loading'
    );

    spy.mockRestore();
  });
});
