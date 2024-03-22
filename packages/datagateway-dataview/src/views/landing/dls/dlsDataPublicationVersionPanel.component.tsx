import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import { DOIRelationType, useDataPublication } from 'datagateway-common';
import { StyledDOI } from './dlsDataPublicationLanding.component';
import { useTranslation } from 'react-i18next';

type DLSDataPublicationVersionPanelProps = { dataPublicationId: string };

const DLSDataPublicationVersionPanel: React.FC<
  DLSDataPublicationVersionPanelProps
> = (props) => {
  const { dataPublicationId } = props;

  const [t] = useTranslation();
  const { data } = useDataPublication(parseInt(dataPublicationId));

  const isVersionDOI = data?.relatedItems?.some(
    (relatedItem) => relatedItem.relationType === DOIRelationType.IsVersionOf
  );

  return (
    <Accordion defaultExpanded disableGutters elevation={0}>
      <AccordionSummary sx={{ p: 0 }} expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">
          {isVersionDOI
            ? t('datapublications.details.concept_panel_label')
            : t('datapublications.details.version_panel_label')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Grid container direction="column" spacing={1}>
          {data?.relatedItems
            ?.filter((relatedItem) =>
              isVersionDOI
                ? relatedItem.relationType === DOIRelationType.IsVersionOf
                : relatedItem.relationType === DOIRelationType.HasVersion
            )
            .map((relatedItem) => (
              <Grid item key={relatedItem.id}>
                <StyledDOI doi={relatedItem.identifier} />
              </Grid>
            ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DLSDataPublicationVersionPanel;
