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

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
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
    },
    dialogueBackground: {
      backgroundColor: theme.palette.grey[200],
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

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="text" color="primary" onClick={handleClickOpen}>
        Advanced
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
            aria-label="close"
            className={classes.closeButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </MuiDialogTitle>
        <Typography className={classes.root} gutterBottom>
          {
            "When you search for a word e.g. 'calibration', we will search for any records containing this word. But, sometimes you may wish to be more specific. Here we show you how."
          }
        </Typography>
        <Paper className={classes.paper}>
          <DialogHeading>Search by an exact phrase</DialogHeading>
          <DialogContent>
            {
              'Use quotation marks around a phrase to search for a precise sequence of words e.g. "neutron scattering".'
            }
          </DialogContent>
        </Paper>
        <Paper className={classes.paper}>
          <DialogHeading>Using logic operators</DialogHeading>
          <DialogContent>
            Use <b>AND</b> to search for records containing more than one phrase
            e.g. &#39;neutron <b>AND</b> scattering&#39;.
          </DialogContent>
          <DialogContent>
            Use <b>OR</b> to search for records containing either one phrase or
            another e.g. &#39;neutron <b>OR</b> scattering&#39;.
          </DialogContent>
          <DialogContent>
            Use <b>NOT</b> to exclude records containing a word or phrase e.g.
            &#39;scattering <b>NOT</b> elastic&#39;.
          </DialogContent>
          <DialogContent>
            Use brackets around a phrases to construct more complicated searches
            e.g. &#39;scattering <b>NOT</b> (elastic <b>OR</b> neutron)&#39;.
          </DialogContent>
        </Paper>
        <Paper className={classes.paper}>
          <DialogHeading>Wildcards</DialogHeading>
          <DialogContent>
            {
              "Use wildcards to take the place of one or more characters in a phrase. A question mark '?' for example can be used to search for a phrase with one or more character missing e.g. 'te?t' will return results containing 'test' or 'text'. Similarly the asterix '*' can be used to replace zero or more characters e.g. 'test*' will return results containing either 'test' or 'tests'."
            }
          </DialogContent>
        </Paper>
        <Typography className={classes.root} gutterBottom>
          Further information on searching can be found{' '}
          <Link href="https://lucene.apache.org/core/4_10_2/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description">
            here
          </Link>
          .
        </Typography>
      </Dialog>
    </div>
  );
};

export default AdvancedHelpDialogue;
