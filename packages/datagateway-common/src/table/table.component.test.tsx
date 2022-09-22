import React from 'react';
import { mount } from 'enzyme';
import Table, { ColumnType } from './table.component';
import { formatBytes } from './cellRenderers/cellContentRenderers';
import { TableCellProps } from 'react-virtualized';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import SelectHeader from './headerRenderers/selectHeader.component';
import ReactTestUtils from 'react-dom/test-utils';

describe('Table component', () => {
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

  afterEach(() => {
    onSort.mockClear();
  });

  it('renders data columns correctly', () => {
    const wrapper = mount(<Table {...tableProps} />);

    expect(wrapper.exists('[aria-colcount=2]')).toBe(true);

    expect(
      wrapper
        .find('[role="columnheader"]')
        .at(0)
        .children()
        .find('div')
        .first()
        .text()
      // Empty Selects (like the one in textColumnFilter) render a zero width space character
    ).toEqual('Test 1\u200B\u200B');

    expect(
      wrapper
        .find('[role="columnheader"]')
        .at(1)
        .children()
        .find('div')
        .first()
        .text()
    ).toEqual('Test 2');

    expect(
      wrapper
        .find('[role="row"]')
        .find('[role="gridcell"]')
        .first()
        .find('p')
        .text()
    ).toEqual('test1');

    expect(
      wrapper
        .find('[role="row"]')
        .find('[role="gridcell"]')
        .last()
        .find('p')
        .text()
    ).toEqual('2 B');
  });

  it('calls onSort function when sort label clicked', () => {
    const wrapper = mount(<Table {...tableProps} />);

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

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
    const wrapper = mount(<Table {...sortedTableProps} />);
    wrapper.update();

    expect(onSort).toHaveBeenCalledWith('TEST1', 'asc', 'replace');
    expect(onSort).toHaveBeenCalledWith('TEST2', 'desc', 'replace');
  });

  it('renders select column correctly, with both allIds defined and undefined', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        selectedRows={[]}
        onCheck={jest.fn()}
        onUncheck={jest.fn()}
        selectAllSetting={true}
      />
    );

    expect(wrapper.exists('[aria-colcount=3]')).toBe(true);
    expect(wrapper.exists('[aria-label="select all rows"]')).toBe(true);
    expect(wrapper.find(SelectHeader).prop('allIds')).toEqual([1]);

    const wrapperAllIds = mount(
      <Table
        {...tableProps}
        selectedRows={[]}
        onCheck={jest.fn()}
        onUncheck={jest.fn()}
        allIds={[1, 2, 3, 4]}
        selectAllSetting={true}
      />
    );

    expect(wrapperAllIds.exists('[aria-colcount=3]')).toBe(true);
    expect(wrapperAllIds.exists('[aria-label="select all rows"]')).toBe(true);
    expect(wrapperAllIds.find(SelectHeader).prop('allIds')).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('resizes data columns correctly when a column is resized', () => {
    const wrapper = mount(<Table {...tableProps} />);

    wrapper.update();

    expect(wrapper.find('[role="columnheader"]').at(0).prop('style')).toEqual(
      expect.objectContaining({
        flex: expect.stringContaining('1 1 512px'),
      })
    );

    ReactTestUtils.act(() => {
      wrapper.find('DataHeader').at(0).prop('resizeColumn')(
        wrapper.find('DataHeader').at(0).prop('dataKey'),
        50
      );
    });

    wrapper.update();

    expect(wrapper.find('[role="columnheader"]').at(0).prop('style')).toEqual(
      expect.objectContaining({
        flex: expect.stringContaining('0 0 562px'),
      })
    );
  });

  it('resizes all data columns correctly when a column is resized and there are expand, select and action columns', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        detailsPanel={function detailsPanel() {
          return <div>Details panel</div>;
        }}
        actions={[]}
        selectedRows={[]}
        onCheck={jest.fn()}
        onUncheck={jest.fn()}
      />
    );

    wrapper.update();

    expect(wrapper.find('[role="columnheader"]').at(2).prop('style')).toEqual(
      expect.objectContaining({
        flex: expect.stringContaining('1 1 512px'),
      })
    );

    ReactTestUtils.act(() => {
      wrapper.find('DataHeader').at(0).prop('resizeColumn')(
        wrapper.find('DataHeader').at(0).prop('dataKey'),
        40
      );
    });

    wrapper.update();

    expect(wrapper.find('[role="columnheader"]').at(2).prop('style')).toEqual(
      expect.objectContaining({
        flex: expect.stringContaining('0 0 552px'),
      })
    );
  });

  it('renders details column correctly', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        detailsPanel={function detailsPanel() {
          return <div>Details panel</div>;
        }}
      />
    );

    expect(wrapper.exists('[aria-colcount=3]')).toBe(true);
    expect(wrapper.exists('[aria-label="Show details"]')).toBe(true);
  });

  it('renders detail panel when expand button is clicked and derenders when hide button is clicked', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        detailsPanel={function detailsPanel() {
          return <div id="details-panel">Details panel</div>;
        }}
      />
    );

    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.exists('#details-panel')).toBe(true);

    wrapper.find('[aria-label="Hide details"]').last().simulate('click');

    expect(wrapper.exists('#details-panel')).toBe(false);
  });

  it('renders actions column correctly', () => {
    const wrapper = mount(
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

    expect(wrapper.exists('[aria-colcount=3]')).toBe(true);
    expect(
      wrapper.find('[role="columnheader"]').last().children().find('div').text()
    ).toEqual('Actions');
    expect(wrapper.find('button').text()).toEqual('I am an action');
  });

  it('renders correctly when no infinite loading properties are defined', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        loadMoreRows={undefined}
        totalRowCount={undefined}
      />
    );

    expect(wrapper.find('InfiniteLoader').prop('rowCount')).toBe(
      tableProps.data.length
    );
    expect(wrapper.find('InfiniteLoader').prop('loadMoreRows')).toBeInstanceOf(
      Function
    );
    expect(wrapper.find('InfiniteLoader').prop('loadMoreRows')()).resolves.toBe(
      undefined
    );
  });

  it('throws error when only one of loadMoreRows or totalRowCount are defined', () => {
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {
      // suppress react uncaught error warning as we're deliberately triggering an error!
    });

    expect(() =>
      mount(<Table {...tableProps} totalRowCount={undefined} />)
    ).toThrowError(
      'Only one of loadMoreRows and totalRowCount was defined - either define both for infinite loading functionality or neither for no infinite loading'
    );

    expect(() =>
      mount(<Table {...tableProps} loadMoreRows={undefined} />)
    ).toThrowError(
      'Only one of loadMoreRows and totalRowCount was defined - either define both for infinite loading functionality or neither for no infinite loading'
    );

    spy.mockRestore();
  });
});
