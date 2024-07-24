import { render } from '@testing-library/react';
import * as React from 'react';
import ActionCell from './actionCell.component';
import { TableActionProps } from '../table.component';

describe('Action cell component', () => {
  const actionCellProps = {
    columnIndex: 1,
    dataKey: 'action',
    isScrolling: false,
    rowIndex: 1,
    rowData: 'test',
    className: 'test-class',
  };

  it('renders no actions correctly', async () => {
    const { asFragment } = render(
      <ActionCell {...actionCellProps} actions={[]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders an action correctly', async () => {
    const { asFragment } = render(
      <ActionCell
        {...actionCellProps}
        actions={[
          function testAction({ rowData }: TableActionProps) {
            return <p>Rendered an action using {rowData}!</p>;
          },
        ]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
