import React from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { Link, Paper } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    advancedButton: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.blue,
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    paper: {
      margin: theme.spacing(2),
      padding: theme.spacing(2),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backgroundColor: (theme as any).colours?.paper,
    },
    dialogueBackground: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backgroundColor: (theme as any).colours?.background,
    },
  });
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogHeading = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogTitle);

const AdvancedHelpDialogue = (): React.ReactElement => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const [t] = useTranslation();

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="text"
        className={classes.advancedButton}
        aria-label={t('advanced_search_help.advanced_button_arialabel')}
        onClick={handleClickOpen}
      >
        {t('advanced_search_help.advanced_button')}
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="advanced-search-dialog-title"
        open={open}
        PaperProps={{ className: classes.dialogueBackground }}
      >
        <MuiDialogTitle
          disableTypography
          className={classes.root}
          id="advanced-search-dialog-title"
        >
          <Typography variant="h6">Advanced Search Tips</Typography>
          <IconButton
            aria-label={t('advanced_search_help.close_button_arialabel')}
            className={classes.closeButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </MuiDialogTitle>
        <Typography className={classes.root} gutterBottom>
          {t('advanced_search_help.description')}
        </Typography>
        <Paper className={classes.paper}>
          <DialogHeading>
            {t('advanced_search_help.exact_phrase_title')}
          </DialogHeading>
          <DialogContent>
            {t('advanced_search_help.exact_phrase_description')}
          </DialogContent>
        </Paper>
        <Paper className={classes.paper}>
          <DialogHeading>
            {t('advanced_search_help.logic_operators_title')}
          </DialogHeading>
          <DialogContent>
            <Trans
              t={t}
              i18nKey="advanced_search_help.logic_operators_description"
            />
          </DialogContent>
        </Paper>
        <Paper className={classes.paper}>
          <DialogHeading>
            {t('advanced_search_help.wildcards_title')}
          </DialogHeading>
          <DialogContent>
            <Trans t={t} i18nKey="advanced_search_help.wildcards_description" />
          </DialogContent>
        </Paper>
        <Typography className={classes.root} gutterBottom>
          <Trans t={t} i18nKey="advanced_search_help.footer">
            Further information on searching can be found{' '}
            <Link href="https://lucene.apache.org/core/4_10_2/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description">
              here
            </Link>
            .
          </Trans>
        </Typography>
      </Dialog>
    </div>
  );
};

export default AdvancedHelpDialogue;
