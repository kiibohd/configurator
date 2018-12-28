import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '../mui';
import { useConfigureState, updateSelected } from '../state/configure';
import Cap from './cap';
import QuickKeyAssignDialog from './quick-key-assign-dialog';
import { keymap } from '../../common/keys/predefined';

/** @type {import('../theme').CssProperties} */
const styles = {
  container: {
    padding: 10,
    paddingLeft: 30
  },
  message: {
    fontStyle: 'oblique'
  }
};

function KeyInfo(props) {
  const { classes } = props;
  const [selected] = useConfigureState('selected');
  const [layer] = useConfigureState('layer');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const key = selected && selected.layers[layer] && selected.layers[layer].key;
  const cap = keymap[key] || {};

  const closeDialog = () => setAssignDialogOpen(false);
  const select = key => {
    setAssignDialogOpen(false);
    updateSelected(key);
  };

  return (
    <div className={classes.container}>
      {!selected && (
        <div className={classes.message}>
          <Typography variant="subtitle1">No key currently selected</Typography>
          <br />
          <Typography variant="body2">You can use Shift + Left Mouse to quick assign</Typography>
        </div>
      )}
      {selected && (
        <div>
          <div>
            <Typography>Assigned Key</Typography>
            <Cap cap={cap} onClick={() => setAssignDialogOpen(true)} />
          </div>
          <QuickKeyAssignDialog open={assignDialogOpen} onSelect={select} onClose={closeDialog} />
        </div>
      )}
    </div>
  );
}

KeyInfo.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(KeyInfo);
