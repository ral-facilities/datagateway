import React from 'react';
import {
  TranslatedHomePage as HomePage,
  TranslatedHomePageStateProps,
} from './translatedHomePage.component';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('HomePage', () => {
  let props: TranslatedHomePageStateProps;

  beforeEach(() => {
    props = {
      pluginHost: 'test',
    };
  });

  it('translated homepage renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <HomePage {...props} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
