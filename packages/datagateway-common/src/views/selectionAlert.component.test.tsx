import * as React from 'react';
import { DownloadCartItem } from '../app.types';
import { NotificationType } from '../state/actions/actions.types';
import SelectionAlert from './selectionAlert.component';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { AnyAction } from 'redux';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('SelectionAlert', () => {
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
  let user: UserEvent;

  const renderComponent = (
    selectedItems: DownloadCartItem[],
    loggedInAnonymously: boolean
  ): RenderResult => {
    return render(
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
    user = userEvent.setup();
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
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = renderComponent([cartItems[0]], true);
    expect(asFragment()).toMatchSnapshot();
  });

  it('sends a notification to SciGateway if user is not logged in but only once', async () => {
    const { rerender } = renderComponent([cartItems[0]], true);

    await waitFor(() => {
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: NotificationType,
        payload: {
          severity: 'warning',
          message: 'selec_alert.warning_message_session_token',
        },
      });

      expect(storageSetItemMock).toHaveBeenCalledTimes(1);
      expect(storageSetItemMock).toHaveBeenCalledWith(
        'sentExpiredMessage',
        '1'
      );
    });

    storageGetItemMock.mockReturnValueOnce('1');

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[cartItems[0], cartItems[1]]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

    expect(events.length).toBe(1);

    storageGetItemMock.mockReturnValueOnce('1');

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

    //Removing all should reset the message
    expect(events.length).toBe(1);

    expect(storageRemoveItemMock).toHaveBeenCalledTimes(1);
    expect(storageRemoveItemMock).toHaveBeenCalledWith('sentExpiredMessage');

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[cartItems[0]]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

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

    const { rerender } = renderComponent([], true);

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[cartItems[0]]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

    expect(events.length).toBe(0);
  });

  it('renders correctly with more than one item selected', async () => {
    renderComponent(cartItems, false);
    expect(await screen.findByText('selec_alert.added')).toBeInTheDocument();
  });

  it('renders correctly with one item removed', async () => {
    const { rerender } = renderComponent(cartItems, false);

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[cartItems[0], cartItems[1]]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

    expect(await screen.findByText('selec_alert.removed')).toBeInTheDocument();
  });

  it('renders correctly with all items removed', async () => {
    const { rerender } = renderComponent(cartItems, false);

    rerender(
      <SelectionAlert
        loggedInAnonymously
        selectedItems={[]}
        navigateToSelection={() => undefined}
        width={'100px'}
        marginSide={'4px'}
      />
    );

    expect(await screen.findByText('selec_alert.removed')).toBeInTheDocument();
  });

  it('does not render when nothing has changed', async () => {
    renderComponent([], false);
    await waitFor(() => {
      expect(screen.queryByLabelText('selection-alert')).toBeNull();
    });
  });

  it('does not render when closed', async () => {
    renderComponent(cartItems, false);

    await user.click(await screen.findByLabelText('selection-alert-close'));

    await waitFor(() => {
      expect(screen.queryByLabelText('selection-alert')).toBeNull();
    });
  });

  it('clicking link calls navigateToSelection', async () => {
    let navigated = false;
    const navigate = (): void => {
      navigated = true;
    };

    render(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelection={navigate}
        loggedInAnonymously={false}
      />
    );

    await user.click(await screen.findByLabelText('selection-alert-link'));

    expect(navigated).toBeTruthy();
  });
});
