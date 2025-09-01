import { ArrowBack, Check } from '@mui/icons-material';
import { Button, CircularProgress, Grid, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStaticDataciteMetadata } from '../api/dois';
import { ContributorType, RelatedDOI } from '../app.types';
import { ContributorUser } from './creatorsAndContributors.component';

type DOIMetadataConfirmationProps = {
  title: string;
  description: string;
  selectedUsers: ContributorUser[];
  relatedDOIs: RelatedDOI[];
  onConfirmClick: () => void;
  onBackClick: () => void;
  doiMinterUrl: string | undefined; // this is because since it loads from settings it is technically undefined at some point
};

const CreatorsAndContributorsMetadata: React.FC<{
  users: ContributorUser[];
}> = (props) => {
  const [t] = useTranslation();
  return (
    <>
      {props.users.map((user) => {
        return (
          <Grid container item key={user.id} columnSpacing={1} ml={1}>
            <Grid item>
              <Typography>
                {t('DOIGenerationForm.creator_name')}: {user.fullName}
              </Typography>
            </Grid>
            {user.affiliation && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.creator_affiliation')}:{' '}
                  {user.affiliation}
                </Typography>
              </Grid>
            )}
            {user.email && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.creator_email')}: {user.email}
                </Typography>
              </Grid>
            )}
            {user.contributor_type !== ContributorType.Creator &&
              user.contributor_type !== ContributorType.Minter && (
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.creator_type')}:{' '}
                    {user.contributor_type}
                  </Typography>
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
  const {
    title,
    description,
    selectedUsers,
    relatedDOIs,
    onConfirmClick,
    onBackClick,
    doiMinterUrl,
  } = props;
  const { data: staticMetadata } = useStaticDataciteMetadata(doiMinterUrl);
  const [t] = useTranslation();

  if (typeof staticMetadata === 'undefined') return <CircularProgress />;

  return (
    <>
      <Typography variant="h6" component="h3">
        {t('DOIGenerationForm.review_metadata')}
      </Typography>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.title')}: {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.description')}: {description}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.related_dois')}</Typography>
          </Grid>
          {relatedDOIs.map((relatedDOI) => {
            return (
              <Grid
                container
                item
                key={relatedDOI.identifier}
                columnSpacing={1}
                ml={1}
              >
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_doi_doi')}:{' '}
                    {relatedDOI.identifier}
                  </Typography>
                </Grid>
                {title && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.title')}: {relatedDOI.title}
                    </Typography>
                  </Grid>
                )}
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_doi_relationship')}:{' '}
                    {relatedDOI.relationType}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    {t('DOIGenerationForm.related_doi_resource_type')}:{' '}
                    {relatedDOI.relatedItemType}
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
          <CreatorsAndContributorsMetadata
            users={selectedUsers.filter(
              (user) =>
                user.contributor_type === ContributorType.Creator ||
                user.contributor_type === ContributorType.Minter
            )}
          />
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.contributors')}</Typography>
          </Grid>
          <CreatorsAndContributorsMetadata
            users={selectedUsers.filter(
              (user) =>
                user.contributor_type !== ContributorType.Creator &&
                user.contributor_type !== ContributorType.Minter
            )}
          />
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.publisher')}</Typography>
          </Grid>
          <Grid container item direction="column" ml={1}>
            <Grid item>
              <Typography>
                {t('DOIGenerationForm.publisher')}:{' '}
                {staticMetadata?.publisher.name}
              </Typography>
            </Grid>
            {staticMetadata?.publisher.publisherIdentifier && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherIdentifier')}:{' '}
                  {staticMetadata?.publisher.publisherIdentifier}
                </Typography>
              </Grid>
            )}
            {staticMetadata?.publisher.publisherIdentifierScheme && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherIdentifierScheme')}:{' '}
                  {staticMetadata?.publisher.publisherIdentifierScheme}
                </Typography>
              </Grid>
            )}
            {staticMetadata?.publisher.schemeURI && (
              <Grid item>
                <Typography>
                  {t('DOIGenerationForm.publisherSchemeURI')}:{' '}
                  {staticMetadata?.publisher.schemeURI}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.publicationYear')}:{' '}
            {staticMetadata?.publicationYear}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.dates')}</Typography>
          </Grid>
          {staticMetadata?.dates.map((date) => {
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
            {t('DOIGenerationForm.resourceType')}:{' '}
            {staticMetadata?.types.resourceType}
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            {t('DOIGenerationForm.resourceTypeGeneral')}:{' '}
            {staticMetadata?.types.resourceTypeGeneral}
          </Typography>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography>{t('DOIGenerationForm.rights')}</Typography>
          </Grid>
          {staticMetadata?.rightsList.map((rights) => {
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
                      {t('DOIGenerationForm.rightsURI')}: {rights.rightsUri}
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
                      {rights.schemeUri}
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
          {staticMetadata?.geoLocations.map((geoLocation, index) => {
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
          {staticMetadata?.fundingReferences.map((funder, index) => {
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
                      {funder.schemeUri}
                    </Typography>
                  </Grid>
                )}
                {funder.awardUri && (
                  <Grid item>
                    <Typography>
                      {t('DOIGenerationForm.awardURI')}: {funder.awardUri}
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
          <Button
            variant="contained"
            onClick={onBackClick}
            startIcon={<ArrowBack />}
          >
            {t('DOIGenerationForm.back_button')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={onConfirmClick}
            startIcon={<Check />}
          >
            {t('DOIGenerationForm.generate_DOI')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default DOIMetadataConfirmation;
