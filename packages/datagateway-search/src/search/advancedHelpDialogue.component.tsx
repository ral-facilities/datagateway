import React from 'react';
import {
  styled,
  Theme,
  Link,
  Paper,
  Typography,
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

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
            {t('advanced_search_help.terms.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.terms.description">
              By default, all words in the search text are treated as separate{' '}
              <strong>terms</strong>. Results must contain at least one{' '}
              <strong>term</strong> to be returned, and they can occur in any
              order in the result. When using the default relevancy based
              sorting, results containing the most <strong>terms</strong> will
              appear first. For example,{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.terms.link1')}
                onClick={handleClose}
              >
                neutron scattering
              </Link>{' '}
              will return results containing both <strong>terms</strong>
              first, then results containing only one or the other.
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.phrases.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.phrases.description">
              Use quotation marks around a multiple <strong>terms</strong> to
              create a <strong>phrase</strong>. Results must contain the entire
              <strong>phrase</strong>, with the words in order. For example,
              <Link
                component={RouterLink}
                to={t('advanced_search_help.phrases.link1')}
                onClick={handleClose}
              >
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
              <strong>OR</strong> is the default behaviour for multiple{' '}
              <strong>terms</strong>:{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link1')}
                onClick={handleClose}
              >
                neutron OR scattering
              </Link>{' '}
              is equivalent to{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link2')}
                onClick={handleClose}
              >
                neutron scattering
              </Link>
              . <br /> <br /> <strong>AND</strong> requires both{' '}
              <strong>terms</strong> on either side of the keyword must be
              present in the result:{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link3')}
                onClick={handleClose}
              >
                neutron AND scattering
              </Link>
              . <br /> <br /> <strong>+</strong> requires the next{' '}
              <strong>term</strong> be present in the result:{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link4')}
                onClick={handleClose}
              >
                +neutron +scattering
              </Link>
              . <br /> <br /> <strong>NOT</strong> or <strong>-</strong>{' '}
              requires the next <strong>term</strong> not be present in the
              result:{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link5')}
                onClick={handleClose}
              >
                -neutron NOT scattering
              </Link>
              .
              <br /> <br /> Finally, brackets can be used to build complicated
              logic:{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.logic_operators.link6')}
                onClick={handleClose}
              >
                (+neutron -photon) AND (scattering OR diffraction)
              </Link>
              .
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.synonyms.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.synonyms.description">
              Results do not need to have the exact <strong>term</strong>{' '}
              searched for in order to match. If the root word is the same, then
              the results should appear.{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link1')}
                onClick={handleClose}
              >
                Scattering
              </Link>
              ,{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link2')}
                onClick={handleClose}
              >
                scattered
              </Link>
              ,{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link3')}
                onClick={handleClose}
              >
                scatters
              </Link>{' '}
              etc. are all treated as if the user searched for{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link4')}
                onClick={handleClose}
              >
                scatter
              </Link>
              . Additionally, some common scientific terminology has additional
              support. Chemical symbols, amino acid codes and the PaNET ontology
              of techniques are all supported, so that searching for{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link5')}
                onClick={handleClose}
              >
                xas li
              </Link>{' '}
              is equivalent to searching for{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.synonyms.link6')}
                onClick={handleClose}
              >
                x-ray absorption spectroscopy lithium
              </Link>
              .
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.wildcards.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.wildcards.description">
              To take the place of one character, use <strong>?</strong>. To
              represent any number (0 or more) characters, use{' '}
              <strong>*</strong>. For example,{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.wildcards.link1')}
                onClick={handleClose}
              >
                te?t
              </Link>{' '}
              would return results containing test or text, and{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.wildcards.link2')}
                onClick={handleClose}
              >
                te*t
              </Link>{' '}
              would also return testament.
              <br /> <br /> Note that the use of wildcards can prevent the
              synonym functionality described above.{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.wildcards.link3')}
                onClick={handleClose}
              >
                scatterin?
              </Link>{' '}
              will not result in matches, as we match against the root word
              which is scatter.{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.wildcards.link4')}
                onClick={handleClose}
              >
                scatter*
              </Link>{' '}
              however would work. Furthermore, use of wildcards (especially
              leading wildcards) can take longer than an otherwise identical
              search, so they should be used sparingly.
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.special_characters.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans
              t={t}
              i18nKey="advanced_search_help.special_characters.description"
            >
              In addition to whitespace, there are other characters used to
              split <strong>terms</strong> based on context. A{' '}
              <strong>.</strong> character is treated as a separator only when
              between a mixture of letters and numbers, but is preserved when
              in-between two letters or two numbers. <strong>-</strong> is
              always treated as a separator. This can make searching for file
              extension difficult, as a searching for{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.special_characters.link1')}
                onClick={handleClose}
              >
                1234.dat
              </Link>{' '}
              will match any result containing the <strong>term</strong> 1234 or
              dat, but not for example abcd.dat as that is treated as one single{' '}
              <strong>term</strong>.
              <br /> <br /> When building a <strong>phrase</strong>, special
              characters in the <strong>phrase</strong> will not perform their
              special function and instead are treated as white space. This can
              be a useful way of effectively ignoring slashes in a file path,
              but will also prevent wildcards from working.
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <StyledPaper>
          <DialogueHeading>
            {t('advanced_search_help.fields.title')}
          </DialogueHeading>
          <DialogueContent>
            <Trans t={t} i18nKey="advanced_search_help.fields.description">
              By default, <strong>terms</strong> are applied to several{' '}
              <strong>fields</strong> of the metadata. However more specific
              searches are possible based on the list of supported{' '}
              <strong>fields</strong> below (note that not all{' '}
              <strong>fields</strong> will always have a value and the{' '}
              <strong>fields</strong> differ between entities). For example, to
              find results that mention calibration in their summary but not
              their title, search for{' '}
              <Link
                component={RouterLink}
                to={t('advanced_search_help.fields.link1')}
                onClick={handleClose}
              >
                summary:calibration -title:calibration
              </Link>
              <br /> <br /> <strong>Investigation</strong>
              <ul>
                <li>title</li>
                <li>summary</li>
                <li>name</li>
                <li>type.name</li>
                <li>visitId</li>
                <li>facility.name</li>
                <li>doi </li>
              </ul>
              <strong>Dataset</strong>
              <ul>
                <li>name</li>
                <li>description</li>
                <li>type.name</li>
                <li>visitId</li>
                <li>sample.name</li>
                <li>sample.type.name</li>
                <li>doi </li>
              </ul>
              <strong>Datafile</strong>
              <ul>
                <li>name</li>
                <li>description</li>
                <li>location</li>
                <li>datafileFormat.name</li>
                <li>visitId</li>
                <li>sample.name</li>
                <li>sample.type.name</li>
                <li>doi </li>
              </ul>
            </Trans>
          </DialogueContent>
        </StyledPaper>
        <DialogueContentTypography gutterBottom>
          <Trans t={t} i18nKey="advanced_search_help.footer">
            Further information on searching can be found{' '}
            <Link
              target="_blank"
              rel="noopener"
              href="https://lucene.apache.org/core/8_6_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description"
            >
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
