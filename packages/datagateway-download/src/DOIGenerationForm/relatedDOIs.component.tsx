import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { StyledTooltip } from 'datagateway-common/lib/arrowtooltip.component';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DOIRelationType, DOIResourceType, RelatedDOI } from '../downloadApi';
import { useCheckDOI } from '../downloadApiHooks';

type RelatedDOIsProps = {
  relatedDOIs: RelatedDOI[];
  changeRelatedDOIs: React.Dispatch<React.SetStateAction<RelatedDOI[]>>;
};

const RelatedDOIs: React.FC<RelatedDOIsProps> = (props) => {
  const { relatedDOIs, changeRelatedDOIs } = props;
  const [t] = useTranslation();
  const [relatedDOI, setRelatedDOI] = React.useState('');
  const [relatedDOIError, setRelatedDOIError] = React.useState('');
  const { refetch: checkDOI } = useCheckDOI(relatedDOI);

  return (
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
          <Typography variant="h6" component="h4" id="related-dois-label">
            {t('DOIGenerationForm.related_dois')}
          </Typography>
        </Grid>
        <Grid
          container
          item
          spacing={1}
          alignItems="center"
          sx={{
            marginBottom: relatedDOIError.length > 0 ? 2 : 0,
          }}
        >
          <Grid item xs>
            <TextField
              label={t('DOIGenerationForm.related_doi')}
              fullWidth
              error={relatedDOIError.length > 0}
              helperText={relatedDOIError.length > 0 ? relatedDOIError : ''}
              color="secondary"
              sx={{
                // this CSS makes it so that the helperText doesn't mess with the button alignment
                '& .MuiFormHelperText-root': {
                  position: 'absolute',
                  bottom: '-1.5rem',
                },
              }}
              InputProps={{
                sx: {
                  backgroundColor: 'background.default',
                },
              }}
              value={relatedDOI}
              onChange={(event) => {
                setRelatedDOI(event.target.value);
                setRelatedDOIError('');
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => {
                return checkDOI({ throwOnError: true })
                  .then((response) => {
                    // add DOI
                    if (response.data) {
                      changeRelatedDOIs((dois) => [...dois, response.data]);
                      setRelatedDOI('');
                    }
                  })
                  .catch(
                    (
                      error: AxiosError<{
                        errors: {
                          status: string;
                          title: string;
                        }[];
                      }>
                    ) => {
                      // TODO: check this is the right message from the API
                      setRelatedDOIError(
                        error.response?.data?.errors
                          ? error.response.data.errors[0].title
                          : 'Error'
                      );
                    }
                  );
              }}
            >
              {t('DOIGenerationForm.add_related_doi')}
            </Button>
          </Grid>
        </Grid>
        {relatedDOIs.length > 0 && (
          <Grid item>
            <Table
              sx={{
                backgroundColor: 'background.default',
              }}
              size="small"
              aria-labelledby="related-dois-label"
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t('DOIGenerationForm.related_doi_doi')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_doi_relationship')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_doi_resource_type')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_doi_action')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedDOIs.map((relatedItem) => (
                  <TableRow key={relatedItem.identifier}>
                    <TableCell>
                      <StyledTooltip describeChild title={relatedItem.title}>
                        <Link
                          href={`https://doi.org/${relatedItem.identifier}`}
                        >
                          {relatedItem.identifier}
                        </Link>
                      </StyledTooltip>
                    </TableCell>
                    <TableCell>
                      <FormControl
                        fullWidth
                        size="small"
                        required
                        sx={{ minWidth: 150 }}
                      >
                        <InputLabel
                          id={`${relatedItem.identifier}-relationship-select-label`}
                        >
                          {t('DOIGenerationForm.related_doi_relationship')}
                        </InputLabel>
                        <Select
                          labelId={`${relatedItem.identifier}-relationship-select-label`}
                          value={relatedItem.relationType}
                          label={t(
                            'DOIGenerationForm.related_doi_relationship'
                          )}
                          onChange={(event) => {
                            changeRelatedDOIs((dois) => {
                              return dois.map((d) => {
                                if (d.identifier === relatedItem.identifier) {
                                  return {
                                    ...d,
                                    relationType: event.target.value as
                                      | DOIRelationType
                                      | '',
                                  } satisfies RelatedDOI;
                                } else {
                                  return d;
                                }
                              });
                            });
                          }}
                        >
                          {Object.values(DOIRelationType).map((relation) => {
                            return (
                              <MenuItem key={relation} value={relation}>
                                {relation}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl
                        fullWidth
                        size="small"
                        required
                        sx={{ minWidth: 150 }}
                      >
                        <InputLabel
                          id={`${relatedItem.identifier}-resource-type-select-label`}
                        >
                          {t('DOIGenerationForm.related_doi_resource_type')}
                        </InputLabel>
                        <Select
                          labelId={`${relatedItem.identifier}-resource-type-select-label`}
                          value={relatedItem.relatedItemType}
                          label={t(
                            'DOIGenerationForm.related_doi_resource_type'
                          )}
                          onChange={(event) => {
                            changeRelatedDOIs((dois) => {
                              return dois.map((d) => {
                                if (d.identifier === relatedItem.identifier) {
                                  return {
                                    ...d,
                                    relatedItemType: event.target.value as
                                      | DOIResourceType
                                      | '',
                                  } satisfies RelatedDOI;
                                } else {
                                  return d;
                                }
                              });
                            });
                          }}
                        >
                          {Object.values(DOIResourceType).map((type) => {
                            return (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() =>
                          changeRelatedDOIs((dois) =>
                            dois.filter(
                              (d) => d.identifier !== relatedItem.identifier
                            )
                          )
                        }
                        color="secondary"
                      >
                        {t('DOIGenerationForm.delete_related_doi')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default RelatedDOIs;
