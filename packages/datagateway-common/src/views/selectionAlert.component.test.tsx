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
        width={'100px'}
        marginSide={'4px'}
      />
    );
    expect(
      wrapper.find('[aria-label="selection-alert-text"]').first().text().trim()
    ).toEqual('selec_alert.added');
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with more than one item selected', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelections={() => undefined}
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
        navigateToSelections={() => undefined}
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
        navigateToSelections={() => undefined}
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
        navigateToSelections={() => undefined}
      />
    );
    expect(wrapper.find('[aria-label="selection-alert"]').exists()).toBeFalsy();
  });

  it('does not render when closed', () => {
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelections={() => undefined}
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
        navigateToSelections={() => undefined}
      />
    );
    wrapper
      .find('[aria-label="selection-alert"]')
      .first()
      .simulate('animationEnd');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('clicking link calls navigateToSelections', () => {
    let navigated = false;
    const navigate = (): void => {
      navigated = true;
    };
    const wrapper = mount(
      <SelectionAlert
        selectedItems={cartItems}
        navigateToSelections={navigate}
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
