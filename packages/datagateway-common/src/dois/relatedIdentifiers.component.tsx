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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCheckDOI } from '../api/dois';
import {
  DOIIdentifierType,
  DOIRelationType,
  DOIResourceType,
  RelatedIdentifier,
} from '../app.types';
import { StyledTooltip } from '../arrowtooltip.component';

type RelatedIdentifiersProps = {
  relatedIdentifiers: RelatedIdentifier[];
  changeRelatedIdentifiers: React.Dispatch<
    React.SetStateAction<RelatedIdentifier[]>
  >;
  dataCiteUrl: string | undefined;
  disabled: boolean;
};

const RelatedIdentifiers: React.FC<RelatedIdentifiersProps> = (props) => {
  const {
    relatedIdentifiers,
    changeRelatedIdentifiers,
    dataCiteUrl,
    disabled,
  } = props;
  const [t] = useTranslation();
  const [relatedIdentiferInputText, setRelatedIdentifierInputText] =
    React.useState('');
  const [relatedIdentifierError, setRelatedIdentifierError] =
    React.useState('');
  const { refetch: checkDOI } = useCheckDOI(
    relatedIdentiferInputText,
    dataCiteUrl
  );

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
          <Typography
            variant="h6"
            component="h4"
            id="related-identifiers-label"
          >
            {t('DOIGenerationForm.related_identifiers')}
          </Typography>
        </Grid>
        <Grid
          container
          item
          spacing={1}
          alignItems="center"
          sx={{
            marginBottom: relatedIdentifierError.length > 0 ? 2 : 0,
          }}
        >
          <Grid item xs>
            <TextField
              label={t('DOIGenerationForm.related_identifier')}
              fullWidth
              error={relatedIdentifierError.length > 0}
              helperText={
                relatedIdentifierError.length > 0 ? relatedIdentifierError : ''
              }
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
              value={relatedIdentiferInputText}
              onChange={(event) => {
                setRelatedIdentifierInputText(event.target.value);
                setRelatedIdentifierError('');
              }}
              disabled={disabled}
            />
          </Grid>
          <Grid container item spacing={1} xs="auto">
            <Grid item>
              <Button
                variant="contained"
                disabled={disabled}
                onClick={() => {
                  return checkDOI({ throwOnError: true })
                    .then((response) => {
                      // add DOI
                      if (response.data) {
                        changeRelatedIdentifiers((dois) => [
                          ...dois,
                          response.data,
                        ]);
                        setRelatedIdentifierInputText('');
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
                        setRelatedIdentifierError(
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
            <Grid item>
              <Button
                variant="contained"
                disabled={disabled}
                onClick={() => {
                  changeRelatedIdentifiers((relatedIdentifiers) => [
                    ...relatedIdentifiers,
                    {
                      identifier: relatedIdentiferInputText,
                      relatedIdentifierType: DOIIdentifierType.URL, // default to URL
                      relationType: '',
                    },
                  ]);
                  setRelatedIdentifierInputText('');
                }}
              >
                {t('DOIGenerationForm.add_related_other')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {relatedIdentifiers.length > 0 && (
          <Grid item>
            <Table
              sx={{
                backgroundColor: 'background.default',
              }}
              size="small"
              aria-labelledby="related-identifiers-label"
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t('DOIGenerationForm.related_identifier_identifier')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_identifier_identifier_type')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_identifier_relationship')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_identifier_resource_type')}
                  </TableCell>
                  <TableCell>
                    {t('DOIGenerationForm.related_identifier_action')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedIdentifiers.map((relatedIdentifier) => (
                  <TableRow key={relatedIdentifier.identifier}>
                    <TableCell>
                      {relatedIdentifier.relatedIdentifierType ===
                      DOIIdentifierType.DOI ? (
                        <StyledTooltip
                          describeChild
                          title={relatedIdentifier.title}
                        >
                          <Link
                            href={`https://doi.org/${relatedIdentifier.identifier}`}
                          >
                            {relatedIdentifier.identifier}
                          </Link>
                        </StyledTooltip>
                      ) : relatedIdentifier.relatedIdentifierType ===
                        DOIIdentifierType.URL ? (
                        <Link href={relatedIdentifier.identifier}>
                          {relatedIdentifier.identifier}
                        </Link>
                      ) : (
                        <Typography>{relatedIdentifier.identifier}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {relatedIdentifier.relatedIdentifierType ===
                      DOIIdentifierType.DOI ? (
                        <Typography>{DOIIdentifierType.DOI}</Typography>
                      ) : (
                        <FormControl
                          fullWidth
                          size="small"
                          required
                          sx={{ minWidth: 150 }}
                          disabled={disabled}
                        >
                          <InputLabel
                            id={`${relatedIdentifier.identifier.replaceAll(
                              ' ',
                              '-'
                            )}-identifier-type-select-label`}
                          >
                            {t(
                              'DOIGenerationForm.related_identifier_identifier_type'
                            )}
                          </InputLabel>
                          <Select
                            labelId={`${relatedIdentifier.identifier.replaceAll(
                              ' ',
                              '-'
                            )}-identifier-type-select-label`}
                            value={relatedIdentifier.relatedIdentifierType}
                            label={t(
                              'DOIGenerationForm.related_identifier_identifier_type'
                            )}
                            onChange={(event) => {
                              changeRelatedIdentifiers((dois) => {
                                return dois.map((d) => {
                                  if (
                                    d.identifier ===
                                    relatedIdentifier.identifier
                                  ) {
                                    return {
                                      ...d,
                                      relatedIdentifierType: event.target
                                        .value as DOIIdentifierType,
                                    } satisfies RelatedIdentifier;
                                  } else {
                                    return d;
                                  }
                                });
                              });
                            }}
                          >
                            {Object.values(DOIIdentifierType)
                              .filter(
                                (identifierType) =>
                                  identifierType !== DOIIdentifierType.DOI
                              )
                              .map((identifierType) => {
                                return (
                                  <MenuItem
                                    key={identifierType}
                                    value={identifierType}
                                  >
                                    {identifierType}
                                  </MenuItem>
                                );
                              })}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl
                        fullWidth
                        size="small"
                        required
                        sx={{ minWidth: 150 }}
                        disabled={disabled}
                      >
                        <InputLabel
                          id={`${relatedIdentifier.identifier.replaceAll(
                            ' ',
                            '-'
                          )}-relationship-select-label`}
                        >
                          {t(
                            'DOIGenerationForm.related_identifier_relationship'
                          )}
                        </InputLabel>
                        <Select
                          labelId={`${relatedIdentifier.identifier.replaceAll(
                            ' ',
                            '-'
                          )}-relationship-select-label`}
                          value={relatedIdentifier.relationType}
                          label={t(
                            'DOIGenerationForm.related_identifier_relationship'
                          )}
                          onChange={(event) => {
                            changeRelatedIdentifiers((dois) => {
                              return dois.map((d) => {
                                if (
                                  d.identifier === relatedIdentifier.identifier
                                ) {
                                  return {
                                    ...d,
                                    relationType: event.target.value as
                                      | DOIRelationType
                                      | '',
                                  } satisfies RelatedIdentifier;
                                } else {
                                  return d;
                                }
                              });
                            });
                          }}
                        >
                          {Object.values(DOIRelationType)
                            .filter(
                              (relation) =>
                                !relation.includes('Version') &&
                                !relation.includes('Part')
                            )
                            .map((relation) => {
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
                        disabled={disabled}
                      >
                        <InputLabel
                          id={`${relatedIdentifier.identifier.replaceAll(
                            ' ',
                            '-'
                          )}-resource-type-select-label`}
                        >
                          {t(
                            'DOIGenerationForm.related_identifier_resource_type'
                          )}
                        </InputLabel>
                        <Select
                          labelId={`${relatedIdentifier.identifier.replaceAll(
                            ' ',
                            '-'
                          )}-resource-type-select-label`}
                          value={relatedIdentifier.relatedItemType ?? ''}
                          label={t(
                            'DOIGenerationForm.related_identifier_resource_type'
                          )}
                          onChange={(event) => {
                            changeRelatedIdentifiers((dois) => {
                              return dois.map((d) => {
                                if (
                                  d.identifier === relatedIdentifier.identifier
                                ) {
                                  return {
                                    ...d,
                                    relatedItemType:
                                      event.target.value !== ''
                                        ? (event.target
                                            .value as DOIResourceType)
                                        : undefined,
                                  } satisfies RelatedIdentifier;
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
                          changeRelatedIdentifiers((dois) =>
                            dois.filter(
                              (d) =>
                                d.identifier !== relatedIdentifier.identifier
                            )
                          )
                        }
                        color="secondary"
                        disabled={disabled}
                      >
                        {t('DOIGenerationForm.delete_related_identifier')}
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

export default RelatedIdentifiers;
