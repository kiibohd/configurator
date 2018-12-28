import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Table, TableHead, TableBody, TableCell, TableRow, IconButton, Typography, grey } from '../../mui';
import { DeleteIcon, ToggleSwitchOutlineIcon, ToggleSwitchOffOutlineIcon } from '../../icons';
import { useConfigureState, deleteAnimation, updateAnimation } from '../../state/configure';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10
  },
  error: {
    fontStyle: 'oblique',
    textAlign: 'center'
  },
  startup: {
    cursor: 'pointer'
  },
  on: {
    color: 'green'
  },
  off: {
    color: grey[800]
  }
};

function Preferences(props) {
  const { classes } = props;
  const [animations] = useConfigureState('animations');

  const startupCount = _.toPairs(animations).filter(([, x]) => x.settings.includes('start')).length;

  /** @type{(name: string, anim: import('../../../common/config/types').ConfigAnimation) => void} */
  const toggleStart = (name, anim) => {
    let settings = anim.settings.split(',').map(x => x.trim());
    if (settings.includes('start')) {
      settings = _.remove(settings, 'start');
    } else {
      settings = [...settings, 'start'];
    }

    updateAnimation(name, { settings: settings.join(', ') });
  };

  return (
    <div className={classes.container}>
      {startupCount > 1 && (
        <div className={classes.error}>
          <Typography color="error">Warning: Multiple startup animations specified, this may cause issues.</Typography>
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Startup Animation</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.toPairs(animations).map(([name, anim]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>
                <div onClick={() => toggleStart(name, anim)} className={classes.startup}>
                  {anim.settings.includes('start') ? (
                    <ToggleSwitchOutlineIcon fontSize="large" className={classes.on} />
                  ) : (
                    <ToggleSwitchOffOutlineIcon fontSize="large" className={classes.off} />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => deleteAnimation(name)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
