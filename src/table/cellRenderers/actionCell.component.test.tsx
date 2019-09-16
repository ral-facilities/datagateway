import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import ActionCell from './actionCell.component';
import { TableActionProps } from '../table.component';

describe('Action cell component', () => {
  let shallow;
  const actionCellProps = {
    columnIndex: 1,
    dataKey: 'action',
    isScrolling: false,
    rowIndex: 1,
    rowData: 'test',
    className: 'test-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  it('renders no actions correctly', () => {
    const wrapper = shallow(<ActionCell {...actionCellProps} actions={[]} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders an action correctly', () => {
    const wrapper = shallow(
      <ActionCell
        {...actionCellProps}
        actions={[
          function testAction({ rowData }: TableActionProps) {
            return <p>Rendered an action using {rowData}!</p>;
          },
        ]}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
