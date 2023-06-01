import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { readSciGatewayToken, User } from 'datagateway-common';
import React from 'react';
import { useCart, useCartUsers, useCheckUser } from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';

type DOIGenerationFormProps = {
  lol?: string;
};

const DOIGenerationForm: React.FC<DOIGenerationFormProps> = (props) => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(true);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);
  const { refetch: checkUser } = useCheckUser(email);

  React.useEffect(() => {
    if (users) setSelectedUsers(users);
  }, [users]);

  return (
    <Box m={1} sx={{ bgColor: 'background.default' }}>
      {acceptedDataPolicy ? (
        <Box>
          <Typography variant="h5" component="h2">
            Generate DOI
          </Typography>
          <Paper sx={{ padding: 1 }}>
            <Grid container direction="row" spacing={2}>
              <Grid container item direction="column" xs={6} spacing={1}>
                <Grid item>
                  <Typography variant="h6" component="h3">
                    Details
                  </Typography>
                </Grid>
                <Grid item>
                  <TextField label="DOI Title" required fullWidth />
                </Grid>
                <Grid item>
                  <TextField
                    label="DOI Description"
                    required
                    multiline
                    rows={4}
                    fullWidth
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
                        sx={{ marginBottom: emailError.length > 0 ? 2 : 0 }}
                      >
                        <Grid item xs>
                          <TextField
                            label="Email"
                            required
                            fullWidth
                            error={emailError.length > 0}
                            helperText={emailError.length > 0 ? emailError : ''}
                            sx={{
                              // this CSS makes it so that the helperText doesn't mess with the button alignment
                              '& .MuiFormHelperText-root': {
                                position: 'absolute',
                                bottom: '-1.5rem',
                              },
                            }}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                          />
                        </Grid>
                        <Grid item>
                          <Button
                            onClick={() => {
                              // don't let the user add duplicates
                              if (
                                selectedUsers.every(
                                  (selectedUser) => selectedUser.email !== email
                                )
                              )
                                checkUser({ throwOnError: true }).then(
                                  (response) => {
                                    // add user
                                    const user = response.data;
                                    if (user) {
                                      setSelectedUsers((selectedUsers) => [
                                        ...selectedUsers,
                                        user,
                                      ]);
                                      setEmail('');
                                    } else {
                                      // TODO: check this is the right message from the API
                                      setEmailError(
                                        response.error?.message ?? 'Error'
                                      );
                                    }
                                  }
                                );
                            }}
                          >
                            Add Creator
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Affiliation</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedUsers?.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user?.affiliation}</TableCell>
                                <TableCell>{user?.email}</TableCell>
                                <TableCell>
                                  <Button
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
              </Grid>
              <Grid container item direction="column" xs={6}>
                <Typography variant="h6" component="h3">
                  Data
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      ) : (
        <AcceptDataPolicy
          acceptDataPolicy={() => setAcceptedDataPolicy(true)}
        />
      )}
    </Box>
  );
};

export default DOIGenerationForm;
