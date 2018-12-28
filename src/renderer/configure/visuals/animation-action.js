import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles, Button, MenuItem, Select, FormControl, InputLabel } from '../../mui';
import { useConfigureState } from '../../state/configure';

const actions = ['start', 'pause', 'stop', 'single'];

/** @type {import('../../theme').CssProperties} */
const styles = {
  select: {
    minWidth: '15rem',
    marginRight: '1rem'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  actionButton: {}
};

function Preferences(props) {
  const { classes, onAssign } = props;
  const [animations] = useConfigureState('animations');
  const [animation, setAnimation] = useState('');
  const [action, setAction] = useState('');

  return (
    <form>
      <div className={classes.row}>
        <FormControl className={classes.select}>
          <InputLabel htmlFor="animation">Animation</InputLabel>
          <Select
            value={animation}
            onChange={e => setAnimation(e.target.value)}
            inputProps={{ name: 'animation', id: 'animation' }}
          >
            {_.toPairs(animations).map(([name]) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.select}>
          <InputLabel htmlFor="action">Action</InputLabel>
          <Select
            value={action}
            onChange={e => setAction(e.target.value)}
            inputProps={{ name: 'action', id: 'action' }}
          >
            {actions.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          color="primary"
          className={classes.actionButton}
          onClick={() => onAssign(animation, action)}
          disabled={!action.length || !animation.length}
        >
          Assign
        </Button>
      </div>
    </form>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired,
  onAssign: PropTypes.func.isRequired
};

export default withStyles(styles)(Preferences);
