import { Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import {
  ContributorType,
  ContributorUser,
  DOIConfirmDialog,
  DOIMetadataForm,
  readSciGatewayToken,
  RelatedDOI,
  useCart,
  useDataPublication,
  useDataPublicationsByFilters,
  useIsCartMintable,
  useUpdateDOI,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { paths } from '../../../page/pageContainer.component';
import { Redirect, useLocation } from 'react-router-dom';
import { StateType } from '../../../state/app.types';
import DLSDataPublicationDataEditor, {
  TransferListItem,
} from './dlsDataPublicationDataEditor.component';

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

  const {
    data: versionDataPublications,
    isFetched: versionDataPublicationLoaded,
  } = useDataPublicationsByFilters(
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
          email: user.email,
          affiliation: user.affiliations?.[0]?.name,
        })) ?? []
      );
    }
  }, [dataPublication]);

  const [content, setContent] = React.useState<TransferListItem[]>([]);
  const [unselectedContent, setUnselectedContent] = React.useState<
    TransferListItem[]
  >([]);

  React.useEffect(() => {
    if (versionDataPublication) {
      setContent([
        ...(versionDataPublication?.content?.dataCollectionInvestigations
          ?.filter(
            (dci): dci is Required<typeof dci> =>
              typeof dci.investigation !== 'undefined'
          )
          .map((dci) => ({
            id: dci.investigation.id,
            label: dci.investigation.title,
            entityType: 'investigation' as const,
          })) ?? []),
        ...(versionDataPublication?.content?.dataCollectionDatasets
          ?.filter(
            (dcd): dcd is Required<typeof dcd> =>
              typeof dcd.dataset !== 'undefined'
          )
          .map((dcd) => ({
            id: dcd.dataset.id,
            label: dcd.dataset.name,
            entityType: 'dataset' as const,
          })) ?? []),
        ...(versionDataPublication?.content?.dataCollectionDatafiles
          ?.filter(
            (dcd): dcd is Required<typeof dcd> =>
              typeof dcd.datafile !== 'undefined'
          )
          ?.map((dcd) => ({
            id: dcd.datafile.id,
            label: dcd.datafile.name,
            entityType: 'datafile' as const,
          })) ?? []),
      ]);
    }
  }, [versionDataPublication]);

  const {
    mutate: updateDOI,
    status: mintingStatus,
    data: mintData,
    error: mintError,
  } = useUpdateDOI();

  const { data: cart } = useCart();
  const { isLoading: cartMintabilityLoading, error: mintableError } =
    useIsCartMintable(cart, doiMinterUrl);

  const unmintableEntityIDs: number[] | null | undefined = React.useMemo(
    () =>
      mintableError?.response?.status === 403 &&
      typeof mintableError?.response?.data?.detail === 'string' &&
      JSON.parse(
        mintableError.response.data.detail.substring(
          mintableError.response.data.detail.indexOf('['),
          mintableError.response.data.detail.lastIndexOf(']') + 1
        )
      ),
    [mintableError]
  );

  // const prevCart = React.useRef<typeof cart>(undefined);
  const loadedUnselectedContent = React.useRef(false);

  React.useEffect(() => {
    // only run this code once
    if (
      cart &&
      content.length > 0 &&
      !cartMintabilityLoading &&
      !loadedUnselectedContent.current
    ) {
      setUnselectedContent(
        cart
          .filter((cartItem) =>
            content.every((item) => item.id !== cartItem.entityId)
          )
          .map((cartItem) => ({
            id: cartItem.entityId,
            label: cartItem.name,
            entityType: cartItem.entityType,
            disabled: unmintableEntityIDs?.includes(cartItem.entityId),
          }))
      );
      loadedUnselectedContent.current = true;
    }
  }, [cart, cartMintabilityLoading, content, unmintableEntityIDs]);

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
                <Grid container item direction="column" xs lg={6}>
                  {!versionDataPublicationLoaded ? (
                    <CircularProgress sx={{ alignSelf: 'center' }} />
                  ) : (
                    <DLSDataPublicationDataEditor
                      unselectedContent={unselectedContent}
                      content={content}
                      changeContent={setContent}
                      changeUnselectedContent={setUnselectedContent}
                    />
                  )}
                </Grid>
                <DOIMetadataForm
                  xs
                  lg={6}
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
                        content: {
                          investigation_ids: content
                            .filter((v) => v.entityType === 'investigation')
                            .map((i) => i.id),
                          dataset_ids: content
                            .filter((v) => v.entityType === 'dataset')
                            .map((d) => d.id),
                          datafile_ids: content
                            .filter((v) => v.entityType === 'datafile')
                            .map((d) => d.id),
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
