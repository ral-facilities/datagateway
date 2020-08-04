import React from 'react';
import EntityCard from './entityCard.component';
import { createShallow } from '@material-ui/core/test-utils';

describe('Card', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
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
    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    const wrapper = shallow(
      <EntityCard title={{ label: 'Title' }} description={descText} />
    );
    expect(wrapper.find('[aria-label="card-description"]').text()).toEqual(
      descText
    );
    console.log(wrapper.debug());
  });

  it.todo('render with information');

  it.todo('renders information with icons');

  it.todo('renders with custom buttons');

  it.todo('renders with more information');

  it.todo('renders with tags');
});
