import React, { useState } from 'react';
import { makeStyles, Typography, Button, Grid } from '../mui';
import { useConfigureState, updateSelected } from '../state/configure';
import Cap from './cap';
import QuickKeyAssignDialog from './quick-key-assign-dialog';
import { keymap } from '../../common/keys/predefined';
import AnimationAction from './visuals/animation-action';
import { ConfigKey } from '../../common/config';
import { PredefinedKey, DisplayKey } from '../../common/keys';

enum Mode {
  Unassigned,
  AssignedKey,
  Animation,
  Macro,
  CustomKll
}

type UnassignedData = {
  mode: Mode.Unassigned;
};

type AssignedData = {
  mode: Mode.AssignedKey;
  name: string;
  key: ConfigKey;
  cap: PredefinedKey;
};

type OtherData = {
  mode: Mode.Animation | Mode.CustomKll;
  name: string;
  // TODO: this type is wrong for animation it can be a display key
  key: DisplayKey;
};

type KeyData = UnassignedData | AssignedData | OtherData;

const useStyles = makeStyles({
  container: {
    padding: 10,
    paddingLeft: 30
  },
  message: {
    fontStyle: 'oblique'
  }
} as const);

export default function KeyInfo() {
  const classes = useStyles({});
  const [selected] = useConfigureState('selected');
  const [layer] = useConfigureState('layer');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  function getData(): KeyData {
    const key = selected && selected.layers[layer];
    const name = key && key.key;

    if (!key || !name) {
      return { mode: Mode.Unassigned };
    }

    if (name === 'cust/anim') {
      return { mode: Mode.Animation, name, key };
    }

    if (key.custom) {
      return { mode: Mode.CustomKll, name, key };
    }

    const cap = keymap[name] || {};
    return { mode: Mode.AssignedKey, name, key, cap };
  }

  const data = getData();

  const closeDialog = () => setAssignDialogOpen(false);

  const select = (key: ConfigKey | null) => {
    setAssignDialogOpen(false);
    updateSelected(key);
  };

  return (
    <div className={classes.container}>
      {!selected && (
        <div className={classes.message}>
          <Typography variant="subtitle1">No key currently selected</Typography>
          <br />
          <Typography variant="body2">
            You can use Shift + Left Mouse to quick assign and Ctrl + Left Mouse to clear an assignment.
          </Typography>
        </div>
      )}
      {selected && (
        <Grid container spacing={2} direction="column">
          <Grid item>
            {(() => {
              let animationData: { action: string; animation: string };
              switch (data.mode) {
                case Mode.Unassigned:
                  return <Typography>Unassigned / Fallthrough</Typography>;
                case Mode.AssignedKey:
                  return (
                    <>
                      <Typography>Assigned Key</Typography>
                      <br />
                      <Cap cap={data.cap} onClick={() => setAssignDialogOpen(true)} />
                    </>
                  );
                case Mode.Animation:
                  animationData = data.key.data as { action: string; animation: string };
                  return (
                    <>
                      <Typography>Assigned Action</Typography>
                      <br />
                      <AnimationAction
                        readonly={true}
                        defaultAction={animationData.action}
                        defaultAnimation={animationData.animation}
                      />
                    </>
                  );
                case Mode.CustomKll:
                  return (
                    <>
                      <Typography>Custom KLL</Typography>
                      <pre>{data.key.custom}</pre>
                    </>
                  );
              }
            })()}
          </Grid>
          <Grid container direction="row-reverse" spacing={2} item xs={6}>
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
