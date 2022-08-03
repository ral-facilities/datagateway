import {
  Chip,
  Accordion,
  ListItemText,
  Select,
  Typography,
} from '@mui/material';
import { Pagination } from '@mui/material';
import { mount, shallow, ReactWrapper } from 'enzyme';
import React from 'react';
import axios from 'axios';
import { default as CardView, CardViewProps } from './cardView.component';
import { AdvancedFilter, TextColumnFilter } from '..';
import { Entity, Investigation } from '../app.types';

describe('Card View', () => {
  let props: CardViewProps;

  const createWrapper = (props: CardViewProps): ReactWrapper => {
    return mount(<CardView {...props} />);
  };

  const onFilter = jest.fn();
  const onPageChange = jest.fn();
  const onSort = jest.fn();
  const onResultsChange = jest.fn();

  beforeEach(() => {
    const data: Investigation[] = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 2,
        title: 'Test 2',
        name: 'Test 2',
        visitId: '2',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
      {
        id: 3,
        title: 'Test 3',
        name: 'Test 3',
        visitId: '3',
        type: { id: 1, name: '1' },
        facility: { id: 1, name: '1' },
      },
    ];
    props = {
      data,
      totalDataCount: 3,
      sort: {},
      filters: {},
      page: null,
      results: null,
      paginationPosition: 'both',
      loadedCount: true,
      loadedData: true,
      title: { dataKey: 'title' },
      onPageChange: onPageChange,
      onFilter: onFilter,
      onSort: onSort,
      onResultsChange: onResultsChange,
    };

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<CardView {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('applying custom filter on panel and on card', () => {
    let updatedProps = {
      ...props,
      customFilters: [
        {
          label: 'Type ID',
          dataKey: 'type.id',
          filterItems: [
            {
              name: '1',
              count: '1',
            },
            {
              name: '2',
              count: '1',
            },
          ],
        },
      ],
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[data-testid="card"]').at(0).find(Chip).text()
    ).toEqual('1');

    // Open custom filters
    const typePanel = wrapper.find(Accordion).first();
    typePanel.find('div').at(1).simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');

    // Apply custom filters
    typePanel.find(Chip).first().find('div').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onFilter).toHaveBeenNthCalledWith(1, 'type.id', ['1']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      page: 1,
      filters: { 'type.id': ['1'] },
    };

    // Mock console.error() when updating the filter panels. We use Accordions
    // with dynamic default values, which works, but would log an error.
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
    wrapper.setProps(updatedProps);

    // Apply second filter
    typePanel.find(Chip).last().find('div').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);

    expect(onFilter).toHaveBeenNthCalledWith(2, 'type.id', ['1', '2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      filters: { 'type.id': ['1', '2'] },
    };
    wrapper.setProps(updatedProps);

    // Remove filter
    expect(wrapper.find(Chip).at(2).text()).toEqual('Type ID - 1');
    wrapper.find(Chip).at(2).find('svg').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(3, 1);
    expect(onFilter).toHaveBeenNthCalledWith(3, 'type.id', ['2']);

    // Mock result of actions
    updatedProps = {
      ...updatedProps,
      filters: { 'type.id': ['2'] },
    };
    wrapper.setProps(updatedProps);

    // Remove second filter
    expect(wrapper.find(Chip).at(2).text()).toEqual('Type ID - 2');
    wrapper.find(Chip).at(2).find('svg').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(4, 1);
    expect(onFilter).toHaveBeenNthCalledWith(4, 'type.id', null);
  });

  it('custom filter applied when non-custom filter already in state', () => {
    const updatedProps = {
      ...props,
      customFilters: [
        {
          label: 'Type ID',
          dataKey: 'type.id',
          filterItems: [
            {
              name: '1',
              count: '1',
            },
            {
              name: '2',
              count: '1',
            },
          ],
        },
      ],
      filters: { 'type.id': { value: 'abc', type: 'include' } },
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[data-testid="card"]').at(0).find(Chip).text()
    ).toEqual('1');

    // Open custom filters
    const typePanel = wrapper.find(Accordion).first();
    typePanel.find('div').at(1).simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');

    // Apply custom filters
    typePanel.find(Chip).first().find('div').simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onFilter).toHaveBeenNthCalledWith(1, 'type.id', ['1']);
  });

  it('advancedFilter displayed when filter component given', () => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={{ value: '', type: 'include' }}
        onChange={jest.fn()}
      />
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
      buttons: [(entity: Entity) => <button id="test-button">TEST</button>],
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
    expect(wrapper.find('#test-title-content').at(0).text()).toEqual('TEST');
  });

  it('sort applied correctly', () => {
    let updatedProps = { ...props, page: 1 };
    const wrapper = createWrapper(props);
    const button = wrapper.find(ListItemText).first();
    const clickableButton = button.find('div');
    expect(button.text()).toEqual('title');

    // Click to sort ascending
    clickableButton.simulate('click');
    expect(onSort).toHaveBeenNthCalledWith(1, 'title', 'asc', 'push');
    updatedProps = {
      ...updatedProps,
      sort: { title: 'asc' },
    };
    wrapper.setProps(updatedProps);

    // Click to sort descending
    clickableButton.simulate('click');
    expect(onSort).toHaveBeenNthCalledWith(2, 'title', 'desc', 'push');
    updatedProps = {
      ...updatedProps,
      sort: { title: 'desc' },
    };
    wrapper.setProps(updatedProps);

    // Click to clear sorting
    clickableButton.simulate('click');
    expect(onSort).toHaveBeenNthCalledWith(3, 'title', null, 'push');
  });

  it('default sort applied correctly', () => {
    const updatedProps: CardViewProps = {
      ...props,
      title: { ...props.title, defaultSort: 'asc' },
      description: { dataKey: 'name', label: 'Name', defaultSort: 'desc' },
      information: [
        { dataKey: 'visitId' },
        {
          dataKey: 'test',
          label: 'Name',
          defaultSort: 'asc',
        },
      ],
    };
    const wrapper = createWrapper(updatedProps);
    wrapper.update();

    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'replace');
    expect(onSort).toHaveBeenCalledWith('name', 'desc', 'replace');
    expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace');
  });

  it('can sort by description with label', () => {
    const updatedProps = {
      ...props,
      page: 1,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', label: 'Name' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('Name');

    // Click to sort ascending
    button.find('div').simulate('click');
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push');
  });

  it('can sort by description without label', () => {
    const updatedProps = {
      ...props,
      page: 1,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name' },
    };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('name');

    // Click to sort ascending
    button.find('div').simulate('click');
    expect(onSort).toHaveBeenCalledWith('name', 'asc', 'push');
  });

  it('page changed when sort applied', () => {
    const updatedProps = { ...props, page: 2 };
    const wrapper = createWrapper(updatedProps);
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('title');

    // Click to sort ascending
    button.find('div').simulate('click');
    expect(onSort).toHaveBeenCalledWith('title', 'asc', 'push');
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('information displays and sorts correctly', () => {
    const updatedProps = {
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
      page: 1,
    };
    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[data-testid="card-info-visitId"]').first().text()
    ).toEqual('visitId:');
    expect(
      wrapper.find('[data-testid="card-info-data-visitId"]').first().text()
    ).toEqual('1');
    expect(
      wrapper.find('[data-testid="card-info-Name"]').first().text()
    ).toEqual('Name:');
    expect(
      wrapper.find('[data-testid="card-info-data-Name"]').first().text()
    ).toEqual('Content');

    // Click to sort ascending
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('visitId');
    button.find('div').simulate('click');
    expect(onSort).toHaveBeenCalledWith('visitId', 'asc', 'push');
  });

  it('information displays with content that has no tooltip', () => {
    const updatedProps = {
      ...props,
      title: { dataKey: 'title', disableSort: true },
      description: { dataKey: 'name', disableSort: true },
      information: [
        {
          dataKey: 'name',
          label: 'Name',
          content: (entity: Entity) => 'Content',
          noTooltip: true,
        },
      ],
    };

    const wrapper = createWrapper(updatedProps);
    expect(
      wrapper.find('[data-testid="card-info-Name"]').first().text()
    ).toEqual('Name:');
    expect(
      wrapper.find('[data-testid="card-info-data-Name"]').first().text()
    ).toEqual('Content');
  });

  it('cannot sort when fields are disabled', () => {
    const updatedProps = {
      ...props,
      page: 1,
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
      resultsOptions: [1],
      results: 1,
    };
    const wrapper = createWrapper(updatedProps);
    const pagination = wrapper.find(Pagination).first();
    pagination.find('button').at(1).simulate('click');
    expect(onPageChange).toHaveBeenCalledTimes(0);
    pagination.find('button').at(2).simulate('click');
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
  });

  it('page changed when max page exceeded', () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1],
      results: 1,
      page: 4,
    };
    createWrapper(updatedProps);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
  });

  it('results changed when max results exceeded', () => {
    const updatedProps = {
      ...props,
      totalDataCount: 100,
      resultsOptions: [10, 20, 30],
      results: 40,
      page: 1,
    };
    createWrapper(updatedProps);
    expect(onResultsChange).toHaveBeenNthCalledWith(1, 10);
  });

  it('results changed when max results exceeded when total data count is between 10 and 20)', () => {
    const updatedProps = {
      ...props,
      totalDataCount: 14,
      resultsOptions: [10, 20, 30],
      results: 30,
      page: 1,
    };
    createWrapper(updatedProps);
    expect(onResultsChange).toHaveBeenNthCalledWith(1, 10);
  });

  it('selector sends pushQuery with results', () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1, 2, 3],
      results: 1,
      page: 2,
    };
    const wrapper = createWrapper(updatedProps);
    wrapper
      .find(Select)
      .props()
      .onChange?.({ target: { value: 2 } });
    expect(onResultsChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('selector sends pushQuery with results and page', () => {
    const updatedProps = {
      ...props,
      resultsOptions: [1, 2, 3],
      results: 1,
      page: 2,
    };
    const wrapper = createWrapper(updatedProps);
    wrapper
      .find(Select)
      .props()
      .onChange?.({ target: { value: 3 } });
    expect(onResultsChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
  });
});
