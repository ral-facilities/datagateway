import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import {
  DOIRelationType,
  RelatedItem,
  useDataPublication,
} from 'datagateway-common';
import { StyledDOI } from './dlsDataPublicationLanding.component';
import { useTranslation } from 'react-i18next';

type DLSDataPublicationVersionPanelProps = { dataPublicationId: string };

// sorts by create time descending i.e. newer is at the start of the array
export const sortVersions = (a: RelatedItem, b: RelatedItem): number => {
  const aDate = new Date(a.createTime);
  const bDate = new Date(b.createTime);
  if (aDate < bDate) return 1;
  if (aDate > bDate) return -1;
  return 0;
};

const DLSDataPublicationVersionPanel: React.FC<
  DLSDataPublicationVersionPanelProps
> = (props) => {
  const { dataPublicationId } = props;

  const [t] = useTranslation();
  const { data } = useDataPublication(parseInt(dataPublicationId));

  return (
    <Accordion defaultExpanded disableGutters elevation={0}>
      <AccordionSummary sx={{ p: 0 }} expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">
          {t('datapublications.details.version_panel_label')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Grid container direction="column" spacing={1}>
          {data?.relatedItems
            ?.filter(
              (relatedItem) =>
                relatedItem.relationType === DOIRelationType.HasVersion
            )
            .sort(sortVersions)
            .map((relatedItem) => (
              <Grid container item key={relatedItem.id} spacing={1}>
                <Grid item xs="auto">
                  <Typography>
                    {relatedItem.createTime.split(' ')[0]}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <StyledDOI doi={relatedItem.identifier} />
                </Grid>
              </Grid>
            ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DLSDataPublicationVersionPanel;
