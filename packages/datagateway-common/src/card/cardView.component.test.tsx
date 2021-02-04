import {
  Button,
  Chip,
  ExpansionPanel,
  ListItemText,
  SvgIcon,
} from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import axios from 'axios';
import { default as CardView, CardViewProps } from './cardView.component';
import { dGCommonInitialState } from '..';
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

  const pushQuery = jest.fn();
  const onFilter = jest.fn();

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
          TYPE_ID: '2',
          FACILITY_ID: '2',
        },
      ],
      totalDataCount: 1,
      query: dGCommonInitialState.query,
      customFilters: [],
      resultsOptions: [],
      paginationPosition: 'both',
      loadedCount: true,
      loadedData: true,
      title: { dataKey: 'TITLE' },
      loadData: jest.fn(),
      loadCount: jest.fn(),
      onPageChange: jest.fn(),
      onFilter: onFilter,
      pushQuery: pushQuery,
    };
  });

  afterEach(() => {
    mount.cleanUp();
    onFilter.mockClear();
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
    expect(wrapper.find('#card').find(Chip).text()).toEqual('2');

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
});
