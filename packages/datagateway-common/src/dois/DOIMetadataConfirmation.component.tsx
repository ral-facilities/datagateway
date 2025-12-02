import { ArrowBack, Publish } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress, Grid, Link, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DOIContributor,
  DOICreator,
  DOIIdentifierType,
  DataciteMetadata,
} from '../app.types';

type DOIMetadataConfirmationProps = {
  draftMetadata: DataciteMetadata | undefined;
  deleteLoading: boolean;
  publishLoading: boolean;
  onConfirmClick: () => void;
  onBackClick: () => void;
};

const CreatorsAndContributorsMetadata: React.FC<{
  users: DOICreator[] | DOIContributor[];
}> = (props) => {
  const [t] = useTranslation();
  return (
    <>
      {props.users.map((user) => {
        return (
          <Grid container item key={user.name} columnSpacing={1} ml={1}>
            <Grid item>
              <Typography>
                {t('DOIGenerationForm.creator_name')}: {user.name}
              </Typography>
            </Grid>
            {user.affiliations && (
              <Grid container item>
                {user.affiliations.map((affiliation) => (
                  <Grid item key={affiliation.affiliation}>
                    <Typography>
                      {t('DOIGenerationForm.creator_affiliation')}:{' '}
                      {affiliation.affiliation}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
            {'contributorType' in user && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.creator_type')}: {user.contributorType}
                </Typography>
              </Grid>
            )}
            {user.nameIdentifiers && (
              <Grid container item>
                {user.nameIdentifiers.map((nameIdentifier) => (
                  <Grid item key={nameIdentifier.nameIdentifier}>
                    <Typography>
                      {nameIdentifier.nameIdentifierScheme}:{' '}
                      {nameIdentifier.nameIdentifier.startsWith('http') ? (
                        <Link href={nameIdentifier.nameIdentifier}>
                          {nameIdentifier.nameIdentifier}
                        </Link>
                      ) : (
                        nameIdentifier.nameIdentifier
                      )}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        );
      })}
    </>
  );
};

const DOIMetadataConfirmation: React.FC<DOIMetadataConfirmationProps> = (
  props
) => {
  const { draftMetadata: metadata, onConfirmClick, onBackClick } = props;
  const [t] = useTranslation();

  if (typeof metadata === 'undefined') return <CircularProgress />;

  return (
    <>
      <Typography variant="h6" component="h3">
        {t('DOIGenerationForm.review_metadata')}
      </Typography>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.title')}: {metadata.titles?.[0]?.title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.description')}:{' '}
            {metadata.descriptions?.[0]?.description}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>
              {t('DOIGenerationForm.related_identifiers')}
            </Typography>
          </Grid>
          {metadata.relatedIdentifiers.map((relatedIdentifier) => {
            return (
              <Grid
                container
                item
                key={relatedIdentifier.relatedIdentifier}
                columnSpacing={1}
                ml={1}
              >
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_identifier_identifier')}:{' '}
                    {relatedIdentifier.relatedIdentifierType ===
                    DOIIdentifierType.DOI ? (
                      <Link
                        href={`https://doi.org/${relatedIdentifier.relatedIdentifier}`}
                      >
                        {relatedIdentifier.relatedIdentifier}
                      </Link>
                    ) : relatedIdentifier.relatedIdentifierType ===
                      DOIIdentifierType.URL ? (
                      <Link href={relatedIdentifier.relatedIdentifier}>
                        {relatedIdentifier.relatedIdentifier}
                      </Link>
                    ) : (
                      relatedIdentifier.relatedIdentifier
                    )}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_identifier_type')}:{' '}
                    {relatedIdentifier.relatedIdentifierType}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_identifier_relationship')}:{' '}
                    {relatedIdentifier.relationType}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_identifier_resource_type')}:{' '}
                    {relatedIdentifier.resourceTypeGeneral}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.creators')}</Typography>
          </Grid>
          <CreatorsAndContributorsMetadata users={metadata.creators} />
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.contributors')}</Typography>
          </Grid>
          <CreatorsAndContributorsMetadata users={metadata.contributors} />
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.publisher')}</Typography>
          </Grid>
          <Grid container item direction="column" ml={1}>
            <Grid item>
              <Typography>
                {t('DOIGenerationForm.publisher')}: {metadata.publisher.name}
              </Typography>
            </Grid>
            {metadata.publisher.publisherIdentifier && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherIdentifier')}:{' '}
                  {metadata.publisher.publisherIdentifier}
                </Typography>
              </Grid>
            )}
            {metadata.publisher.publisherIdentifierScheme && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherIdentifierScheme')}:{' '}
                  {metadata.publisher.publisherIdentifierScheme}
                </Typography>
              </Grid>
            )}
            {metadata.publisher.schemeUri && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherSchemeURI')}:{' '}
                  <Link href={metadata.publisher.schemeUri}>
                    {metadata.publisher.schemeUri}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.publicationYear')}: {metadata.publicationYear}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.dates')}</Typography>
          </Grid>
          {metadata.dates.map((date) => {
            return (
              <Grid container item key={date.date} columnSpacing={1} ml={1}>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.date')}: {date.date}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.dateType')}: {date.dateType}
                  </Typography>
                </Grid>
                {date.dateInformation && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.dateInformation')}:{' '}
                      {date.dateInformation}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.resourceType')}: {metadata.types.resourceType}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.resourceTypeGeneral')}:{' '}
            {metadata.types.resourceTypeGeneral}
          </Typography>
        </Grid>
        {metadata.language && (
          <Grid item>
            <Typography>
              {t('DOIGenerationForm.language')}: {metadata.language}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.size')}: {metadata.sizes?.[0]}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.rights')}</Typography>
          </Grid>
          {metadata.rightsList.map((rights) => {
            return (
              <Grid
                container
                item
                key={rights.rights}
                direction="column"
                ml={1}
              >
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.rights')}: {rights.rights}
                  </Typography>
                </Grid>
                {rights.rightsUri && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.rightsURI')}:{' '}
                      <Link href={rights.rightsUri}>{rights.rightsUri}</Link>
                    </Typography>
                  </Grid>
                )}
                {rights.rightsIdentifier && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.rightsIdentifier')}:{' '}
                      {rights.rightsIdentifier}
                    </Typography>
                  </Grid>
                )}
                {rights.rightsIdentifierScheme && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.rightsIdentifierScheme')}:{' '}
                      {rights.rightsIdentifierScheme}
                    </Typography>
                  </Grid>
                )}
                {rights.schemeUri && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.rightsSchemeURI')}:{' '}
                      <Link href={rights.schemeUri}>{rights.schemeUri}</Link>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.geoLocations')}</Typography>
          </Grid>
          {metadata.geoLocations.map((geoLocation, index) => {
            const latitude = geoLocation.geoLocationPoint?.pointLatitude;
            const longitude = geoLocation.geoLocationPoint?.pointLongitude;
            return (
              <Grid container item key={index} columnSpacing={1} ml={1}>
                {geoLocation.geoLocationPlace && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.geoLocationPlace')}:{' '}
                      {geoLocation.geoLocationPlace}
                    </Typography>
                  </Grid>
                )}
                {latitude && longitude && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.geoLocationPoint')}: {latitude},{' '}
                      {longitude}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.fundingReferences')}</Typography>
          </Grid>
          {metadata.fundingReferences.map((funder, index) => {
            return (
              <Grid container item key={index} direction="column" ml={1}>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.funderName')}: {funder.funderName}
                  </Typography>
                </Grid>
                {funder.funderIdentifier && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.funderIdentifier')}:{' '}
                      {funder.funderIdentifier}
                    </Typography>
                  </Grid>
                )}
                {funder.funderIdentifierType && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.funderIdentifierType')}:{' '}
                      {funder.funderIdentifierType}
                    </Typography>
                  </Grid>
                )}
                {funder.schemeUri && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.funderSchemeURI')}:{' '}
                      <Link href={funder.schemeUri}>{funder.schemeUri}</Link>
                    </Typography>
                  </Grid>
                )}
                {funder.awardUri && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.awardURI')}:{' '}
                      <Link href={funder.awardUri}>{funder.awardUri}</Link>
                    </Typography>
                  </Grid>
                )}
                {funder.awardTitle && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.awardTitle')}: {funder.awardTitle}
                    </Typography>
                  </Grid>
                )}
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.awardNumber')}: {funder.awardNumber}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <LoadingButton
            variant="contained"
            onClick={onBackClick}
            startIcon={<ArrowBack />}
            loadingPosition="start"
            loading={props.deleteLoading}
            disabled={props.publishLoading}
          >
            {t('DOIGenerationForm.back_button')}
          </LoadingButton>
        </Grid>
        <Grid item>
          <LoadingButton
            variant="contained"
            onClick={onConfirmClick}
            startIcon={<Publish />}
            loadingPosition="start"
            loading={props.publishLoading}
            disabled={props.deleteLoading}
          >
            {t('DOIGenerationForm.generate_DOI')}
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  );
};

export default DOIMetadataConfirmation;
