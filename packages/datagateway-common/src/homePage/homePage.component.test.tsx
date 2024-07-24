import React from 'react';
import HomePage, { HomePageProps } from './homePage.component';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Home page component', () => {
  let props: HomePageProps;

  beforeEach(() => {
    props = {
      logo: 'test-logo',
      backgroundImage: 'test-bakcgroundImage',
      greenSwirl1Image: 'test-greenSwirl1Image',
      greenSwirl2Image: 'test-greenSwirl2Image',
      decal1Image: 'test-decal1Image',
      decal2Image: 'test-decal2Image',
      decal2DarkImage: 'test-decal2DarkImage',
      decal2DarkHCImage: 'test-Decal2DarkHCImage',
      facilityImage: 'test-facilityImage',
    };
  });

  it('homepage renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <HomePage {...props} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
