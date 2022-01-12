import { createMount } from '@material-ui/core/test-utils';
import React from 'react';
import { DownloadCartItem } from '../app.types';
import { NotificationType } from '../state/actions/actions.types';
import SelectionAlert from './selectionAlert.component';

describe('SelectionAlert', () => {
  let mount;
  let events: CustomEvent<AnyAction>[] = [];
  const cartItems: DownloadCartItem[] = [
    {
      entityId: 1,
      entityType: 'investigation',
      id: 1,
      name: 'Test',
      parentEntities: [],
    },
    {
      entityId: 2,
      entityType: 'dataset',
      id: 1,
      name: 'Test 2',
      parentEntities: [],
    },
    {
      entityId: 3,
      entityType: 'datafile',
      id: 2,
      name: 'Test 3',
      parentEntities: [],
    },
  ];

  beforeEach(() => {
    mount = createMount();
    events = [];
    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const cart: DownloadCartItem[] = [cartItems[0]];
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cart}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
        loggedInAnonymously={false}
      />
    );
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.added');
    expect(wrapper).toMatchSnapshot();
  });

  it('sends a notification to SciGateway if user is not logged in', () => {
    const cart: DownloadCartItem[] = [cartItems[0]];
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cart}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
        loggedInAnonymously={true}
      />
    );

    wrapper.update();

    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'warning',
        message: 'selec_alert.warning_message_session_token',
      },
    });
  });

  it('renders correctly with more than one item selected', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.added');
  });

  it('renders correctly with one item removed', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    wrapper.setProps({ selectedItems: [cartItems[0], cartItems[1]] });
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.removed');
  });

  it('renders correctly with all items removed', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    wrapper.setProps({ selectedItems: [] });
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.removed');
  });

  it('does not render when nothing has changed', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={[]}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    expect(wrapper.find('[aria-label="selection-alert"]').exists()).toBeFalsy();
  });

  it('does not render when closed', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    wrapper
      .find('[aria-label="selection-alert-close"]')
      .first()
      .simulate('click');
    wrapper.update();
    expect(wrapper.find('[aria-label="selection-alert"]').exists()).toBeFalsy();
  });

  it('renders correctly after animation finished', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={() => undefined}
        loggedInAnonymously={false}
      />
    );
    wrapper
      .find('[aria-label="selection-alert"]')
      .first()
      .simulate('animationEnd');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('clicking link calls navigateToSelection', () => {
    let navigated = false;
    const navigate = (): void => {
      navigated = true;
    };
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={navigate}
        loggedInAnonymously={false}
      />
    );
    wrapper
      .find('[aria-label="selection-alert-link"]')
      .first()
      .simulate('click');
    //wrapper.update();
    expect(navigated).toBeTruthy();
  });
});
