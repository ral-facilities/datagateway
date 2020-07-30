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

  it.todo('renders custom title content');

  it.todo('renders with a description');

  it.todo('shows a collapsed description if it is too long');

  it.todo('render with information');

  // TODO: Needs icons to be supported.
  it.todo('renders information with icons');

  it.todo('renders with custom buttons');

  it.todo('renders with more information');

  it.todo('renders with tags');
});
