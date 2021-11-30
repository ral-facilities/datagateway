import React from 'react';
import { HomePage } from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import DGLogo from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import BackgroundImage from 'datagateway-common/src/images/background.jpg';
import ExploreImage from 'datagateway-common/src/images/explore.jpg';
import DiscoverImage from 'datagateway-common/src/images/discover.jpg';
import DownloadImage from 'datagateway-common/src/images/download.jpg';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

export interface TranslatedHomePageStateProps {
  pluginHost: string | undefined;
}

export const TranslatedHomePage = React.memo(
  (props: TranslatedHomePageStateProps): React.ReactElement => {
    const TranslatedHomePage = HomePage;
    const [t] = useTranslation();

    return (
      <TranslatedHomePage
        title={t('homePage.title')}
        logoLabel={t('homePage.logoLabel')}
        howLabel={t('homePage.howLabel')}
        exploreLabel={t('homePage.exploreLabel')}
        exploreDescription={t('homePage.exploreDescription')}
        exploreLink={t('homePage.exploreLink')}
        discoverLabel={t('homePage.discoverLabel')}
        discoverDescription={t('homePage.discoverDescription')}
        discoverLink={t('homePage.discoverLink')}
        downloadLabel={t('homePage.downloadLabel')}
        downloadDescription={t('homePage.downloadDescription')}
        downloadLink={t('homePage.downloadLink')}
        logo={props.pluginHost + DGLogo}
        backgroundImage={props.pluginHost + BackgroundImage}
        exploreImage={props.pluginHost + ExploreImage}
        discoverImage={props.pluginHost + DiscoverImage}
        downloadImage={props.pluginHost + DownloadImage}
      />
    );
  }
);

TranslatedHomePage.displayName = 'TranslatedHomePage';

const mapStateToProps = (state: StateType): TranslatedHomePageStateProps => ({
  pluginHost: state.dgdataview.pluginHost,
});

export default connect(mapStateToProps)(TranslatedHomePage);
