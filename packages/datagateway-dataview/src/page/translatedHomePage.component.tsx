import React from 'react';
import { HomePage } from 'datagateway-common';
// explicitly set no-inline to ensure Vite doesn't inline the image imports, which wouldn't work with prepending pluginHost
// TODO: explore whether it is better to explicitly inline everything & not use pluginHost
import DGLogo from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg?no-inline';
import BackgroundImage from 'datagateway-common/src/images/background.jpg?no-inline';
import GreenSwirl1Image from 'datagateway-common/src/images/green-swirl1.png?no-inline';
import GreenSwirl2Image from 'datagateway-common/src/images/green-swirl2.png?no-inline';
import Decal1Image from 'datagateway-common/src/images/decal1.svg?no-inline';
import Decal2Image from 'datagateway-common/src/images/decal2.svg?no-inline';
import Decal2DarkImage from 'datagateway-common/src/images/decal2-dark.svg?no-inline';
import Decal2DarkHCImage from 'datagateway-common/src/images/decal2-darkhc.svg?no-inline';
import FacilityImage from 'datagateway-common/src/images/facility.jpg?no-inline';
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
          props.facilityImageURL
            ? props.facilityImageURL
            : props.pluginHost + FacilityImage
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
