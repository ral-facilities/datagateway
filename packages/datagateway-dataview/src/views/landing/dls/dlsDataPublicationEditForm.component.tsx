import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  ContributorType,
  ContributorUser,
  DOIConfirmDialog,
  DOIMetadataForm,
  readSciGatewayToken,
  RelatedDOI,
  useDataPublication,
  useDataPublicationsByFilters,
  useUpdateDOI,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { paths } from '../../../page/pageContainer.component';
import { Redirect, useLocation } from 'react-router-dom';
import { StateType } from '../../../state/app.types';

interface DLSDataPublicationEditFormProps {
  dataPublicationId: string;
}

const DLSDataPublicationEditForm: React.FC<DLSDataPublicationEditFormProps> = (
  props
) => {
  const { dataPublicationId } = props;
  const [selectedUsers, setSelectedUsers] = React.useState<ContributorUser[]>(
    []
  );
  const [relatedDOIs, setRelatedDOIs] = React.useState<RelatedDOI[]>([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const [showMintConfirmation, setShowMintConfirmation] = React.useState(false);

  const doiMinterUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiMinterUrl
  );
  const dataCiteUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.dataCiteUrl
  );

  const { data: dataPublication } = useDataPublication(
    parseInt(dataPublicationId)
  );

  const { data: versionDataPublications } = useDataPublicationsByFilters(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'relatedItems.relationType': { eq: 'IsVersionOf' },
        }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'relatedItems.identifier': { eq: dataPublication?.pid },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            content: {
              dataCollectionInvestigations: {
                investigation: {
                  investigationInstruments: 'instrument',
                },
              },
              dataCollectionDatasets: 'dataset',
              dataCollectionDatafiles: 'datafile',
            },
          },
        ]),
      },
      { filterType: 'order', filterValue: JSON.stringify('createTime desc') },
    ],
    { enabled: !!dataPublication?.pid }
  );
  const versionDataPublication = versionDataPublications?.[0];

  React.useEffect(() => {
    if (dataPublication) {
      setTitle(dataPublication.title);
      setDescription(dataPublication.description ?? '');
      setRelatedDOIs(
        dataPublication.relatedItems
          // filter out our generated versions from here
          ?.filter(
            (relatedItem) => !relatedItem.relationType.includes('Version')
          )
          .map((relatedItem) => ({
            title: relatedItem.title ?? '',
            fullReference: relatedItem.fullReference ?? '',
            identifier: relatedItem.identifier,
            relationType: relatedItem.relationType,
            relatedItemType: relatedItem.relatedItemType ?? '',
          })) ?? []
      );
      setSelectedUsers(
        dataPublication.users?.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          name: user.user?.name ?? user.fullName, // we're in trouble if user.user.name is undefined...
          contributor_type: user.contributorType as ContributorType,
        })) ?? []
      );
    }
  }, [dataPublication]);

  const {
    mutate: updateDOI,
    status: mintingStatus,
    data: mintData,
    error: mintError,
  } = useUpdateDOI();

  const location = useLocation<{ fromEdit: boolean } | undefined>();

  const [t] = useTranslation();

  // redirect if the user tries to access the link directly instead of from the edit button
  if (!location.state?.fromEdit) {
    const landingPageUrl = paths.landing.dlsDataPublicationLanding.replace(
      ':dataPublicationId',
      dataPublicationId
    );
    return <Redirect to={landingPageUrl} />;
  }

  return (
    <Box m={1}>
      {
        <>
          <Box>
            {/* need to specify colour is textPrimary since this Typography is not in a Paper */}
            <Typography variant="h5" component="h2" color="textPrimary">
              {t('DOIGenerationForm.page_header')}
            </Typography>
            <Paper sx={{ padding: 1 }}>
              {/* use row-reverse, justifyContent start and the "wrong" order of components to make overflow layout nice
                  i.e. data summary presented at top before DOI form, but in non-overflow
                  mode it's DOI form on left and data summary on right */}
              <Grid
                container
                direction="row-reverse"
                justifyContent="start"
                spacing={2}
              >
                <DOIMetadataForm
                  xs
                  lg={7}
                  dataCiteUrl={dataCiteUrl}
                  doiMinterUrl={doiMinterUrl}
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  relatedDOIs={relatedDOIs}
                  setRelatedDOIs={setRelatedDOIs}
                  disableMintButton={false}
                  onMintClick={() => {
                    if (dataPublication && versionDataPublication) {
                      setShowMintConfirmation(true);
                      const creatorsList = selectedUsers
                        .filter(
                          (user) =>
                            // the user requesting the mint is added automatically
                            // by the backend, so don't pass them to the backend
                            user.name !== readSciGatewayToken().username
                        )
                        .map((user) => ({
                          username: user.name,
                          contributor_type:
                            user.contributor_type as ContributorType, // we check this is true in the disabled field above
                        }));
                      updateDOI({
                        dataPublicationId,
                        // TODO: add ability for user to edit the content
                        content: {
                          investigation_ids:
                            versionDataPublication.content?.dataCollectionInvestigations
                              ?.filter(
                                (dci): dci is Required<typeof dci> =>
                                  typeof dci.investigation !== 'undefined'
                              )
                              .map((dci) => dci.investigation.id) ?? [],
                          dataset_ids:
                            versionDataPublication.content?.dataCollectionDatasets
                              ?.filter(
                                (dcd): dcd is Required<typeof dcd> =>
                                  typeof dcd.dataset !== 'undefined'
                              )
                              ?.map((dcd) => dcd.dataset.id) ?? [],
                          datafile_ids:
                            versionDataPublication.content?.dataCollectionDatafiles
                              ?.filter(
                                (dcd): dcd is Required<typeof dcd> =>
                                  typeof dcd.datafile !== 'undefined'
                              )
                              ?.map((dcd) => dcd.datafile.id) ?? [],
                        },
                        doiMetadata: {
                          title,
                          description,
                          creators:
                            creatorsList.length > 0 ? creatorsList : undefined,
                          related_items: relatedDOIs,
                        },
                      });
                    }
                  }}
                />
              </Grid>
            </Paper>
          </Box>
          {/* Show the download confirmation dialog. */}
          <DOIConfirmDialog
            open={showMintConfirmation}
            mintingStatus={mintingStatus}
            data={mintData}
            error={mintError}
            setClose={() => setShowMintConfirmation(false)}
          />
        </>
      }
    </Box>
  );
};

export default DLSDataPublicationEditForm;
