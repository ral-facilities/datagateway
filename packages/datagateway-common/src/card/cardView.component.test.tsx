import {
  Button,
  Chip,
  Accordion,
  ListItemText,
  Select,
  SvgIcon,
  Typography,
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
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
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
      title: { dataKey: 'title' },
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
    const typePanel = wrapper.find(Accordion).first();
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
    const typePanel = wrapper.find(Accordion).first();
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
        dataKey: 'title',
        label: 'Title',
        filterComponent: textFilter,
      },
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.exists(AdvancedFilter)).toBeTruthy();
  });

  it('filter message displayed when loadedData and totalDataCount is 0', () => {
    const updatedProps = {
      ...props,
      loadedData: true,
      totalDataCount: 0,
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find(Typography).last().text()).toEqual(
      'loading.filter_message'
    );
  });

  it('buttons display correctly', () => {
    const updatedProps = {
      ...props,
      buttons: [(entity: Entity) => <Button id="test-button">TEST</Button>],
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find('#test-button').first().text()).toEqual('TEST');
  });

  it('moreInformation displays correctly', () => {
    const moreInformation = (entity: Entity): React.ReactElement => <p>TEST</p>;
    const updatedProps = {
      ...props,
      moreInformation: moreInformation,
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.exists('[aria-label="card-more-information"]')).toBeTruthy();
  });

  it('title.content displays correctly', () => {
    const content = (entity: Entity): React.ReactElement => (
      <p id="test-title-content">TEST</p>
    );
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', content: content },
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.find('#test-title-content').text()).toEqual('TEST');
  });

  it('sort applied correctly', () => {
    let updatedProps = { ...props, query: { ...props.query, page: 1 } };
    const wrapper = createWrapper(props);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('title');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { title: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { title: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { title: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { title: 'desc' } },
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
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', label: 'Name' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('Name');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { name: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { name: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { name: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { name: 'desc' } },
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
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('name');

    // Click to sort ascending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { name: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { name: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { name: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { name: 'desc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to clear sorting
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(3, {
      ...updatedProps.query,
      sort: {},
    });
  });

  it('information displays and sorts correctly', () => {
    let updatedProps = {
      ...props,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [
        { dataKey: 'visitId' },
        {
          dataKey: 'name',
          label: 'Name',
          content: (entity: Entity) => 'Content',
        },
      ],
      query: { ...props.query, page: 1 },
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[aria-label="card-info-visitId"]').first().text()
    ).toEqual('visitId:');
    expect(
      wrapper.find('[aria-label="card-info-data-visitId"]').first().text()
    ).toEqual('1');
    expect(
      wrapper.find('[aria-label="card-info-Name"]').first().text()
    ).toEqual('Name:');
    expect(
      wrapper.find('[aria-label="card-info-data-Name"]').first().text()
    ).toEqual('Content');

    // Click to sort ascending
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('visitId');
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      sort: { visitId: 'asc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { visitId: 'asc' } },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    button.simulate('click');
    expect(pushQuery).toHaveBeenNthCalledWith(2, {
      ...updatedProps.query,
      sort: { visitId: 'desc' },
    });
    updatedProps = {
      ...updatedProps,
      query: { ...updatedProps.query, sort: { visitId: 'desc' } },
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
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [{ dataKey: 'visitId', disableSort: true }],
    };
    const wrapper = createWrapper(updatedProps);
    expect(wrapper.exists(ListItemText)).toBeFalsy();
  });

  it('pagination dispatches onPageChange', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
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
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
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

  it('loadData not called when loadedCount false', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
      ],
      totalDataCount: 1,
      resultsOptions: [1],
      loadedCount: false,
      loadedData: false,
      query: { ...props.query, results: 1, page: 1 },
    };
    createWrapper(updatedProps);
    expect(loadData).toHaveBeenCalledTimes(0);
  });

  it('selector sends pushQuery with results', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
          TYPE_ID: '2',
          FACILITY_ID: '2',
        },
        {
          id: 3,
          title: 'Test 3',
          name: 'Test 3',
          visitId: '3',
          TYPE_ID: '3',
          FACILITY_ID: '3',
        },
      ],
      totalDataCount: 3,
      resultsOptions: [1, 2, 3],
      query: { ...props.query, results: 1, page: 2 },
    };
    const wrapper = createWrapper(updatedProps);
    wrapper
      .find(Select)
      .props()
      .onChange({ target: { value: 2 } });
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      results: 2,
    });
  });

  it('selector sends pushQuery with results and page', () => {
    const updatedProps = {
      ...props,
      data: [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          TYPE_ID: '1',
          FACILITY_ID: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
          TYPE_ID: '2',
          FACILITY_ID: '2',
        },
        {
          id: 3,
          title: 'Test 3',
          name: 'Test 3',
          visitId: '3',
          TYPE_ID: '3',
          FACILITY_ID: '3',
        },
      ],
      totalDataCount: 3,
      resultsOptions: [1, 2, 3],
      query: { ...props.query, results: 1, page: 2 },
    };
    const wrapper = createWrapper(updatedProps);
    wrapper
      .find(Select)
      .props()
      .onChange({ target: { value: 3 } });
    expect(pushQuery).toHaveBeenNthCalledWith(1, {
      ...updatedProps.query,
      results: 3,
      page: 1,
    });
  });
});
