import React from 'react';
import { shallow } from 'enzyme';
import DataCell from './dataCell.component';

describe('Data cell component', () => {
  const dataCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 1,
    rowData: {
      test: 'non nested property',
      nested: { test: 'nested property' },
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<DataCell {...dataCellProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders provided cell data correctly', () => {
    const wrapper = shallow(
      <DataCell
        {...dataCellProps}
        cellContentRenderer={() => <b>{'provided test'}</b>}
      />
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
    shallow(<DataCell {...dataCellProps} dataKey="invalid.test" />);

    shallow(<DataCell {...dataCellProps} dataKey="invalid" />);

    shallow(<DataCell {...dataCellProps} dataKey="nested.invalid" />);
  });
});
