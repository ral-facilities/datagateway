import { Button } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import {
  downloadDatafile,
  downloadDataset,
  StateType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

interface DownloadButtonProps {
  entityType: 'dataset' | 'datafile';
  entityId: number;
  entityName: string;
  variant?: 'text' | 'outlined' | 'contained';
}

interface DownloadButtonDispatchProps {
  downloadData: (
    entityType: 'dataset' | 'datafile',
    entityId: number,
    entityName: string
  ) => Promise<void> | undefined;
}

type DownloadButtonCombinedProps = DownloadButtonProps &
  DownloadButtonDispatchProps;

const DownloadButton = (props: DownloadButtonCombinedProps): JSX.Element => {
  const { entityType, entityId, entityName, variant, downloadData } = props;
  const [t] = useTranslation();

  return (
    <Button
      id="download-btn"
      aria-label="Download"
      variant={variant ?? 'contained'}
      color="primary"
      startIcon={<GetApp />}
      disableElevation
      onClick={() => downloadData(entityType, entityId, entityName)}
    >
      {t('buttons.download')}
    </Button>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DownloadButtonDispatchProps => ({
  downloadData: (
    entityType: 'dataset' | 'datafile',
    entityId: number,
    entityName: string
  ) => {
    if (entityType === 'dataset') {
      return dispatch(downloadDataset(entityId, entityName));
    } else if (entityType === 'datafile') {
      return dispatch(downloadDatafile(entityId, entityName));
    }
  },
});

export default connect(null, mapDispatchToProps)(DownloadButton);
