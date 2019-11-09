import React, { useEffect } from 'react';
import { makeStyles } from '../mui';
import { updateToolbarButtons, useCoreState, Actions, Panels } from '../state/core';
import { SettingsButton, HomeButton, HelpButton } from '../buttons';
import {
  ToggleKeyboardButton,
  ToggleVisualsButton,
  ViewRawJsonButton,
  ImportKeymapButton,
  LayoutHistoryButton
} from './buttons';
import ConfigureKeys from './configure-keys';
import ConfigureVisuals from './configure-visuals';
import log from 'loglevel';

const useStyles = makeStyles({
  root: {
    boxSizing: 'content-box',
    display: 'inline-block'
  }
} as const);

export default function Configure() {
  const classes = useStyles({});
  const [keyboard] = useCoreState('keyboard');
  const [activePanel] = useCoreState('panel');
  const [executing] = useCoreState('executing');

  const compiling = executing.includes(Actions.Compile);

  if (!keyboard) {
    log.error('No keyboard selected while configure active');
    throw Error('State Error: keyboard not selected while configure active.');
  }

  useEffect(() => {
    updateToolbarButtons(
      <>
        <LayoutHistoryButton disabled={compiling} />
        {keyboard.keyboard.visuals && <ToggleVisualsButton />}
        <ToggleKeyboardButton />
        <ViewRawJsonButton disabled={compiling} />
        <ImportKeymapButton disabled={compiling} />
        <SettingsButton disabled={compiling} />
        <HelpButton disabled={compiling} />
        <HomeButton disabled={compiling} />
      </>
    );
  }, [executing]);

  return (
    <div className={classes.root}>
      {activePanel === Panels.ConfigureKeys ? <ConfigureKeys /> : <ConfigureVisuals />}
    </div>
  );
}
