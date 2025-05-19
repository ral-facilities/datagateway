import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  TranslatedHomePage as HomePage,
  TranslatedHomePageStateProps,
} from './translatedHomePage.component';

describe('HomePage', () => {
  let props: TranslatedHomePageStateProps;

  beforeEach(() => {
    props = {
      pluginHost: '/test/',
    };
  });

  it('translated homepage renders correctly', () => {
    render(
      <MemoryRouter>
        <HomePage {...props} />
      </MemoryRouter>
    );

    // check images are set correctly
    expect(screen.getByTestId('background').style.backgroundImage).toMatch(
      /url(.*)background\.jpg/
    );
    // inlining SVGs can't be tested via JSDOM?
    // expect(
    //   screen.getByTestId('background-decal').style.backgroundImage
    // ).toMatch(/url(.*)green-swirl1\.png"\), url(.*)decal1\.svg/);
    expect(screen.getByTestId('facility-image').style.backgroundImage).toMatch(
      /url(.*)facility\.jpg/
    );
    expect(screen.getByTestId('facility-decal').style.backgroundImage).toMatch(
      /url(.*)green-swirl2\.png/
    );
    // expect(screen.getByTestId('browse-decal').style.backgroundImage).toMatch(
    //   /url(.*)decal2\.svg/
    // );
  });
});
