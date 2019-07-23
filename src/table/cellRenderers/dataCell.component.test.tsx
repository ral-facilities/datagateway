import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import DataCell from './dataCell.component';

describe('Data cell component', () => {
  let shallow;
  const dataCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 1,
    rowData: {
      test: 'non nested property',
      nested: { test: 'nested property' },
    },
    className: 'test-class',
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DataCell {...dataCellProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders provided cell data correctly', () => {
    const wrapper = shallow(
      <DataCell {...dataCellProps} cellData="provided test" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders nested cell data correctly', () => {
    const wrapper = shallow(
      <DataCell {...dataCellProps} dataKey="nested.test" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('gracefully handles invalid dataKeys', () => {
    const wrapper1 = shallow(
      <DataCell {...dataCellProps} dataKey="invalid.test" />
    );

    const wrapper2 = shallow(<DataCell {...dataCellProps} dataKey="invalid" />);

    const wrapper3 = shallow(
      <DataCell {...dataCellProps} dataKey="nested.invalid" />
    );
  });
});
