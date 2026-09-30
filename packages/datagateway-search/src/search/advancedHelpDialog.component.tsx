import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import React from 'react';
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

const AdvancedHelpDialog = (): React.ReactElement => {
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
                To allow file paths to be searched, special syntax is applied to
                three different fields: location, location.fileName and
                location.exact.
                <br /> <br />
                <strong>location</strong>
                <br />
                For this field, the only separator character is{' '}
                <strong>/</strong>. This means each subdirectory, and the
                complete file name, can be matched independently.{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link1')}
                  onClick={handleClose}
                >
                  location:&quot;path/to/directory&quot;
                </Link>{' '}
                and{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link2')}
                  onClick={handleClose}
                >
                  location:directory
                </Link>{' '}
                and are both valid ways of searching for a single or sequence of
                directories in the filepath. Wildcards can be used within a
                single subdirectory, but will not cross into the next child
                directory. For example <strong> path*directory</strong> will not
                match, but <strong> dir*</strong> will. This field is one of
                those searched by default if no field is specified.
                <br /> <br />
                <strong>location.fileName</strong>
                <br />
                This field uses the just the file name (whatever follows the
                final /) and splits it by <strong>.</strong> to make it easier
                to search for files with the same root but different extensions
                (
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link3')}
                  onClick={handleClose}
                >
                  location.fileName:txt
                </Link>{' '}
                would match both &quot;run_5678.txt&quot; and
                &quot;run_1234.nxs&quot;), or the same extension but different
                roots (
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link4')}
                  onClick={handleClose}
                >
                  location.fileName:txt
                </Link>{' '}
                would match both &quot;run_1234.txt&quot; and
                &quot;run_5678.txt&quot;). This field is one of those searched
                by default if no field is specified.
                <br /> <br />
                <strong>location.exact</strong>
                <br />
                Finally, this field allows exact and hierarchical matches on the
                absolute file path. All files that start with the search term
                will be returned, and wildcards can be used to match multiple
                subdirectories if needed. Unlike the location field, this means
                an incomplete or relative path cannot be provided.{' '}
                <Link
                  component={RouterLink}
                  to={t('advanced_search_help.file_paths.link5')}
                  onClick={handleClose}
                >
                  location.exact:/dls/i00/data/202?
                </Link>{' '}
                would match everything st instrument i00 in any folder for the
                2020s. Note that to be effective this requires knowledge of the
                file heirachy and may lead to poor performance if a lot of
                results match, so consider combining this with other terms to
                make a more specific query. This field is NOT searched by
                default if no field is specified.
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

export default AdvancedHelpDialog;
