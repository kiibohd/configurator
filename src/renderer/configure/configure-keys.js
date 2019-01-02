import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '../mui';
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

const tabs = [
  {
    id: 'tab/key-info',
    icon: tooltipped('Key Info', <MagnifyIcon fontSize="large" />),
    tab: <KeyInfo />
  },
  {
    id: 'tab/macros',
    icon: tooltipped('Macros', <VariableIcon fontSize="large" />),
    tab: <LayerMacros />
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

/** @type {import('../theme').CssProperties} */
const styles = {
  hidden: {
    display: 'none'
  },
  container: {
    position: 'relative',
    minHeight: 24,
    marginTop: 16
  }
};

function ConfigureKeys(props) {
  const { classes } = props;
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

ConfigureKeys.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ConfigureKeys);
