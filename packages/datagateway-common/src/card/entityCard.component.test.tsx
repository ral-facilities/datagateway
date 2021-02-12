import { Link } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import React from 'react';
import EntityCard from './entityCard.component';

describe('Card', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<EntityCard title={{ label: 'Title' }} />);
    expect(wrapper.find('[aria-label="card-title"]').text()).toEqual('Title');
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with an image', () => {
    const wrapper = shallow(
      <EntityCard
        title={{ label: 'Title' }}
        image={{ url: 'test-url', title: 'Card Image' }}
      />
    );
    const cardImage = wrapper.find('[aria-label="card-image"]');
    expect(cardImage.prop('image')).toEqual('test-url');
    expect(cardImage.prop('title')).toEqual('Card Image');
  });

  it('renders custom title content', () => {
    const wrapper = shallow(
      <EntityCard title={{ label: 'Title', content: <div>Test Title</div> }} />
    );
    expect(wrapper.find('[aria-label="card-title"]').text()).toEqual(
      'Test Title'
    );
  });

  it('renders with a description', () => {
    const wrapper = shallow(
      <EntityCard title={{ label: 'Title' }} description={'Test Description'} />
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

    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    const wrapper = mount(
      <EntityCard title={{ label: 'Title' }} description={descText} />
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

    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    const wrapper = mount(
      <EntityCard title={{ label: 'Title' }} description={descText} />
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
        title={{ label: 'Title' }}
        information={[
          {
            label: 'VISIT ID',
            content: '1',
            icon: <strong>ICON - </strong>,
          },
        ]}
      />
    );
    expect(wrapper.exists("[aria-label='card-info-VISIT ID']")).toBe(true);
    expect(wrapper.find("[aria-label='card-info-VISIT ID']").text()).toEqual(
      'ICON - VISIT ID:'
    );
    expect(wrapper.exists("[aria-label='card-info-data-VISIT ID']")).toBe(true);
    expect(
      wrapper.find("[aria-label='card-info-data-VISIT ID']").text()
    ).toEqual('1');
  });

  it('renders with buttons', () => {
    const wrapper = shallow(
      <EntityCard
        title={{ label: 'Title' }}
        buttons={[
          // eslint-disable-next-line react/jsx-key
          <button>Test Button One</button>,
          // eslint-disable-next-line react/jsx-key
          <button>Test Button Two</button>,
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
        title={{ label: 'Title' }}
        moreInformation={<div>Test Information</div>}
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
      <EntityCard title={{ label: 'Title' }} tags={['Tag One', 'Tag Two']} />
    );

    expect(wrapper.exists('[aria-label="card-tags"]')).toBe(true);
    expect(
      wrapper.find('[aria-label="card-tag-Tag One"]').prop('label')
    ).toEqual('Tag One');
    expect(
      wrapper.find('[aria-label="card-tag-Tag Two"]').prop('label')
    ).toEqual('Tag Two');
  });
});
