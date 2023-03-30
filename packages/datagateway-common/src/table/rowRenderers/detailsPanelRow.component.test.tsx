import * as React from 'react';
import DetailsPanelRow from './detailsPanelRow.component';
import { DetailsPanelProps } from '../table.component';
import { render } from '@testing-library/react';

describe('Details panel row component', () => {
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

  it('renders correctly', () => {
    const { asFragment } = render(
      <DetailsPanelRow {...detailsPanelRowProps} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
