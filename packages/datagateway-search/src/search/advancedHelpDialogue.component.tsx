import React from 'react';
import { styled, Theme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Link, Paper } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundColor: (theme as any).colours?.paper,
}));

const DialogueContentTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const DialogueContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const DialogueHeading = styled(MuiDialogTitle)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const AdvancedHelpDialogue = (): React.ReactElement => {
  const [open, setOpen] = React.useState(false);
  const [t] = useTranslation();

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      See all{' '}
      <Link
        component="button"
        sx={{
          fontSize: '14px',
          fontWeight: 'bold',
          verticalAlign: 'baseline',
        }}
        aria-label={t('advanced_search_help.search_options_arialabel')}
        onClick={handleClickOpen}
      >
        search options
      </Link>
      .
      <Dialog
        onClose={handleClose}
        aria-labelledby="advanced-search-dialog-title"
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: (theme: Theme) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (theme as any).colours?.background,
          },
        }}
      >
        <DialogueHeading id="advanced-search-dialog-title">
          Advanced Search Tips
          <IconButton
            aria-label={t('advanced_search_help.close_button_arialabel')}
            sx={{
              position: 'absolute',
              right: 1,
              top: 1,
              color: 'grey[500]',
            }}
            onClick={handleClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogueHeading>
        <DialogueContentTypography gutterBottom>
          {t('advanced_search_help.description')}
        </DialogueContentTypography>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.exact_phrase.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans
              t={t}
              i18nKey="advanced_search_help.exact_phrase.description"
            >
              Use quotation marks around a phrase to search for a precise
              sequence of words e.g.{' '}
              <Link href={t('advanced_search_help.exact_phrase.link1')}>
                &quot;neutron scattering&quot;
              </Link>
              .
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.logic_operators.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans
              t={t}
              i18nKey="advanced_search_help.logic_operators.description"
            >
              Find all data containing &#39;neutron&#39; and
              &#39;scattering&#39; with &#39;
              <Link
                data-testid="advanced-help-link"
                href={t('advanced_search_help.logic_operators.link1')}
              >
                neutron AND scattering
              </Link>
              &#39;. Find all data containing either neutron or scattering with
              &#39;{' '}
              <Link href={t('advanced_search_help.logic_operators.link2')}>
                neutron OR scattering
              </Link>
              &#39;. Find all data that contains the phrase &#39;scattering&#39;
              but exclude those containing &#39;elastic&#39; with &#39;{' '}
              <Link href={t('advanced_search_help.logic_operators.link3')}>
                scattering NOT elastic
              </Link>
              &#39;. Use brackets around phrases to construct more complicated
              searches e.g. &#39;{' '}
              <Link href={t('advanced_search_help.logic_operators.link4')}>
                scattering NOT (elastic OR neutron)
              </Link>
              &#39;.
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.wildcards.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.wildcards.description">
              Use wildcards to take the place of one or more characters in a
              phrase. A question mark &#39;?&#39; can be used to search for a
              phrase with one or more character missing e.g. &#39;{' '}
              <Link href={t('advanced_search_help.wildcards.link1')}>te?t</Link>
              &#39; will return results containing &#39;test&#39; or
              &#39;text&#39;. An asterix &#39;*&#39; can be used to replace zero
              or more characters e.g. &#39;
              <Link href={t('advanced_search_help.wildcards.link2')}>*ium</Link>
              &#39; will return results containing words like &#39;sodium&#39;
              and &#39;vanadium&#39;.
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.limited_search_results.title')}
          </DialogueHeading>
          <DialogueContent>
            {t('advanced_search_help.limited_search_results.description', {
              maxNumResults,
            })}
          </DialogueContent>
        </StyledPaper>
        <DialogueContentTypography gutterBottom>
          <Trans t={t} i18nKey="advanced_search_help.footer">
            Further information on searching can be found{' '}
            <Link href="https://lucene.apache.org/core/4_10_2/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description">
              here
            </Link>
            .
          </Trans>
        </DialogueContentTypography>
      </Dialog>
    </React.Fragment>
  );
};

export default AdvancedHelpDialogue;
