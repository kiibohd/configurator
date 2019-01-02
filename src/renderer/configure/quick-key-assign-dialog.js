import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Dialog, DialogContent, DialogActions, Button, Tabs, Tab, Typography } from '../mui';
import KeyGroups from './key-groups';
import AnimationAction from './visuals/animation-action';
import { buildAnimationActionKey } from '../../common/keys/known-actions';

const TabItems = {
  Keys: 0,
  Animation: 1
};

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
  },
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex'
  },
  title: {
    marginRight: '2rem'
  }
});

function QuickKeyAssignDialog(props) {
  const { classes, open, onSelect, onClose } = props;
  const [tab, setTab] = useState(TabItems.Keys);

  const assignAnimationAction = (animation, action) => {
    onSelect(buildAnimationActionKey(animation, action));
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      onClose={onClose}
      className={classes.dialog}
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogContent classes={{ root: classes.dialogContentRoot }}>
        <div className={classes.container}>
          <div className={classes.header}>
            <Typography variant="h5" className={classes.title}>
              Select Action to Assign
            </Typography>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label="Keys" value={TabItems.Keys} />
              <Tab label="Animation" value={TabItems.Animation} />
            </Tabs>
          </div>
          {tab === TabItems.Animation && (
            <div>
              <Typography variant="subtitle1">Animation Control</Typography>
              <AnimationAction onAssign={assignAnimationAction} />
            </div>
          )}
          {tab === TabItems.Keys && <KeyGroups onSelect={onSelect} />}
        </div>
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
