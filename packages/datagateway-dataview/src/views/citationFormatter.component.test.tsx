import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import CitationFormatter from './citationFormatter.component';
import axios from 'axios';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { ReactWrapper } from 'enzyme';

describe('Citation formatter component tests', () => {
  let shallow;
  let mount;

  const props = {
    doi: 'test',
    formattedUsers: [
      { role: 'principal_experimenter', fullName: 'John Smith' },
    ],
    title: 'title',
    pid: 'test',
    startDate: '2019-04-03',
  };

  const createWrapper = (): ReactWrapper => {
    return mount(<CitationFormatter {...props} />);
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
  });

  //Have to mock formats data in react-i18next.jsx
  it('renders correctly', () => {
    const wrapper = shallow(<CitationFormatter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('formats citation on load', async () => {
    const wrapper = createWrapper();
    wrapper.update();

    expect(
      wrapper
        .find(
          '[aria-label="studies.details.citation_formatter.select_arialabel"]'
        )
        .first()
        .prop('defaultValue')
    ).toEqual('default');

    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
    );
    expect(
      wrapper.find('#citation-formatter-copy-citation').first().prop('disabled')
    ).toEqual(false);
  });

  it('sends axios request to fetch a formatted citation when a format is selected', async () => {
    const wrapper = createWrapper();

    (axios.get as jest.Mock).mockResolvedValue({
      data: 'This is a test',
    });

    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'format2' } });
    await act(async () => flushPromises());
    wrapper.update();

    const params = new URLSearchParams({
      style: 'format2',
      locale: 'studies.details.citation_formatter.locale',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://data.crosscite.org/text/x-bibliography/test',
      expect.objectContaining({
        params,
      })
    );
    expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
      params.toString()
    );

    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual('This is a test');
    expect(
      wrapper.find('#citation-formatter-copy-citation').first().prop('disabled')
    ).toEqual(false);
  });

  it('copies data citation to clipboard', async () => {
    const wrapper = createWrapper();

    // Mock the clipboard object
    const testWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: testWriteText,
      },
    });

    expect(
      wrapper.find('[data-testid="citation-formatter-citation"]').first().text()
    ).toEqual(
      'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
    );

    wrapper.find('#citation-formatter-copy-citation').first().simulate('click');

    expect(testWriteText).toHaveBeenCalledWith(
      'John Smith; 2019: title, doi_constants.publisher.name, https://doi.org/test'
    );

    expect(
      wrapper.find('#citation-formatter-copied-citation').first().text()
    ).toEqual('studies.details.citation_formatter.copied_citation');
  });

  it('displays error message when axios request to fetch a formatted citation fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce({
      message: 'error',
    });

    const wrapper = createWrapper();
    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'format2' } });
    await act(async () => flushPromises());
    wrapper.update();

    const params = new URLSearchParams({
      style: 'format2',
      locale: 'studies.details.citation_formatter.locale',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://data.crosscite.org/text/x-bibliography/test',
      expect.objectContaining({
        params,
      })
    );
    expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
      params.toString()
    );

    expect(
      wrapper.find('#citation-formatter-error-message').first().text()
    ).toEqual('studies.details.citation_formatter.error');

    expect(
      wrapper.find('#citation-formatter-copy-citation').first().prop('disabled')
    ).toEqual(false);
  });
});
