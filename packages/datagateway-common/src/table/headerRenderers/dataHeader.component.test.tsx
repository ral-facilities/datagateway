import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import DataHeader from './dataHeader.component';
import TextColumnFilter from '../columnFilters/textColumnFilter.component';

describe('Data column header component', () => {
  let user: UserEvent;
  const onSort = jest.fn();
  const resizeColumn = jest.fn();
  const dataHeaderProps = {
    label: 'Test',
    labelString: 'Test',
    dataKey: 'test',
    sort: {},
    onSort,
    resizeColumn,
    icon: function Icon() {
      return <div>Test</div>;
    },
  };

  const filterComponent = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextColumnFilter label={label} onChange={jest.fn()} value={undefined} />
  );

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    onSort.mockClear();
    resizeColumn.mockClear();
  });

  it('renders correctly without sort or filter', async () => {
    const { asFragment } = render(
      <DataHeader {...dataHeaderProps} disableSort={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sort but no filter', async () => {
    const { asFragment } = render(<DataHeader {...dataHeaderProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with filter but no sort', async () => {
    const { asFragment } = render(
      <DataHeader
        {...dataHeaderProps}
        disableSort={true}
        filterComponent={filterComponent}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sort and filter', async () => {
    const { asFragment } = render(
      <DataHeader {...dataHeaderProps} filterComponent={filterComponent} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', async () => {
      render(<DataHeader {...dataHeaderProps} />);
      await user.click(await screen.findByRole('button', { name: 'Test' }));
      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'push');
    });

    it('sets desc order', async () => {
      render(
        <DataHeader
          {...dataHeaderProps}
          sort={{
            test: 'asc',
          }}
        />
      );
      await user.click(await screen.findByRole('button', { name: 'Test' }));
      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'push');
    });

    it('sets null order', async () => {
      render(
        <DataHeader
          {...dataHeaderProps}
          sort={{
            test: 'desc',
          }}
        />
      );
      await user.click(await screen.findByRole('button', { name: 'Test' }));
      expect(onSort).toHaveBeenCalledWith('test', null, 'push');
    });
  });

  describe('calls the onSort method when default sort is specified', () => {
    it('sets asc order', () => {
      render(<DataHeader {...dataHeaderProps} defaultSort="asc" />);

      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace');
    });
    it('sets desc order', () => {
      render(<DataHeader {...dataHeaderProps} defaultSort="desc" />);
      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'replace');
    });
  });

  it.skip('calls the resizeColumn method when column resizer is dragged', async () => {
    // TODO: I think testing-library doesn't support dragging interaction at the moment
    //       the drag example code here only works with ar eal browser:
    //       https://testing-library.com/docs/example-drag/
  });
});
