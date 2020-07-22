import React from 'react';
import { IconButton } from '../../mui';
import { KeyboardIcon, KeyboardOffIcon } from '../../icons';
import { useConfigureState } from '../../state/configure';
import { tooltipped } from '../../utils';

export default function ToggleKeyboardButton() {
  const [keyboardHidden, setKeyboardHidden] = useConfigureState('keyboardHidden');
  const toggle = () => setKeyboardHidden((curr) => !curr);

  return tooltipped(
    keyboardHidden ? 'Show Keyboard' : 'Hide Keyboard',
    <IconButton onClick={toggle}>
      {keyboardHidden ? <KeyboardIcon fontSize="small" /> : <KeyboardOffIcon fontSize="small" />}
    </IconButton>
  );
}
