import { createMount } from '@mui/material/test-utils';
import { ReactWrapper } from 'enzyme';
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
  let storageGetItemMock: jest.Mock;
  let storageSetItemMock: jest.Mock;
  let storageRemoveItemMock: jest.Mock;

  const createWrapper = (
    selectedItems: DownloadCartItem[],
    loggedInAnonymously: boolean
  ): ReactWrapper => {
    return mount(
      <SelectionAlert
        selectedItems={selectedItems}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
        loggedInAnonymously={loggedInAnonymously}
      />
    );
  };

  beforeEach(() => {
    mount = createMount();
    events = [];
    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    storageGetItemMock = jest.fn();
    storageSetItemMock = jest.fn();
    storageRemoveItemMock = jest.fn();

    window.localStorage.__proto__.getItem = storageGetItemMock;
    window.localStorage.__proto__.setItem = storageSetItemMock;
    window.localStorage.__proto__.removeItem = storageRemoveItemMock;
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper([cartItems[0]], true);
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.added');
    expect(wrapper).toMatchSnapshot();
  });

  it('sends a notification to SciGateway if user is not logged in but only once', () => {
    const wrapper = createWrapper([cartItems[0]], true);

    wrapper.update();

    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'warning',
        message: 'selec_alert.warning_message_session_token',
      },
    });

    expect(storageSetItemMock).toHaveBeenCalledTimes(1);
    expect(storageSetItemMock).toHaveBeenCalledWith('sentExpiredMessage', '1');

    storageGetItemMock.mockReturnValueOnce('1');

    //Adding another element
    wrapper.setProps({ selectedItems: [cartItems[0], cartItems[1]] });
    expect(events.length).toBe(1);

    storageGetItemMock.mockReturnValueOnce('1');

    //Removing all should reset the message
    wrapper.setProps({ selectedItems: [] });
    expect(events.length).toBe(1);

    expect(storageRemoveItemMock).toHaveBeenCalledTimes(1);
    expect(storageRemoveItemMock).toHaveBeenCalledWith('sentExpiredMessage');

    wrapper.setProps({ selectedItems: [cartItems[0]] });
    expect(events.length).toBe(2);
    expect(events[1].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'warning',
        message: 'selec_alert.warning_message_session_token',
      },
    });
  });

  it('does not send a notification to SciGateway if user is not logged and it has been sent before', () => {
    storageGetItemMock.mockReturnValue('1');

    const wrapper = createWrapper([], true);

    wrapper.update();

    //Adding the first element should not broadcast a message
    wrapper.setProps({ selectedItems: [cartItems[0]] });
    expect(events.length).toBe(0);
  });

  it('renders correctly with more than one item selected', () => {
    const wrapper = createWrapper(cartItems, false);
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.added');
  });

  it('renders correctly with one item removed', () => {
    const wrapper = createWrapper(cartItems, false);
    wrapper.setProps({ selectedItems: [cartItems[0], cartItems[1]] });

    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.removed');
  });

  it('renders correctly with all items removed', () => {
    const wrapper = createWrapper(cartItems, false);
    wrapper.setProps({ selectedItems: [] });

    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.removed');
  });

  it('does not render when nothing has changed', () => {
    const wrapper = createWrapper([], false);
    expect(wrapper.find('[aria-label="selection-alert"]').exists()).toBeFalsy();
  });

  it('does not render when closed', () => {
    const wrapper = createWrapper(cartItems, false);
    wrapper
      .find('[aria-label="selection-alert-close"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[aria-label="selection-alert"]').exists()).toBeFalsy();
  });

  it('renders correctly after animation finished', () => {
    const wrapper = createWrapper(cartItems, false);
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

    expect(navigated).toBeTruthy();
  });
});
