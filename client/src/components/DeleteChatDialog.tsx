import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface Props {
  handleClearChat: () => void;
}

export interface DeleteChatDialogRef {
  openDialog: () => void;
  closeDialog: () => void;
}

const DeleteChatDialog = forwardRef<DeleteChatDialogRef, Props>(
  ({ handleClearChat }, ref) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleClose = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      openDialog: () => setOpen(true),
      closeDialog: handleClose,
    }));

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          sx: {
            bgcolor: 'secondary.main',
            fontFamily: 'Arial',
          },
        }}
      >
        <DialogTitle id='alert-dialog-title' fontFamily='inherit'>
          {'Clear Chat History?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description' fontFamily='inherit'>
            Are you sure you want to clear your chat history?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ fontFamily: 'inherit' }} onClick={handleClose}>
            Disagree
          </Button>
          <Button
            sx={{ fontFamily: 'inherit' }}
            onClick={handleClearChat}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default DeleteChatDialog;
