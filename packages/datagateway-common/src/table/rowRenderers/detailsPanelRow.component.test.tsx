import { render } from '@testing-library/react';
import * as React from 'react';
import { DetailsPanelProps } from '../table.component';
import DetailsPanelRow from './detailsPanelRow.component';

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
    detailsPanelResize: vi.fn(),
  };

  it('renders correctly', () => {
    const { asFragment } = render(
      <DetailsPanelRow key="test" {...detailsPanelRowProps} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
