import { DialogContent as MuiDialogContent, styled } from '@mui/material';

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export default DialogContent;
