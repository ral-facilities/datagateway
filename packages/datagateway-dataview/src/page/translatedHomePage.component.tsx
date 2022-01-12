import React from 'react';
import { HomePage } from 'datagateway-common';
import DGLogo from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import BackgroundImage from 'datagateway-common/src/images/background.jpg';
import GreenSwirl1Image from 'datagateway-common/src/images/green-swirl1.png';
import GreenSwirl2Image from 'datagateway-common/src/images/green-swirl2.png';
import Decal1Image from 'datagateway-common/src/images/decal1.svg';
import Decal2Image from 'datagateway-common/src/images/decal2.svg';
import Decal2DarkImage from 'datagateway-common/src/images/decal2-dark.svg';
import Decal2DarkHCImage from 'datagateway-common/src/images/decal2-darkhc.svg';
import FacilityImage from 'datagateway-common/src/images/facility.jpg';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

export interface TranslatedHomePageStateProps {
  facilityImageURL?: string | undefined;
  pluginHost: string | undefined;
}

export const TranslatedHomePage = React.memo(
  (props: TranslatedHomePageStateProps): React.ReactElement => {
    const TranslatedHomePage = HomePage;
    return (
      <TranslatedHomePage
        logo={props.pluginHost + DGLogo}
        backgroundImage={props.pluginHost + BackgroundImage}
        greenSwirl1Image={props.pluginHost + GreenSwirl1Image}
        greenSwirl2Image={props.pluginHost + GreenSwirl2Image}
        decal1Image={props.pluginHost + Decal1Image}
        decal2Image={props.pluginHost + Decal2Image}
        decal2DarkImage={props.pluginHost + Decal2DarkImage}
        decal2DarkHCImage={props.pluginHost + Decal2DarkHCImage}
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
