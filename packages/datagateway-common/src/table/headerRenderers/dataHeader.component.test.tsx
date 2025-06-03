import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Filter } from '../../app.types';
import TextColumnFilter from '../columnFilters/textColumnFilter.component';
import DataHeader from './dataHeader.component';

describe('Data column header component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const onSort = vi.fn();
  const resizeColumn = vi.fn();
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

  const filterComponent = vi.fn(
    (
      label: string,
      dataKey: string,
      defaultValue?: Filter
    ): React.ReactElement => (
      <TextColumnFilter label={label} onChange={vi.fn()} value={undefined} />
    )
  );

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    onSort.mockClear();
    resizeColumn.mockClear();
    filterComponent.mockClear();
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
      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'push', false);
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
      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'push', false);
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
      expect(onSort).toHaveBeenCalledWith('test', null, 'push', false);
    });
  });

  describe('calls the onSort method when default sort is specified', () => {
    it('sets asc order', () => {
      render(<DataHeader {...dataHeaderProps} defaultSort="asc" />);

      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace', false);
    });
    it('sets desc order', () => {
      render(<DataHeader {...dataHeaderProps} defaultSort="desc" />);
      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'replace', false);
    });
  });

  it('does not call the onSort method when default sort is specified but sort is not empty', () => {
    render(
      <DataHeader
        {...dataHeaderProps}
        defaultSort="asc"
        sort={{ test: 'desc' }}
      />
    );
    expect(onSort).not.toHaveBeenCalled();
  });

  it('calls the onDefaultFilter method and supplies default filter to filter component when default filter is specified', () => {
    const onDefaultFilter = vi.fn();
    render(
      <DataHeader
        {...dataHeaderProps}
        filterComponent={filterComponent}
        onDefaultFilter={onDefaultFilter}
        defaultFilter={{ type: 'include', value: 'x' }}
        filters={{}}
      />
    );
    expect(onDefaultFilter).toHaveBeenCalledWith('test', {
      type: 'include',
      value: 'x',
    });
    expect(filterComponent).toHaveBeenCalledWith('Test', 'test', {
      type: 'include',
      value: 'x',
    });
  });

  it('does not call the onDefaultFilter method and not supply default filter to filter component when default filter is specified but filters is not empty', () => {
    const onDefaultFilter = vi.fn();
    render(
      <DataHeader
        {...dataHeaderProps}
        filterComponent={filterComponent}
        onDefaultFilter={onDefaultFilter}
        defaultFilter={{ type: 'include', value: 'x' }}
        filters={{ test: { type: 'exclude', value: 'y' } }}
      />
    );
    expect(onDefaultFilter).not.toHaveBeenCalled();
    expect(filterComponent).toHaveBeenCalledWith('Test', 'test', undefined);
  });

  describe('changes icons in the label', () => {
    it('changes icon to Add when shift is pressed', async () => {
      render(<DataHeader {...dataHeaderProps} shiftDown={true} />);
      expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
    });

    it('changes icon to ArrowUpward when hovered', async () => {
      render(<DataHeader {...dataHeaderProps} />);
      expect(screen.getByTestId('SortIcon')).toBeInTheDocument();
      await user.hover(await screen.findByRole('button', { name: 'Test' }));
      expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();

      await user.unhover(await screen.findByRole('button', { name: 'Test' }));
      expect(screen.getByTestId('SortIcon')).toBeInTheDocument();
    });
  });

  it.skip('calls the resizeColumn method when column resizer is dragged', async () => {
    // TODO: I think testing-library doesn't support dragging interaction at the moment
    //       the drag example code here only works with ar eal browser:
    //       https://testing-library.com/docs/example-drag/
  });
});
