import { mount } from 'enzyme';
import React from 'react';
import { Investigation } from '../app.types';
import EntityCard from './entityCard.component';
import { render, screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('Card', () => {
  let user: UserEvent;

  const entity: Investigation = {
    id: 1,
    title: 'Title',
    name: 'Name',
    summary: 'Test Description',
    visitId: '2',
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders correctly', async () => {
    const { asFragment } = render(
      <EntityCard entity={entity} title={{ dataKey: 'title' }} />
    );
    expect(await screen.findByText('Title')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with an image', async () => {
    render(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        image={{ url: 'test-url', title: 'Card Image' }}
      />
    );

    const cardImage = await screen.findByRole('img', { name: 'card-image' });
    expect(cardImage).toHaveAttribute('src', 'test-url');
    expect(cardImage).toHaveAttribute('title', 'Card Image');
  });

  it('renders custom title content', async () => {
    render(
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
    expect(await screen.findByText('Test Title')).toBeInTheDocument();
  });

  it('renders with a description', async () => {
    render(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        description={{ dataKey: 'summary' }}
      />
    );
    expect(await screen.findByText('Test Description')).toBeInTheDocument();
  });

  it('shows a collapsed description if it is too long', async () => {
    // Mock the value of clientHeight to be greater than defaultCollapsedHeight
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 101,
    });

    const modifiedEntity = { ...entity };
    const descText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate semper commodo. Vivamus sed sapien a dolor aliquam commodo vulputate at est. Maecenas sed lobortis justo, congue lobortis urna. Quisque in pharetra justo. Maecenas nunc quam, rutrum non nisl sit amet, mattis condimentum massa. Donec ut commodo urna, vel rutrum sapien. Integer fermentum quam quis commodo lobortis. Duis cursus, turpis a feugiat malesuada, dui tellus condimentum lorem, sed sagittis magna quam in arcu. Integer ex velit, cursus ut sagittis sit amet, pulvinar nec dolor. Curabitur sagittis tincidunt arcu id vestibulum. Aliquam auctor, ante eget consectetur accumsan, massa odio ornare sapien, ut porttitor lorem nulla et urna. Nam sapien erat, rutrum pretium dolor vel, maximus mattis velit. In non ex lobortis, sollicitudin nulla eget, aliquam neque.';
    modifiedEntity.summary = descText;

    render(
      <EntityCard
        entity={modifiedEntity}
        title={{ dataKey: 'title' }}
        description={{ dataKey: 'summary' }}
      />
    );
    expect(await screen.findByText(descText)).toBeInTheDocument();
    expect(
      await screen.findByText('entity_card.show_more')
    ).toBeInTheDocument();

    await user.click(await screen.findByText('entity_card.show_more'));

    expect(
      await screen.findByText('entity_card.show_less')
    ).toBeInTheDocument();
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

  it('render with information', async () => {
    render(
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
    expect(await screen.findByText('ICON -')).toBeInTheDocument();
    expect(await screen.findByText('visitId:')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('renders with buttons', async () => {
    render(
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
    expect(
      await screen.findByRole('button', { name: 'Test Button One' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Test Button Two' })
    ).toBeInTheDocument();
  });

  it('renders with more information', async () => {
    render(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title' }}
        moreInformation={() => <div>Test Information</div>}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Test Information')).toBeNull();
    });

    await user.click(await screen.findByLabelText('card-more-info-expand'));

    expect(await screen.findByText('Test Information')).toBeInTheDocument();
  });

  it('renders with tags', async () => {
    render(
      <EntityCard
        entity={entity}
        title={{ dataKey: 'title', label: 'Title' }}
        customFilters={[
          { dataKey: 'name', label: 'Name', filterItems: [] },
          { dataKey: 'visitId', label: 'Visit ID', filterItems: [] },
        ]}
      />
    );

    expect(await screen.findByText('Name')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
