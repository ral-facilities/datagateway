import { HomePage } from 'datagateway-common';
// TODO: when vite 6, explore no-inline w/ pluginHost vs inline as we have to inline in vite 5
import BackgroundImage from 'datagateway-common/src/images/background.jpg';
import DGLogo from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import Decal1Image from 'datagateway-common/src/images/decal1.svg';
import Decal2DarkImage from 'datagateway-common/src/images/decal2-dark.svg';
import Decal2DarkHCImage from 'datagateway-common/src/images/decal2-darkhc.svg';
import Decal2Image from 'datagateway-common/src/images/decal2.svg';
import FacilityImage from 'datagateway-common/src/images/facility.jpg';
import GreenSwirl1Image from 'datagateway-common/src/images/green-swirl1.png';
import GreenSwirl2Image from 'datagateway-common/src/images/green-swirl2.png';
import React from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';

export interface TranslatedHomePageStateProps {
  facilityImageURL?: string | undefined;
  pluginHost: string | undefined;
}

export const TranslatedHomePage = React.memo(
  (props: TranslatedHomePageStateProps): React.ReactElement => {
    const TranslatedHomePage = HomePage;
    return (
      <TranslatedHomePage
        logo={`"${DGLogo}"`} // need double quotes for SVGs, see https://v5.vite.dev/guide/assets.html#importing-asset-as-url
        backgroundImage={BackgroundImage}
        greenSwirl1Image={GreenSwirl1Image}
        greenSwirl2Image={GreenSwirl2Image}
        decal1Image={`"${Decal1Image}"`}
        decal2Image={`"${Decal2Image}"`}
        decal2DarkImage={`"${Decal2DarkImage}"`}
        decal2DarkHCImage={`"${Decal2DarkHCImage}"`}
        facilityImage={
          props.facilityImageURL ? props.facilityImageURL : FacilityImage
        }
      />
    );
  }
);

TranslatedHomePage.displayName = 'TranslatedHomePage';

const mapStateToProps = (state: StateType): TranslatedHomePageStateProps => ({
  pluginHost: state.dgdataview.pluginHost,
  facilityImageURL: state.dgdataview.facilityImageURL,
});

export default connect(mapStateToProps)(TranslatedHomePage);
