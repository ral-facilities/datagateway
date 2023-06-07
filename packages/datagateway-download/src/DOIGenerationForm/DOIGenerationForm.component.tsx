import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { readSciGatewayToken, User } from 'datagateway-common';
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import {
  useCart,
  useCartUsers,
  useCheckUser,
  useMintCart,
} from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';
import DOIConfirmDialog from './DOIConfirmDialog.component';

const DOIGenerationForm: React.FC = () => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [username, setUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState<
    'investigation' | 'dataset' | 'datafile'
  >('investigation');
  const [showMintConfirmation, setShowMintConfirmation] = React.useState(false);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'investigation' | 'dataset' | 'datafile'
  ): void => {
    setCurrentTab(newValue);
  };

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);
  const { refetch: checkUser } = useCheckUser(username);
  const {
    mutateAsync: mintCart,
    status: mintingStatus,
    data: mintData,
    error: mintError,
  } = useMintCart();

  React.useEffect(() => {
    if (users) setSelectedUsers(users);
  }, [users]);

  React.useEffect(() => {
    if (cart) {
      if (cart?.some((cartItem) => cartItem.entityType === 'investigation'))
        setCurrentTab('investigation');
      if (cart?.some((cartItem) => cartItem.entityType === 'dataset'))
        setCurrentTab('dataset');
      if (cart?.some((cartItem) => cartItem.entityType === 'datafile'))
        setCurrentTab('datafile');
    }
  }, [cart]);

  const location = useLocation<{ fromCart: boolean } | undefined>();

  // redirect if the user tries to access the link directly instead of from the cart
  if (!location.state?.fromCart) {
    return <Redirect to="/download" />;
  }

  return (
    <Box m={1} sx={{ bgColor: 'background.default' }}>
      {acceptedDataPolicy ? (
        <>
          <Box>
            <Typography variant="h5" component="h2">
              Generate DOI
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
                <Grid container item direction="column" xs="auto">
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      Data
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
                        aria-label="cart tabs"
                      >
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'investigation'
                        ) && (
                          <Tab label="Investigations" value="investigation" />
                        )}
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'dataset'
                        ) && <Tab label="Datasets" value="dataset" />}
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'datafile'
                        ) && <Tab label="Datafiles" value="datafile" />}
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
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
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
                <Grid container item direction="column" xs spacing={1}>
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      Details
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      label="DOI Title"
                      required
                      fullWidth
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="DOI Description"
                      required
                      multiline
                      rows={4}
                      fullWidth
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Grid>
                  <Grid item>
                    <Paper
                      sx={{
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                        padding: 1,
                      }}
                      elevation={0}
                      variant="outlined"
                    >
                      <Grid container direction="row" spacing={1}>
                        <Grid item>
                          <Typography variant="h6" component="h4">
                            Creators
                          </Typography>
                        </Grid>
                        <Grid
                          container
                          item
                          spacing={1}
                          alignItems="center"
                          sx={{
                            marginBottom: usernameError.length > 0 ? 2 : 0,
                          }}
                        >
                          <Grid item xs>
                            <TextField
                              label="Username"
                              required
                              fullWidth
                              error={usernameError.length > 0}
                              helperText={
                                usernameError.length > 0 ? usernameError : ''
                              }
                              sx={{
                                backgroundColor: 'background.default',
                                // this CSS makes it so that the helperText doesn't mess with the button alignment
                                '& .MuiFormHelperText-root': {
                                  position: 'absolute',
                                  bottom: '-1.5rem',
                                },
                              }}
                              value={username}
                              onChange={(event) => {
                                setUsername(event.target.value);
                                setUsernameError('');
                              }}
                            />
                          </Grid>
                          <Grid item>
                            <Button
                              onClick={() => {
                                // don't let the user add duplicates
                                if (
                                  selectedUsers.every(
                                    (selectedUser) =>
                                      selectedUser.name !== username
                                  )
                                ) {
                                  checkUser({ throwOnError: true })
                                    .then((response) => {
                                      // add user
                                      const user = response.data;
                                      if (user) {
                                        setSelectedUsers((selectedUsers) => [
                                          ...selectedUsers,
                                          user,
                                        ]);
                                        setUsername('');
                                      }
                                    })
                                    .catch(
                                      (
                                        error: AxiosError<{
                                          detail: { msg: string }[] | string;
                                        }>
                                      ) => {
                                        // TODO: check this is the right message from the API
                                        setUsernameError(
                                          error.response?.data?.detail
                                            ? typeof error.response.data
                                                .detail === 'string'
                                              ? error.response.data.detail
                                              : error.response.data.detail[0]
                                                  .msg
                                            : 'Error'
                                        );
                                      }
                                    );
                                } else {
                                  setUsernameError('Cannot add duplicate user');
                                  setUsername('');
                                }
                              }}
                            >
                              Add Creator
                            </Button>
                          </Grid>
                        </Grid>
                        <Grid item>
                          <Table
                            sx={{
                              backgroundColor: 'background.default',
                            }}
                            size="small"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Affiliation</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {typeof users === 'undefined' && (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    sx={{ textAlign: 'center' }}
                                  >
                                    <CircularProgress />
                                  </TableCell>
                                </TableRow>
                              )}
                              {selectedUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>{user.fullName}</TableCell>
                                  <TableCell>{user?.affiliation}</TableCell>
                                  <TableCell>{user?.email}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      disabled={
                                        user.name ===
                                        readSciGatewayToken().username
                                      }
                                      onClick={() =>
                                        setSelectedUsers((selectedUsers) =>
                                          selectedUsers.filter(
                                            (selectedUser) =>
                                              selectedUser.id !== user.id
                                          )
                                        )
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item alignSelf="flex-end">
                    <Button
                      variant="contained"
                      disabled={
                        title.length === 0 ||
                        description.length === 0 ||
                        selectedUsers.length === 0 ||
                        typeof cart === 'undefined' ||
                        cart.length === 0
                      }
                      onClick={() => {
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
                            }));
                          mintCart({
                            cart,
                            doiMetadata: {
                              title,
                              description,
                              creators:
                                creatorsList.length > 0
                                  ? creatorsList
                                  : undefined,
                            },
                          });
                        }
                      }}
                    >
                      Generate DOI
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          {/* Show the download confirmation dialog. */}
          <DOIConfirmDialog
            aria-labelledby="downloadCartConfirmation"
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
