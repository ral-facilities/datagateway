import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import SelectHeader from './selectHeader.component';

describe('Select column header component', () => {
  let user: UserEvent;
  const setLastChecked = jest.fn();
  const onCheck = jest.fn();
  const onUncheck = jest.fn();
  const selectHeaderProps = {
    dataKey: 'test',
    selectedRows: [],
    totalRowCount: 3,
    onCheck,
    onUncheck,
    allIds: [1, 2, 3],
    loading: false,
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
    const { asFragment } = render(<SelectHeader {...selectHeaderProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when indeterminate', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={[1]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows is undefined', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={undefined} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when loading is true', async () => {
    const { asFragment } = render(
      <SelectHeader
        {...selectHeaderProps}
        loading={true}
        selectedRows={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onCheck when not all rows are selected and the checkbox is clicked', async () => {
    render(<SelectHeader {...selectHeaderProps} selectedRows={[1]} />);
    await user.click(await screen.findByRole('checkbox'));
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('calls onUncheck when all rows are selected and the checkbox is clicked', async () => {
    render(<SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />);
    await user.click(await screen.findByRole('checkbox'));
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
