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
  const { classes, onAssign, readonly, defaultAnimation, defaultAction } = props;
  const [animations] = useConfigureState('animations');
  const [animation, setAnimation] = useState(defaultAnimation || '');
  const [action, setAction] = useState(defaultAction || '');

  return (
    <form>
      <div className={classes.row}>
        <FormControl className={classes.select}>
          <InputLabel htmlFor="animation">Animation</InputLabel>
          <Select
            value={animation}
            onChange={e => setAnimation(e.target.value)}
            inputProps={{ name: 'animation', id: 'animation', readOnly: !!readonly }}
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
            inputProps={{ name: 'action', id: 'action', readOnly: !!readonly }}
          >
            {actions.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!readonly && (
          <Button
            color="primary"
            className={classes.actionButton}
            onClick={() => onAssign && onAssign(animation, action)}
            disabled={!action.length || !animation.length}
          >
            Assign
          </Button>
        )}
      </div>
    </form>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired,
  onAssign: PropTypes.func,
  defaultAnimation: PropTypes.string,
  defaultAction: PropTypes.string,
  readonly: PropTypes.bool
};

export default withStyles(styles)(Preferences);
