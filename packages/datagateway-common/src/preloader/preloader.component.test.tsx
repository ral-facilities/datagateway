import { render } from '@testing-library/react';
import * as React from 'react';
import Preloader from './preloader.component';

describe('Preloader component', () => {
  it('renders when the site is loading', async () => {
    const { asFragment } = render(<Preloader loading={true} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render when the site is not loading', async () => {
    const { asFragment } = render(<Preloader loading={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
