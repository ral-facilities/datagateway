import { createMount } from '@material-ui/core/test-utils';
import React from 'react';
import { DownloadCartItem } from '../app.types';
import SelectionAlert from './selectionAlert.component';

describe('SelectionAlert', () => {
  let mount;
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
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const cart: DownloadCartItem[] = [cartItems[0]];
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cart}
        navigateToSelections={() => undefined}
      />
    );
    expect(wrapper.find('[aria-label="alert-text"]').text().trim()).toEqual(
      '1 selec_alert.item selec_alert.added'
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with more than one item selected', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelections={() => undefined}
      />
    );
    expect(wrapper.find('[aria-label="alert-text"]').text().trim()).toEqual(
      '3 selec_alert.items selec_alert.added'
    );
  });

  it('can modify the width and margin of the alert', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelections={() => undefined}
        width={'10px'}
        marginSide={'20px'}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
