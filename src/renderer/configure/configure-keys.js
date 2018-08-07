import React from 'react';
import { Typography } from '../mui';
import { CodeIcon, TuneIcon, VariableIcon, MagnifyIcon } from '../icons';
import { useConfigureState } from '../state/configure';
import LayerSelect from './layer-select';
import OnScreenKeyboard from './onscreen-keyboard';
import KeyInfo from './key-info';
import CustomKll from './custom-kll';
import AdvancedSettings from './advanced-settings';
import SideTabs from './side-tabs';
import { tooltipped } from '../utils';

const tabs = [
  {
    id: 'tab/key-info',
    icon: tooltipped('Key Info', <MagnifyIcon fontSize="large" />),
    tab: <KeyInfo />
  },
  {
    id: 'tab/macros',
    icon: tooltipped('Macros', <VariableIcon fontSize="large" />),
    tab: <Typography component="h1">uhhh.. yo</Typography>
  },
  {
    id: 'tab/custom-kll',
    icon: tooltipped('Custom KLL', <CodeIcon fontSize="large" />),
    tab: <CustomKll />
  },
  {
    id: 'tab/settings',
    icon: tooltipped('Advanced Settings', <TuneIcon fontSize="large" />),
    tab: <AdvancedSettings />
  }
];

function ConfigureKeys() {
  const [keyboardHidden] = useConfigureState('keyboardHidden');

  const keyboardStyle = keyboardHidden ? { display: 'none' } : {};

  return (
    <>
      <div style={keyboardStyle}>
        <LayerSelect />
        <OnScreenKeyboard />
      </div>
      <div>
        <SideTabs items={tabs} />
      </div>
    </>
  );
}

export default ConfigureKeys;
