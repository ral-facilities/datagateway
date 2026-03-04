import {
  Box,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  BioPortalTerm,
  ContributorType,
  ContributorUser,
  DOIConfirmDialog,
  DOIMetadataConfirmation,
  DOIMetadataForm,
  RelatedIdentifier,
  readSciGatewayToken,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  useCart,
  useCartUsers,
  useDeleteDraft,
  useMintDraftCart,
  usePublishDraft,
} from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';

const DOIGenerationForm: React.FC = () => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<ContributorUser[]>(
    []
  );
  const [relatedIdentifiers, setRelatedIdentifiers] = React.useState<
    RelatedIdentifier[]
  >([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [techniques, setTechniques] = React.useState<BioPortalTerm[]>([]);
  const [subjects, setSubjects] = React.useState<string[]>([]);
  const [currentTab, setCurrentTab] = React.useState<
    'investigation' | 'dataset' | 'datafile'
  >('investigation');
  const [showMintConfirmation, setShowMintConfirmation] = React.useState(false);

  const { doiMinterUrl, dataCiteUrl, bioportalUrl } = React.useContext(
    DownloadSettingsContext
  );

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: 'investigation' | 'dataset' | 'datafile'
  ): void => {
    setCurrentTab(newValue);
  };

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);
  const {
    mutateAsync: mintDraftCart,
    status: mintingDraftStatus,
    data: mintDraftData,
  } = useMintDraftCart();

  const draftDataPublicationId = mintDraftData?.concept.data_publication_id;

  const {
    mutate: publishDraft,
    status: publishingStatus,
    data: publishData,
    error: publishError,
  } = usePublishDraft();

  const { mutateAsync: deleteDraft, status: deleteDraftStatus } =
    useDeleteDraft();

  React.useEffect(() => {
    if (users)
      setSelectedUsers(
        users.map((user) => ({
          ...user,
          contributor_type: ContributorType.Creator,
        }))
      );
  }, [users]);

  React.useEffect(() => {
    if (cart) {
      if (cart?.some((cartItem) => cartItem.entityType === 'investigation'))
        setCurrentTab('investigation');
      else if (cart?.some((cartItem) => cartItem.entityType === 'dataset'))
        setCurrentTab('dataset');
      else if (cart?.some((cartItem) => cartItem.entityType === 'datafile'))
        setCurrentTab('datafile');
    }
  }, [cart]);

  const location = useLocation<{ fromCart: boolean } | undefined>();

  const [t] = useTranslation();

  const [showMetadataConfirmation, setShowMetadataConfirmation] =
    React.useState(false);

  const handleMintClick = React.useCallback(() => {
    if (cart) {
      const creatorsList = selectedUsers
        .filter(
          (user) =>
            // the user requesting the mint is added automatically
            // by the backend, so don't pass them to the backend
            user.name !== readSciGatewayToken().username
        )
        .map((user) => ({
          username: user.name,
          contributor_type: user.contributor_type as ContributorType, // we check this is true in the disabled field above
        }));
      mintDraftCart({
        cart,
        doiMetadata: {
          title,
          description,
          creators: creatorsList.length > 0 ? creatorsList : undefined,
          related_items: relatedIdentifiers,
          subjects: [
            ...subjects.map((s) => ({
              subject: s,
              subjectScheme: null,
              schemeUri: null,
              valueUri: null,
              classificationCode: null,
            })),
            ...techniques.map((t) => ({
              subject: t.prefLabel,
              subjectScheme:
                'Photon and Neutron Experimental Techniques (PaNET) ontology',
              schemeUri: 'http://purl.org/pan-science/PaNET/',
              valueUri: t['@id'],
              classificationCode: null,
            })),
          ],
        },
      }).then(() => {
        setShowMetadataConfirmation(true);
      });
    }
  }, [
    cart,
    description,
    mintDraftCart,
    relatedIdentifiers,
    selectedUsers,
    subjects,
    techniques,
    title,
  ]);

  const handleConfirmClick = React.useCallback(() => {
    if (draftDataPublicationId) {
      setShowMintConfirmation(true);

      publishDraft(draftDataPublicationId);
    }
  }, [draftDataPublicationId, publishDraft]);

  const handleBackClick = React.useCallback(() => {
    if (draftDataPublicationId)
      deleteDraft(draftDataPublicationId).finally(() => {
        // finally instead of then is that we should let the user go back even if delete fails
        // we'll need a job to clear up lingering drafts anyway
        setShowMetadataConfirmation(false);
      });
  }, [deleteDraft, draftDataPublicationId]);

  // redirect if the user tries to access the link directly instead of from the cart
  if (!location.state?.fromCart) {
    return <Redirect to="/download" />;
  }

  return (
    <Box m={1}>
      {acceptedDataPolicy ? (
        <>
          {showMetadataConfirmation ? (
            <DOIMetadataConfirmation
              draftMetadata={mintDraftData?.concept.attributes}
              onBackClick={handleBackClick}
              onConfirmClick={handleConfirmClick}
              deleteLoading={deleteDraftStatus === 'loading'}
              publishLoading={publishingStatus === 'loading'}
            />
          ) : (
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
                  <Grid container item direction="column" xs="auto" lg={5}>
                    <Grid item>
                      <Typography variant="h6" component="h3">
                        {t('DOIGenerationForm.data_header')}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Box
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Tabs
                          value={currentTab}
                          onChange={handleTabChange}
                          aria-label={t(
                            'DOIGenerationForm.cart_tabs_aria_label'
                          )}
                          indicatorColor="secondary"
                          textColor="secondary"
                        >
                          {cart?.some(
                            (cartItem) =>
                              cartItem.entityType === 'investigation'
                          ) && (
                            <Tab
                              label={t(
                                'DOIGenerationForm.cart_tab_investigations'
                              )}
                              value="investigation"
                            />
                          )}
                          {cart?.some(
                            (cartItem) => cartItem.entityType === 'dataset'
                          ) && (
                            <Tab
                              label={t('DOIGenerationForm.cart_tab_datasets')}
                              value="dataset"
                            />
                          )}
                          {cart?.some(
                            (cartItem) => cartItem.entityType === 'datafile'
                          ) && (
                            <Tab
                              label={t('DOIGenerationForm.cart_tab_datafiles')}
                              value="datafile"
                            />
                          )}
                        </Tabs>
                      </Box>
                      {/* TODO: do we need to display more info in this table?
                  we could rejig the fetch for users to return more info we want
                  as we're already querying every item in the cart there */}
                      <Table
                        sx={{
                          backgroundColor: 'background.default',
                        }}
                        size="small"
                        aria-label={`cart ${currentTab} table`}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              {t('DOIGenerationForm.cart_table_name')}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cart
                            ?.filter(
                              (cartItem) => cartItem.entityType === currentTab
                            )
                            .map((cartItem) => (
                              <TableRow key={cartItem.id}>
                                <TableCell>{cartItem.name}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                  <DOIMetadataForm
                    xs
                    lg={7}
                    dataCiteUrl={dataCiteUrl}
                    doiMinterUrl={doiMinterUrl}
                    bioportalUrl={bioportalUrl}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    relatedIdentifiers={relatedIdentifiers}
                    setRelatedIdentifiers={setRelatedIdentifiers}
                    techniques={techniques}
                    setTechniques={setTechniques}
                    subjects={subjects}
                    setSubjects={setSubjects}
                    disableMintButton={
                      typeof cart === 'undefined' || cart.length === 0
                    }
                    mintLoading={mintingDraftStatus === 'loading'}
                    onMintClick={handleMintClick}
                  />
                </Grid>
              </Paper>
            </Box>
          )}
          {/* Show the download confirmation dialog. */}
          <DOIConfirmDialog
            open={showMintConfirmation}
            mintingStatus={publishingStatus}
            data={publishData}
            error={publishError}
            setClose={() => setShowMintConfirmation(false)}
          />
        </>
      ) : (
        <AcceptDataPolicy
          acceptDataPolicy={() => setAcceptedDataPolicy(true)}
        />
      )}
    </Box>
  );
};

export default DOIGenerationForm;
