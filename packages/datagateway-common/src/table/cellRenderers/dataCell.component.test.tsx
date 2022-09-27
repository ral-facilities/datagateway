import { render } from '@testing-library/react';
import * as React from 'react';
import DataCell from './dataCell.component';

describe('Data cell component', () => {
  const dataCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 1,
    rowData: {
      test: 'non nested property',
      nested: {
        test: 'nested property',
      },
    },
  };

  it('renders correctly', async () => {
    const { asFragment } = render(<DataCell {...dataCellProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders provided cell data correctly', async () => {
    const { asFragment } = render(
      <DataCell
        {...dataCellProps}
        cellContentRenderer={() => <b>{'provided test'}</b>}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders nested cell data correctly', async () => {
    const { asFragment } = render(
      <DataCell {...dataCellProps} dataKey="nested.test" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('gracefully handles invalid dataKeys', async () => {
    render(<DataCell {...dataCellProps} dataKey="invalid.test" />);
    render(<DataCell {...dataCellProps} dataKey="invalid" />);
    render(<DataCell {...dataCellProps} dataKey="nested.invalid" />);
  });
});
