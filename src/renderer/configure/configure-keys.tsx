import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '../mui';
import { CodeIcon, TuneIcon, VariableIcon, MagnifyIcon } from '../icons';
import { useConfigureState } from '../state/configure';
import LayerSelect from './layer-select';
import OnScreenKeyboard from './onscreen-keyboard';
import KeyInfo from './key-info';
import CustomKll from './custom-kll';
import AdvancedSettings from './advanced-settings';
import SideTabs from './side-tabs';
import { LayerMacros } from './macros';
import { tooltipped } from '../utils';
import { CompileFirmwareButton } from './buttons';
import { SideTab } from './types';

const tabs: NonEmptyArray<SideTab> = [
  {
    id: 'tab/key-info',
    icon: tooltipped('Key Info', <MagnifyIcon fontSize="large" />),
    tab: <KeyInfo />,
  },
  {
    id: 'tab/macros',
    icon: tooltipped('Macros', <VariableIcon fontSize="large" />),
    tab: <LayerMacros />,
  },
  {
    id: 'tab/custom-kll',
    icon: tooltipped('Custom KLL', <CodeIcon fontSize="large" />),
    tab: <CustomKll />,
  },
  {
    id: 'tab/settings',
    icon: tooltipped('Advanced Settings', <TuneIcon fontSize="large" />),
    tab: <AdvancedSettings />,
  },
];

const useStyles = makeStyles({
  hidden: {
    display: 'none',
  },
  container: {
    position: 'relative',
    minHeight: 24,
    marginTop: 16,
  },
} as const);

export default function ConfigureKeys() {
  const classes = useStyles({});
  const [keyboardHidden] = useConfigureState('keyboardHidden');

  return (
    <>
      <div className={classes.container}>
        <CompileFirmwareButton />
        <div className={classNames({ [classes.hidden]: keyboardHidden })}>
          <LayerSelect />
          <OnScreenKeyboard />
        </div>
      </div>
      <div>
        <SideTabs items={tabs} />
      </div>
    </>
  );
}
