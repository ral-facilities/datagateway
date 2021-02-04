import {
  Button,
  Chip,
  ExpansionPanel,
  ListItemText,
  SvgIcon,
} from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { Pagination } from '@material-ui/lab';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import axios from 'axios';
import { default as CardView, CardViewProps } from './cardView.component';
import { AdvancedFilter, dGCommonInitialState, TextColumnFilter } from '..';
import { Entity } from '../app.types';

describe('Card View', () => {
  let mount;
  let shallow;
  let props: CardViewProps;

  const createWrapper = (props: CardViewProps): ReactWrapper => {
    return mount(<CardView {...props} />);
  };

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);
  // Prevent error logging
  window.scrollTo = jest.fn();

  const loadData = jest.fn();
  const onFilter = jest.fn();
  const onPageChange = jest.fn();
  const pushQuery = jest.fn();

  beforeEach(() => {
    mount = createMount();
    shallow = createShallow();
    props = {
      data: [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
      ],
      totalDataCount: 1,
      query: dGCommonInitialState.query,
      resultsOptions: [],
      paginationPosition: 'both',
      loadedCount: true,
      loadedData: true,
      title: { dataKey: 'TITLE' },
      loadData: loadData,
      loadCount: jest.fn(),
      onPageChange: onPageChange,
      onFilter: onFilter,
      pushQuery: pushQuery,
    };
  });

  afterEach(() => {
    mount.cleanUp();
    loadData.mockClear();
    onFilter.mockClear();
    onPageChange.mockClear();
    pushQuery.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<CardView {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('applying custom filter on panel and on card', () => {
    let updatedProps = {
      ...props,
      customFilters: [
        { label: 'Type ID', dataKey: 'TYPE_ID', filterItems: ['1', '2'] },
      ],
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find('#card').find(Chip).text()).toEqual('1');

    // Open custom filters
    const typePanel = wrapper.find(ExpansionPanel).first();
    typePanel.simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');

    // Apply custom filters
    typePanel.find(Chip).first().simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      page: 1,
    });
    expect(onFilter).toHaveBeenNthCalledWith(1, 'TYPE_ID', ['1']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, page: 1, filters: { TYPE_ID: ['1'] } },
    };
    wrapper.setProps(updatedProps);

    // Apply second filter
    typePanel.find(Chip).last().simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      page: 1,
    });
    expect(onFilter).toHaveBeenNthCalledWith(2, 'TYPE_ID', ['1', '2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, filters: { TYPE_ID: ['1', '2'] } },
    };
    wrapper.setProps(updatedProps);

    // Remove filter
    expect(wrapper.find(Chip).at(2).text()).toEqual('Type ID - 1');
    wrapper.find(Chip).at(2).find(SvgIcon).simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(3, {
      ...updatedProps.query,
      page: 1,
    });
    expect(onFilter).toHaveBeenNthCalledWith(3, 'TYPE_ID', ['2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, filters: { TYPE_ID: ['2'] } },
    };
    wrapper.setProps(updatedProps);

    // Remove second filter
    expect(wrapper.find(Chip).at(2).text()).toEqual('Type ID - 2');
    wrapper.find(Chip).at(2).find(SvgIcon).simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(4, {
      ...updatedProps.query,
      page: 1,
    });
    expect(onFilter).toHaveBeenNthCalledWith(4, 'TYPE_ID', null);
  });

  it('custom filter applied when non-custom filter already in state', () => {
    const updatedProps = {
      ...props,
      customFilters: [
        { label: 'Type ID', dataKey: 'TYPE_ID', filterItems: ['1', '2'] },
      ],
      query: { ...props.query, filters: { TYPE_ID: 'abc' } },
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find('#card').find(Chip).text()).toEqual('1');

    // Open custom filters
    const typePanel = wrapper.find(ExpansionPanel).first();
    typePanel.simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');

    // Apply custom filters
    typePanel.find(Chip).first().simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      page: 1,
    });
    expect(onFilter).toHaveBeenNthCalledWith(1, 'TYPE_ID', ['1']);
  });

  it('advancedFilter displayed when filter component given', () => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter label={label} value="" onChange={jest.fn()} />
    );
    const updatedProps = {
      ...props,
      title: {
        dataKey: 'TITLE',
        label: 'Title',
        filterComponent: textFilter,
      },
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.exists(AdvancedFilter)).toBeTruthy();
  });

  it('buttons display correctly', () => {
    const updatedProps = {
      ...props,
      buttons: [(entity: Entity) => <Button id="test-button">TEST</Button>],
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find('#test-button').first().text()).toEqual('TEST');
  });

  it('information displays correctly', () => {
    const updatedProps = {
      ...props,
      information: [
        { dataKey: 'VISIT_ID' },
        {
          dataKey: 'NAME',
          label: 'Name',
          content: (entity: Entity) => 'Content',
        },
      ],
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[aria-label="card-info-VISIT_ID"]').first().text()
    ).toEqual('VISIT_ID:');
    expect(
      wrapper.find('[aria-label="card-info-data-VISIT_ID"]').first().text()
    ).toEqual('1');
    expect(
      wrapper.find('[aria-label="card-info-Name"]').first().text()
    ).toEqual('Name:');
    expect(
      wrapper.find('[aria-label="card-info-data-Name"]').first().text()
    ).toEqual('Content');
  });

  it('sort applied correctly', () => {
    let updatedProps = { ...props, query: { ...props.query, page: 1 } };
    const wrapper = createWrapper(props);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('TITLE');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { TITLE: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { TITLE: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { TITLE: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { TITLE: 'desc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to clear sorting
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(3, {
      ...updatedProps.query,
      sort: {},
    });
  });

  it('can sort by description with label', () => {
    let updatedProps = {
      ...props,
      query: { ...props.query, page: 1 },
      title: { dataKey: 'TITLE', disableSort: true },
      description: { dataKey: 'NAME', label: 'Name' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('Name');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { NAME: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { NAME: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { NAME: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { NAME: 'desc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to clear sorting
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(3, {
      ...updatedProps.query,
      sort: {},
    });
  });

  it('can sort by description without label', () => {
    let updatedProps = {
      ...props,
      query: { ...props.query, page: 1 },
      title: { dataKey: 'TITLE', disableSort: true },
      description: { dataKey: 'NAME' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('NAME');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { NAME: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { NAME: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { NAME: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { NAME: 'desc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to clear sorting
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(3, {
      ...updatedProps.query,
      sort: {},
    });
  });

  it('cannot sort when fields are disabled', () => {
    const updatedProps = {
      ...props,
      query: { ...props.query, page: 1 },
      title: { dataKey: 'TITLE', disableSort: true },
      description: { dataKey: 'NAME', disableSort: true },
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.exists(ListItemText)).toBeFalsy();
  });

  it('pagination dispatches onPageChange', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          NAME: 'Test 2',
          VISIT_ID: '2',
          TYPE_ID: '2',
          FACILITY_ID: '2',
        },
      ],
      totalDataCount: 2,
      resultsOptions: [1],
      query: { ...props.query, results: 1 },
    };
    const wrapper = createWrapper(updatedProps);
    const pagination = wrapper.find(Pagination).first();
    pagination.find('button').at(1).simulate('click');
    expect(onPageChange).toHaveBeenCalledTimes(0);
    pagination.find('button').at(2).simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
  });

  it('page changed and correct data loaded when max page exceeded', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          NAME: 'Test 2',
          VISIT_ID: '2',
          TYPE_ID: '2',
          FACILITY_ID: '2',
        },
      ],
      totalDataCount: 2,
      resultsOptions: [1],
      query: { ...props.query, results: 1, page: 3 },
    };
    const wrapper = createWrapper(updatedProps);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    wrapper.setProps({
      ...updatedProps,
      query: { ...updatedProps.query, page: 1 },
    });
    expect(loadData).toHaveBeenNthCalledWith(1, {
      startIndex: 0,
      stopIndex: 0,
    });
  });
});
