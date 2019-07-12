import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import ActionCell from './actionCell.component';

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
    const wrapper = shallow(<ActionCell {...actionCellProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders an action correctly', () => {
    const wrapper = shallow(
      <ActionCell
        {...actionCellProps}
        actions={[
          function testAction(props) {
            return <p key="test">Rendered an action!</p>;
          },
        ]}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
