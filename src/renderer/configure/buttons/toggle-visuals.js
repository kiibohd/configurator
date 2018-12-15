import React from 'react';
import { IconButton } from '../../mui';
import { VideoOutlineIcon, VideoOffOfflineIcon } from '../../icons';
import { useCoreState, updatePanel, Panels } from '../../state/core';
import { tooltipped } from '../../utils';

function ToggleVisualsButton() {
  const [panel] = useCoreState('panel');
  const isVisuals = panel === Panels.ConfigureVisuals;
  const toggle = () => updatePanel(isVisuals ? Panels.ConfigureKeys : Panels.ConfigureVisuals);

  return tooltipped(
    isVisuals ? 'Hide Visuals' : 'Show Visuals',
    <IconButton onClick={toggle}>
      {isVisuals ? <VideoOffOfflineIcon fontSize="small" /> : <VideoOutlineIcon fontSize="small" />}
    </IconButton>
  );
}

export default ToggleVisualsButton;
