import { Link } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import React from 'react';
import { Investigation } from '../app.types';
import EntityCard from './entityCard.component';

describe('Card', () => {
  let shallow;
  let mount;
  const entity: Investigation = {
    id: 1,
    title: 'Title',
    name: 'Name',
    summary: 'Test Description',
    visitId: '2',
  };

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <EntityCard entity={entity} title={{ dataKey: 'title' }} />
    );
    expect(wrapper.find('[aria-label="card-title"]').text()).toEqual('Title');
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with an image', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        image={{ url: 'test-url', title: 'Card Image' }}
      />
    );
    const cardImage = wrapper.find('[aria-label="card-image"]');
    expect(cardImage.prop('image')).toEqual('test-url');
    expect(cardImage.prop('title')).toEqual('Card Image');
  });

  it('renders custom title content', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{
          dataKey: 'title',
          label: 'Title',
          content: function Content() {
            return <div>Test Title</div>;
          },
        }}
      />
    );
    expect(wrapper.find('[aria-label="card-title"]').text()).toEqual(
      'Test Title'
    );
    expect(wrapper.find('ArrowTooltip').prop('title')).toEqual('Test Title');
  });

  it('renders with a description', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        description={{ dataKey: 'summary' }}
      />
    );
    expect(wrapper.find('[aria-label="card-description"]').text()).toEqual(
      'Test Description'
    );
  });

  it('shows a collapsed description if it is too long', () => {
    // Mock the value of clientHeight to be greater than defaultCollapsedHeight
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 101,
    });

    const modifiedEntity = { ...entity };
    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    modifiedEntity.summary = descText;

    const wrapper = mount(
      <EntityCard
        entity={modifiedEntity}
        title={{ dataKey: 'title' }}
        description={{ dataKey: 'summary' }}
      />
    );
    expect(
      wrapper.find('[aria-label="card-description"]').first().text()
    ).toEqual(descText);
    expect(wrapper.find('[aria-label="card-description-link"]').text()).toEqual(
      'entity_card.show_more'
    );

    wrapper.find(Link).simulate('click');
    expect(wrapper.find('[aria-label="card-description-link"]').text()).toEqual(
      'entity_card.show_less'
    );
  });

  it('no card-description-link if clientHeight < defaultCollapsedHeight', () => {
    // Mock the value of clientHeight to be greater than defaultCollapsedHeight
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 0,
    });

    const modifiedEntity = { ...entity };
    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    modifiedEntity.summary = descText;

    const wrapper = mount(
      <EntityCard
        entity={modifiedEntity}
        title={{ dataKey: 'title' }}
        description={{ dataKey: 'summary' }}
      />
    );
    expect(
      wrapper.find('[aria-label="card-description"]').first().text()
    ).toEqual(descText);
    expect(
      wrapper.find('[aria-label="card-description-link"]').exists()
    ).toBeFalsy();
  });

  it('render with information', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        information={[
          {
            dataKey: 'visitId',
            content: function Test() {
              return <b>{'1'}</b>;
            },
            icon: function Icon() {
              return <strong>ICON - </strong>;
            },
          },
        ]}
      />
    );
    expect(wrapper.exists("[aria-label='card-info-visitId']")).toBe(true);
    expect(wrapper.find("[aria-label='card-info-visitId']").text()).toEqual(
      '<Icon />visitId:'
    );
    expect(wrapper.exists("[aria-label='card-info-data-visitId']")).toBe(true);
    expect(
      wrapper.find("[aria-label='card-info-data-visitId']").find('b').text()
    ).toEqual('1');
    expect(
      wrapper
        .find("[aria-label='card-info-data-visitId']")
        .find('ArrowTooltip')
        .prop('title')
    ).toEqual('1');
  });

  it('renders with buttons', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title', label: 'Title' }}
        buttons={[
          function Button1() {
            return <button>Test Button One</button>;
          },
          function Button2() {
            return <button>Test Button Two</button>;
          },
        ]}
      />
    );
    expect(wrapper.exists('[aria-label="card-buttons"]')).toBe(true);
    expect(wrapper.find('[aria-label="card-button-1"]').text()).toEqual(
      'Test Button One'
    );
    expect(wrapper.find('[aria-label="card-button-2"]').text()).toEqual(
      'Test Button Two'
    );
  });

  it('renders with more information', () => {
    const wrapper = mount(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        moreInformation={() => <div>Test Information</div>}
      />
    );

    expect(wrapper.exists('[aria-label="card-more-information"]')).toBe(true);
    expect(wrapper.exists('[aria-label="card-more-info-expand"]')).toBe(true);

    // Click on the expansion panel to view more information area.
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(
      wrapper.find('[aria-label="card-more-info-details"]').first().text()
    ).toEqual('Test Information');
  });

  it('renders with tags', () => {
    const wrapper = shallow(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title', label: 'Title' }}
        customFilters={[
          { dataKey: 'name', label: 'Name', filterItems: [] },
          { dataKey: 'visitId', label: 'Visit ID', filterItems: [] },
        ]}
      />
    );

    expect(wrapper.exists('[aria-label="card-tags"]')).toBe(true);
    expect(wrapper.find('[aria-label="card-tag-Name"]').prop('label')).toEqual(
      'Name'
    );
    expect(wrapper.find('[aria-label="card-tag-2"]').prop('label')).toEqual(
      '2'
    );
  });
});
