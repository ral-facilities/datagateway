import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import DetailsPanelRow from './detailsPanelRow.component';
import { Entity } from '../../state/app.types';

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
    detailsPanel: function detailsPanel(rowData: Entity) {
      return <div>{`Details panel using ${rowData}`}</div>;
    },
    detailPanelRef: React.createRef(),
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DetailsPanelRow {...detailsPanelRowProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
