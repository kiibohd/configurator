import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import { AnimationIcon, SquareEditOutlineIcon } from '../icons';
import VisualizeLeds from './visualize-leds';
import SideTabs from './side-tabs';
import AnimationList from './visuals/animation-list';
import AnimationEdit from './visuals/animation-edit';
import { tooltipped } from '../utils';
import { useConfigureState } from '../state';

const tabs = [
  {
    id: 'tab/animations',
    icon: tooltipped('Animations Overview', <AnimationIcon fontSize="large" />),
    tab: <AnimationList />
  },
  {
    id: 'tab/edit-animation',
    icon: tooltipped('Add/Edit Animation', <SquareEditOutlineIcon fontSize="large" />),
    tab: <AnimationEdit />
  }
];

const styled = withStyles({
  root: {
    boxSizing: 'content-box',
    display: 'inline-block',
    border: '1px solid black',
    marginTop: 49
  }
});

function ConfigureVisuals(props) {
  const { classes } = props;
  const [keyboardHidden] = useConfigureState('keyboardHidden');

  const keyboardStyle = keyboardHidden ? { display: 'none' } : {};

  return (
    <>
      <div className={classes.root} style={keyboardStyle}>
        <VisualizeLeds />
      </div>
      <div>
        <SideTabs items={tabs} />
      </div>
    </>
  );
}

ConfigureVisuals.propTypes = {
  classes: PropTypes.object.isRequired
};

export default styled(ConfigureVisuals);
