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
import { useCart, useCartUsers } from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';

type DOIGenerationFormProps = {
  lol?: string;
};

const DOIGenerationForm: React.FC<DOIGenerationFormProps> = (props) => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(true);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);

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
                    <Typography variant="h6" component="h4">
                      Creators
                    </Typography>
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
                                  user.name === readSciGatewayToken().username
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
