import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '../mui';
import KeyGroups from './key-groups';

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  dialog: {
    fontFamily: theme.typography.fontFamily
  },
  dialogPaper: {
    minHeight: '85vh',
    maxHeight: '85vh'
  },
  dialogContentRoot: {
    display: 'flex'
  }
});

function QuickKeyAssignDialog(props) {
  const { classes, open, onSelect, onClose } = props;

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      onClose={onClose}
      className={classes.dialog}
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>Select Key to Assign</DialogTitle>
      <DialogContent classes={{ root: classes.dialogContentRoot }}>
        <KeyGroups onSelect={onSelect} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

QuickKeyAssignDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(QuickKeyAssignDialog);
