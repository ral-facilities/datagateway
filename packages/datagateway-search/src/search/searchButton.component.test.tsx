import { fireEvent, render } from '@testing-library/react';
import SearchButton from './searchButton.component';

vi.mock('loglevel');

describe('Search Button component tests', () => {
  const testInitiateSearch = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
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
