import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import SearchButton from './searchButton.component';

jest.mock('loglevel');

describe('Search Button component tests', () => {
  const testInitiateSearch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = render(
      <SearchButton initiateSearch={testInitiateSearch} />
    );
    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('initiates search when user clicks button', async () => {
    const wrapper = render(
      <SearchButton initiateSearch={testInitiateSearch} />
    );
    const button = await wrapper.findByLabelText(
      'searchBox.search_button_arialabel'
    );
    fireEvent.click(button);
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
