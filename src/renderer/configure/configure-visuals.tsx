import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '../mui';
import { AnimationIcon, SquareEditOutlineIcon, PaletteIcon, PaletteAdvancedIcon } from '../icons';
import VisualizeLeds from './visualize-leds';
import SideTabs from './side-tabs';
import AnimationList from './visuals/animation-list';
import AnimationEdit from './visuals/animation-edit';
import StaticMap from './visuals/static-map';
import { tooltipped } from '../utils';
import { useConfigureState } from '../state';
import { CompileFirmwareButton } from './buttons';
import CustomizeCanned from './visuals/customize-canned';
import { SideTab } from './types';

const tabs: NonEmptyArray<SideTab> = [
  {
    id: 'tab/animations',
    icon: tooltipped('Animations Overview', <AnimationIcon fontSize="large" />),
    tab: <AnimationList />,
  },
  {
    id: 'tab/edit-animation',
    icon: tooltipped('Add/Edit Animation', <SquareEditOutlineIcon fontSize="large" />),
    tab: <AnimationEdit />,
  },
  {
    id: 'tab/customize-canned',
    icon: tooltipped('Customize Prebuilt Animation', <PaletteAdvancedIcon fontSize="large" />),
    tab: <CustomizeCanned />,
  },
  {
    id: 'tab/static-map',
    icon: tooltipped('Static LEDs', <PaletteIcon fontSize="large" />),
    tab: <StaticMap />,
  },
];

const useStyles = makeStyles({
  container: {
    position: 'relative',
    minHeight: 24,
    marginTop: 16,
  },
  leds: {
    boxSizing: 'content-box',
    display: 'inline-block',
    border: '1px solid black',
    marginTop: 36,
  },
  hidden: {
    display: 'none',
  },
} as const);

export default function ConfigureVisuals(): JSX.Element {
  const classes = useStyles({});
  const [keyboardHidden] = useConfigureState('keyboardHidden');

  return (
    <>
      <div className={classes.container}>
        <CompileFirmwareButton />
        <div className={classNames(classes.leds, { [classes.hidden]: keyboardHidden })}>
          <VisualizeLeds />
        </div>
      </div>
      <div>
        <SideTabs items={tabs} />
      </div>
    </>
  );
}
