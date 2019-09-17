import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import DetailsPanelRow from './detailsPanelRow.component';
import { DetailsPanelProps } from '../table.component';

describe('Details panel row component', () => {
  let shallow;
  const detailsPanelRowProps = {
    index: 1,
    columns: [],
    isScrolling: false,
    style: {
      height: 30,
      width: 30,
      paddingRight: 15,
    },
    className: 'test-class',
    rowData: 'test',
    detailsPanel: function detailsPanel({ rowData }: DetailsPanelProps) {
      return <div>{`Details panel using ${rowData}`}</div>;
    },
    detailPanelRef: React.createRef<HTMLDivElement>(),
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DetailsPanelRow {...detailsPanelRowProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
