import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, MenuItem, Select, FormControl, InputLabel, Typography } from '../../mui';
import {
  useConfigureState,
  setConfigureState,
  addAnimation,
  updateAnimation,
  renameAnimation,
  setLedStatus,
  setSelectedLeds
} from '../../state/configure';
import { AlterFieldModal } from '../../modal';
import { SwatchedChromePicker } from '../../common';
import _ from 'lodash';

const header = '### AUTO GENERATED - DO NOT EDIT - STATIC COLOR MAP ###;\n';
const settings = 'loop, replace:clear, framedelay:255';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10,
    position: 'relative',
    minHeight: '20rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20
  },
  centeredRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    marginRight: 10
  },
  actionButton: {
    marginLeft: 10
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '2rem'
  }
};

function StaticMap(props) {
  const { classes } = props;
  const [leds] = useConfigureState('leds');
  const [animations] = useConfigureState('animations');
  const [selectedLeds] = useConfigureState('selectedLeds');
  const [ledStatus] = useConfigureState('ledStatus');

  const [active, setActive] = useState('');
  const [showRename, setShowRename] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filteredAnimations = _.toPairs(animations).filter(([, animation]) => animation.type === 'static');

  const activeAnimation = active.length && animations[active];
  const selectedAnimationChange = e => setActive(e.target.value);

  useEffect(
    () => {
      const rx = /P\[(\d+)]\(\s*(\d+)s*,\s*(\d+)s*,\s*(\d+)s*\)/gm;
      // TODO: Bulk update...
      let match;
      while ((match = rx.exec(activeAnimation.frames))) {
        const [id, r, g, b] = match.slice(1, 5).map(x => parseInt(x));
        setLedStatus(id, { id, r, g, b });
      }
      return () => setConfigureState('ledStatus', {});
    },
    [active]
  );

  const create = (save, name) => {
    setShowNew(false);
    if (save) {
      addAnimation(name, 'static');
      updateAnimation(name, { settings, frames: header });
      setActive(name);
    }
  };

  const rename = (save, name) => {
    setShowRename(false);
    if (save) {
      renameAnimation(active, name);
      setActive(name);
    }
  };

  const validateName = name => {
    if (animations[name]) {
      return 'An animation already exists with that name';
    }
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!name.length || !rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }
  };

  const select = selection => {
    switch (selection) {
      case 'none':
        setSelectedLeds([]);
        break;
      case 'backlighting':
        setSelectedLeds(leds.filter(x => !!x.scanCode).map(x => x.id));
        break;
      case 'underlighting':
        setSelectedLeds(leds.filter(x => !x.scanCode).map(x => x.id));
        break;
      case 'all':
        setSelectedLeds(leds.map(x => x.id));
        break;
    }
  };

  const color = _.head(selectedLeds.map(x => ledStatus[x]).filter(x => !!x)) || { r: 0, g: 0, b: 0 };
  const colorChange = color => {
    const statuses = { ...ledStatus };

    // TODO: Bulk update
    _.forEach(selectedLeds, x => {
      statuses[x] = { id: x, ...color.rgb };
      setLedStatus(x, { id: x, ...color.rgb });
    });
    const animation =
      _.toPairs(statuses)
        .map(([id, x]) => `P[${id}](${x.r},${x.g},${x.b})`)
        .join(',\n') + ';';

    updateAnimation(active, { frames: `${header}${animation}` });
  };

  return (
    <form>
      <div className={classes.container}>
        <Typography variant="subtitle1">Static LED Visualization</Typography>

        <div className={classes.row}>
          <FormControl className={classes.animationSelect}>
            <InputLabel htmlFor="animation">Animation</InputLabel>
            <Select
              value={active}
              onChange={selectedAnimationChange}
              inputProps={{ name: 'animation', id: 'animation' }}
            >
              {filteredAnimations.map(([name]) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button className={classes.actionButton} onClick={() => setShowRename(true)} disabled={active.length === 0}>
            Rename
          </Button>
          <Button color="secondary" className={classes.actionButton} onClick={() => setShowNew(true)}>
            Add New
          </Button>
        </div>
        {!!activeAnimation && (
          <>
            <div className={classes.row}>
              {!selectedLeds.length && <Typography>No LEDs Selected.</Typography>}
              {!!selectedLeds.length && (
                <div className={classes.centeredRow}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Current Color:
                  </Typography>
                  <SwatchedChromePicker color={color} onChange={colorChange} />
                </div>
              )}
            </div>
            <div className={classes.row} style={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" className={classes.label}>
                Select:
              </Typography>
              <Button color="primary" onClick={() => select('backlighting')}>
                Backlighting
              </Button>
              <Button color="primary" onClick={() => select('underlighting')}>
                Underlighting
              </Button>
              <Button color="primary" onClick={() => select('all')}>
                All
              </Button>
              <Button color="primary" onClick={() => select('none')}>
                None
              </Button>
            </div>
          </>
        )}
        <AlterFieldModal
          open={showNew}
          value={''}
          name="Animation Name"
          saveText="Create"
          onClose={create}
          validation={validateName}
        />
        <AlterFieldModal
          open={showRename}
          value={active}
          name="Animation Name"
          saveText="Rename"
          onClose={rename}
          validation={validateName}
        />
      </div>
    </form>
  );
}

StaticMap.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StaticMap);
