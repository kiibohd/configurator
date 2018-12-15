import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '../mui';
import { useConfigureState, updateSelected } from '../state/configure';
import KeyGroups from './key-groups';
import Cap from './cap';
import { keymap } from '../../common/keys/predefined';

const styles = {
  container: {
    padding: 10,
    paddingLeft: 30
  },
  message: {
    fontStyle: 'oblique'
  }
};

function Preferences(props) {
  const { classes } = props;
  const [selected] = useConfigureState('selected');
  const [layer] = useConfigureState('layer');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  console.log(selected);
  const key = selected && selected.layers[layer] && selected.layers[layer].key;
  const cap = keymap[key] || {};

  const close = () => setAssignDialogOpen(false);
  const select = key => {
    setAssignDialogOpen(false);
    updateSelected(key);
  };

  return (
    <div className={classes.container}>
      {!selected && (
        <span className={classes.message}>
          <Typography component="h4">No key currently selected</Typography>
        </span>
      )}
      {selected && (
        <div>
          <div>
            <Typography>Assigned Key</Typography>
            <Cap cap={cap} onClick={() => setAssignDialogOpen(true)} onClose={close} />
          </div>
          <Dialog open={assignDialogOpen} maxWidth="lg">
            <DialogTitle>Select Key to Assign</DialogTitle>
            <DialogContent>
              <KeyGroups onSelect={select} />
            </DialogContent>
            <DialogActions>
              <Button onClick={close} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
