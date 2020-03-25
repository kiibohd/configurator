import React from 'react';
import { makeStyles, Button, Theme } from '../../mui';
import { VideoOutlineIcon, VideoOffOfflineIcon } from '../../icons';
import { useCoreState, updatePanel, Panels } from '../../state/core';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      button: {
        color: 'rgba(0, 0, 0, 0.54)',
      },
      leftIcon: {
        marginRight: theme.spacing(1),
        fontSize: 20,
      },
    } as const)
);

export default function ToggleVisualsButton() {
  const classes = useStyles({});
  const [panel] = useCoreState('panel');
  const isVisuals = panel === Panels.ConfigureVisuals;
  const toggle = () => updatePanel(isVisuals ? Panels.ConfigureKeys : Panels.ConfigureVisuals);

  return (
    <Button className={classes.button} onClick={toggle}>
      {isVisuals ? (
        <VideoOffOfflineIcon className={classes.leftIcon} />
      ) : (
        <VideoOutlineIcon className={classes.leftIcon} />
      )}
      {isVisuals ? 'Hide Visuals' : 'Show Visuals'}
    </Button>
  );
}
