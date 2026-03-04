import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SelectCell from './selectCell.component';

describe('Select cell component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const setLastChecked = vi.fn();
  const onCheck = vi.fn();
  const onUncheck = vi.fn();
  const data = [
    {
      id: 1,
      name: 'test 1',
    },
    {
      id: 2,
      name: 'test 2',
    },
    {
      id: 3,
      name: 'test 3',
    },
  ];
  const selectCellProps: React.ComponentProps<typeof SelectCell> = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 2,
    rowData: data[2],
    selectedRows: [],
    data,
    lastChecked: -1,
    loading: false,
    setLastChecked,
    onCheck,
    onUncheck,
    sx: {},
    parentSelected: false,
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    setLastChecked.mockClear();
    onCheck.mockClear();
    onUncheck.mockClear();
  });

  it('renders correctly when unchecked', async () => {
    const { asFragment } = render(<SelectCell {...selectCellProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', async () => {
    const { asFragment } = render(
      <SelectCell {...selectCellProps} selectedRows={[3]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows is undefined', async () => {
    const { asFragment } = render(
      <SelectCell {...selectCellProps} selectedRows={undefined} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows loading is true', async () => {
    const { asFragment } = render(
      <SelectCell
        {...selectCellProps}
        loading={true}
        selectedRows={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows parentSelected is true', () => {
    const { asFragment } = render(
      <SelectCell {...selectCellProps} parentSelected={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls setLastChecked when checkbox is clicked', async () => {
    render(<SelectCell {...selectCellProps} />);
    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 2' })
    );
    expect(setLastChecked).toHaveBeenCalledWith(2);
  });

  it('calls onCheck when the row is unselected and the checkbox is clicked', async () => {
    render(<SelectCell {...selectCellProps} />);
    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 2' })
    );
    expect(onCheck).toHaveBeenCalledWith([3]);
  });

  it('calls onUncheck when the row is selected and the checkbox is clicked', async () => {
    render(<SelectCell {...selectCellProps} selectedRows={[3]} />);
    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 2' })
    );
    expect(onUncheck).toHaveBeenCalledWith([3]);
  });
  it('calls onCheck when the row is selected via shift-click and the checkbox is clicked', async () => {
    render(<SelectCell {...selectCellProps} lastChecked={0} />);
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: 'select row 2',
      }),
      { shiftKey: true }
    );
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });
  it('calls onUncheck when the row is unselected via shift-click and the checkbox is clicked', async () => {
    render(
      <SelectCell
        {...selectCellProps}
        lastChecked={0}
        selectedRows={[1, 2, 3]}
      />
    );
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: 'select row 2',
      }),
      { shiftKey: true }
    );
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
