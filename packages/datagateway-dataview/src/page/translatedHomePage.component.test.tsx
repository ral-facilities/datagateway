import {
  TranslatedHomePage as HomePage,
  TranslatedHomePageStateProps,
} from './translatedHomePage.component';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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

    // check images are set correctly & that they account for pluginHost
    expect(screen.getByTestId('background').style.backgroundImage).toMatch(
      /url\(\/test\/(.*)background\.jpg/
    );
    expect(
      screen.getByTestId('background-decal').style.backgroundImage
    ).toMatch(
      /url\(\/test\/(.*)green-swirl1\.png(.*), url\(\/test\/(.*)decal1\.svg/
    );
    expect(screen.getByTestId('facility-image').style.backgroundImage).toMatch(
      /url\(\/test\/(.*)facility\.jpg/
    );
    expect(screen.getByTestId('facility-decal').style.backgroundImage).toMatch(
      /url\(\/test\/(.*)green-swirl2\.png/
    );
  });
});
