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
  ContributorType,
  ContributorUser,
  DOIMetadataForm,
  DOIConfirmDialog,
  readSciGatewayToken,
  RelatedDOI,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import { useCart, useCartUsers, useMintCart } from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';

const DOIGenerationForm: React.FC = () => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<ContributorUser[]>(
    []
  );
  const [relatedDOIs, setRelatedDOIs] = React.useState<RelatedDOI[]>([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState<
    'investigation' | 'dataset' | 'datafile'
  >('investigation');
  const [showMintConfirmation, setShowMintConfirmation] = React.useState(false);

  const { doiMinterUrl, dataCiteUrl } = React.useContext(
    DownloadSettingsContext
  );

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'investigation' | 'dataset' | 'datafile'
  ): void => {
    setCurrentTab(newValue);
  };

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);
  const {
    mutate: mintCart,
    status: mintingStatus,
    data: mintData,
    error: mintError,
  } = useMintCart();

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

  // redirect if the user tries to access the link directly instead of from the cart
  if (!location.state?.fromCart) {
    return <Redirect to="/download" />;
  }

  return (
    <Box m={1}>
      {acceptedDataPolicy ? (
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
                        aria-label={t('DOIGenerationForm.cart_tabs_aria_label')}
                        indicatorColor="secondary"
                        textColor="secondary"
                      >
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'investigation'
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
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  relatedDOIs={relatedDOIs}
                  setRelatedDOIs={setRelatedDOIs}
                  disableMintButton={
                    typeof cart === 'undefined' || cart.length === 0
                  }
                  onMintClick={() => {
                    if (cart) {
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
                      mintCart({
                        cart,
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
      ) : (
        <AcceptDataPolicy
          acceptDataPolicy={() => setAcceptedDataPolicy(true)}
        />
      )}
    </Box>
  );
};

export default DOIGenerationForm;
