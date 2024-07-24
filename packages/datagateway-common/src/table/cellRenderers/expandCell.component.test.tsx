import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import * as React from 'react';
import ExpandCell from './expandCell.component';

describe('Expand cell component', () => {
  let user: UserEvent;
  const setExpandedIndex = jest.fn();
  const expandCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 1,
    rowData: '',
    expandedIndex: 1,
    setExpandedIndex,
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    setExpandedIndex.mockClear();
  });

  it('renders correctly when expanded', async () => {
    const { asFragment } = render(<ExpandCell {...expandCellProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets the expanded index to -1 when ExpandLess button is pressed', async () => {
    render(<ExpandCell {...expandCellProps} />);
    await user.click(
      await screen.findByRole('button', { name: 'Hide details' })
    );
    expect(setExpandedIndex).toHaveBeenCalledWith(-1);
  });

  it('renders correctly when not expanded', async () => {
    const { asFragment } = render(
      <ExpandCell {...expandCellProps} expandedIndex={2} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets the expanded index to rowIndex when ExpandMore button is pressed', async () => {
    render(<ExpandCell {...expandCellProps} expandedIndex={2} />);
    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );
    expect(setExpandedIndex).toHaveBeenCalledWith(expandCellProps.rowIndex);
  });
});
