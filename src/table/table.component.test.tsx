import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import Table from './table.component';
import { formatBytes } from './cellRenderers/cellContentRenderers';
import { TableCellProps } from 'react-virtualized';
import TextColumnFilter from './columnFilters/textColumnFilter.component';

describe('Table component', () => {
  let mount;

  const onSort = jest.fn();

  const tableProps = {
    data: [
      {
        TEST1: 'test1',
        TEST2: 2,
      },
    ],
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
          return <TextColumnFilter label={label} onChange={() => {}} />;
        },
      },
      {
        label: 'Test 2',
        dataKey: 'TEST2',
        cellContentRenderer: (props: TableCellProps) => {
          return formatBytes(props.cellData);
        },
      },
    ],
  };

  beforeEach(() => {
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
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
        .text()
    ).toEqual('Test 1');

    expect(
      wrapper
        .find('[role="columnheader"]')
        .at(1)
        .children()
        .find('div')
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

    wrapper
      .find('[aria-label="Show details"]')
      .first()
      .simulate('click');

    expect(wrapper.exists('#details-panel')).toBe(true);

    wrapper
      .find('[aria-label="Hide details"]')
      .first()
      .simulate('click');

    expect(wrapper.exists('#details-panel')).toBe(false);
  });

  it('renders actions column correctly', () => {
    const wrapper = mount(
      <Table
        {...tableProps}
        actions={[
          function action() {
            return (
              <button key="test" onClick={() => {}}>
                I am an action
              </button>
            );
          },
        ]}
      />
    );

    expect(wrapper.exists('[aria-colcount=3]')).toBe(true);
    expect(
      wrapper
        .find('[role="columnheader"]')
        .last()
        .children()
        .find('div')
        .text()
    ).toEqual('Actions');
    expect(wrapper.find('button').text()).toEqual('I am an action');
  });
});
