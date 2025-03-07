import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  styled,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Theme,
  Typography,
  TableContainer,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

const Section = styled('section')(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const SectionTitle = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => (
  <Typography variant="h5" gutterBottom>
    {children}
  </Typography>
);

const SectionText = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => (
  <Typography gutterBottom component="div">
    {children}
  </Typography>
);

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
      <Trans t={t} i18nKey="advanced_search_help.search_help_label">
        See all{' '}
        <Link
          component="button"
          sx={{
            fontSize: '14px',
            fontWeight: 'bold',
            verticalAlign: 'baseline',
          }}
          data-testid="advanced-search-help-link"
          onClick={handleClickOpen}
        >
          search options
        </Link>
        .
      </Trans>
      <Dialog
        onClose={handleClose}
        aria-labelledby="advanced-search-dialog-title"
        open={open}
        sx={{ padding: 2 }}
        PaperProps={{
          sx: {
            backgroundColor: (theme: Theme) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (theme as any).colours?.background,
          },
        }}
      >
        <DialogTitle id="advanced-search-dialog-title">
          {t('advanced_search_help.title')}
          <IconButton
            aria-label={t('advanced_search_help.close_button_arialabel')}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey[500]',
            }}
            onClick={handleClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {t('advanced_search_help.description')}
          </Typography>
          {Array.isArray(
            t('advanced_search_help.examples.examples', {
              returnObjects: true,
            })
          ) &&
            (
              t('advanced_search_help.examples.examples', {
                returnObjects: true,
              }) as { name: string; value: string }[]
            ).length > 0 && (
              <Section>
                <SectionTitle>
                  {t('advanced_search_help.examples.title')}
                </SectionTitle>
                <SectionText>
                  <Trans
                    t={t}
                    i18nKey="advanced_search_help.examples.description"
                  >
                    Below are a few examples of common searches and how they can
                    be crafted to execute efficiently for those with access to
                    large volumes of data:
                  </Trans>
                </SectionText>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      {(
                        t('advanced_search_help.examples.examples', {
                          returnObjects: true,
                        }) as { name: string; value: string }[]
                      ).map(({ name, value }, index) => (
                        <TableRow key={index}>
                          <TableCell>{name}</TableCell>
                          <TableCell>
                            <Link
                              component={RouterLink}
                              to={`?searchText=${value}`}
                              onClick={handleClose}
                            >
                              {value}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Section>
            )}
          <Section>
            <SectionTitle>{t('advanced_search_help.terms.title')}</SectionTitle>
            <SectionText>
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
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.phrases.title')}
            </SectionTitle>
            <SectionText>
              <Trans t={t} i18nKey="advanced_search_help.phrases.description">
                Use quotation marks around a multiple <strong>terms</strong> to
                create a <strong>phrase</strong>. Results must contain the
                entire
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
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.logic_operators.title')}
            </SectionTitle>
            <SectionText>
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
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.synonyms.title')}
            </SectionTitle>
            <SectionText>
              <Trans t={t} i18nKey="advanced_search_help.synonyms.description">
                Results do not need to have the exact <strong>term</strong>{' '}
                searched for in order to match. If the root word is the same,
                then the results should appear.{' '}
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
                . Additionally, some common scientific terminology has
                additional support. Chemical symbols, amino acid codes and the
                PaNET ontology of techniques are all supported, so that
                searching for{' '}
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
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.wildcards.title')}
            </SectionTitle>
            <SectionText>
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
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.special_characters.title')}
            </SectionTitle>
            <SectionText>
              <Trans
                t={t}
                i18nKey="advanced_search_help.special_characters.description"
              >
                In addition to whitespace, there are other characters used to
                split <strong>terms</strong> based on context. A{' '}
                <strong>.</strong>
                character is treated as a separator only when between a mixture
                of letters and numbers, but is preserved when in-between two
                letters or two numbers. <strong>-</strong> is always treated as
                a separator, and <strong>_</strong> is not treated as a
                separator. Separators cannot be used in the same term as a
                wildcard, as wildcard queries will not be able to match across
                terms. For example, a*f will not match abc-def because two
                comparisons are against abc and def, and neither match.
                <br /> <br /> When building a <strong>phrase</strong> using
                quotes, other special characters in the <strong>phrase</strong>{' '}
                will not perform their special function and instead are treated
                as white space.
              </Trans>
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.file_paths.title')}
            </SectionTitle>
            <SectionText>
              <Trans
                t={t}
                i18nKey="advanced_search_help.file_paths.description"
              >
                The fact that file paths often contain slashes separating
                directories, dashes within directory names, and dots before
                extensions can make searching challenging, especially in
                combination with wildcards. As paths and the intended use case
                differ, a one size fits all approach is not possible, but there
                are some techniques that can be used.
                <br /> <br />
                When searching for an exact match for full or partial path
                without wildcards, field targeting (see below) and quoting will
                give the most efficient query. This will escape all slashes and
                other separators, but also ensure that you only get results
                containing all terms, i.e. every directory specified in order.
                For example,{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link1')}
                  onClick={handleClose}
                >
                  location:&quot;path/to/directory&quot;
                </Link>
                .<br /> <br /> To use wildcards in combination with other
                separators, manually replace the latter with whitespace and
                consider if AND/OR logic should be used, so instead of a??-def,{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link2')}
                  onClick={handleClose}
                >
                  +a?? +def
                </Link>{' '}
                or{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link3')}
                  onClick={handleClose}
                >
                  a?? def
                </Link>{' '}
                would be needed for AND/OR logic respectively.
                <br /> <br /> Finally, when matching file extensions, the
                approach will differ depending on whether the extension is
                preceded by a number or a letter. For numbers, to match a name
                with any extension (or vice versa) the extension/name can be
                omitted.{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link4')}
                  onClick={handleClose}
                >
                  1234.dat
                </Link>{' '}
                is stored as two terms, 1234 and dat, so one can be matched
                independently of the other. For letters, wildcards must be used.
                To match a file named abcd.dat either{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link5')}
                  onClick={handleClose}
                >
                  abcd.*
                </Link>{' '}
                or{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link6')}
                  onClick={handleClose}
                >
                  *.dat
                </Link>{' '}
                can be used, however please note that the latter, trailing
                wildcard can take a long time to evaluate.
              </Trans>
            </SectionText>
          </Section>
          <Section>
            <SectionTitle>
              {t('advanced_search_help.fields.title')}
            </SectionTitle>
            <SectionText>
              <Trans t={t} i18nKey="advanced_search_help.fields.description">
                By default, <strong>terms</strong> are applied to several{' '}
                <strong>fields</strong> of the metadata. However more specific
                searches are possible based on the list of supported{' '}
                <strong>fields</strong> below (note that not all{' '}
                <strong>fields</strong> will always have a value and the{' '}
                <strong>fields</strong> differ between entities). For example,
                to find results that mention calibration in their summary but
                not their title, search for{' '}
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
                  <li>doi</li>
                </ul>
                <strong>Dataset</strong>
                <ul>
                  <li>name</li>
                  <li>description</li>
                  <li>type.name</li>
                  <li>visitId</li>
                  <li>sample.name</li>
                  <li>sample.type.name</li>
                  <li>doi</li>
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
                  <li>doi</li>
                </ul>
              </Trans>
            </SectionText>
          </Section>
          <Typography gutterBottom>
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
          </Typography>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default AdvancedHelpDialogue;
