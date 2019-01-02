import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography, Button, Grid } from '../mui';
import { useConfigureState, updateSelected } from '../state/configure';
import Cap from './cap';
import QuickKeyAssignDialog from './quick-key-assign-dialog';
import { keymap } from '../../common/keys/predefined';
import AnimationAction from './visuals/animation-action';

const Mode = {
  Unassigned: 0,
  AssignedKey: 1,
  Animation: 2,
  Macro: 3,
  CustomKll: 4
};

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

  const key = selected && selected.layers[layer];
  const name = key && key.key;
  const cap = keymap[name] || {};

  let mode = Mode.AssignedKey;
  if (!key || !name) {
    mode = Mode.Unassigned;
  } else if (name === 'cust/anim') {
    mode = Mode.Animation;
  } else if (key.custom) {
    mode = Mode.CustomKll;
  }

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
        <Grid container spacing={16} direction="column">
          <Grid item>
            {(() => {
              switch (mode) {
                case Mode.Unassigned:
                  return <Typography>Unassigned / Fallthrough</Typography>;
                case Mode.AssignedKey:
                  return (
                    <>
                      <Typography>Assigned Key</Typography>
                      <br />
                      <Cap cap={cap} onClick={() => setAssignDialogOpen(true)} />
                    </>
                  );
                case Mode.Animation:
                  return (
                    <>
                      <Typography>Assigned Action</Typography>
                      <br />
                      <AnimationAction
                        readonly={true}
                        defaultAction={key.data.action}
                        defaultAnimation={key.data.animation}
                      />
                    </>
                  );
                case Mode.CustomKll:
                  return (
                    <>
                      <Typography>Custom KLL</Typography>
                      <pre>{key.custom}</pre>
                    </>
                  );
              }
            })()}
          </Grid>
          <Grid container direction="row-reverse" spacing={16} item xs={6}>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setAssignDialogOpen(true)}
                onMouseDown={e => e.preventDefault()}
              >
                Reassign
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => updateSelected(null)} onMouseDown={e => e.preventDefault()}>
                Clear
              </Button>
            </Grid>
          </Grid>
          <QuickKeyAssignDialog open={assignDialogOpen} onSelect={select} onClose={closeDialog} />
        </Grid>
      )}
    </div>
  );
}

KeyInfo.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(KeyInfo);
