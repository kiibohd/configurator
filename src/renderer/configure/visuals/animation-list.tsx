import React from 'react';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableHead, TableBody, TableCell, TableRow, IconButton, Typography, grey } from '../../mui';
import { DeleteIcon, ToggleSwitchOutlineIcon, ToggleSwitchOffOutlineIcon } from '../../icons';
import { useConfigureState, deleteAnimation, updateAnimation } from '../../state/configure';
import { ConfigAnimation } from '../../../common/config';

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
  error: {
    fontStyle: 'oblique',
    textAlign: 'center',
  },
  startup: {
    cursor: 'pointer',
  },
  on: {
    color: 'green',
  },
  off: {
    color: grey[800],
  },
} as const);

export default function AnimationList(): JSX.Element {
  const classes = useStyles({});
  const [animations] = useConfigureState('animations');

  const startupCount = _.toPairs(animations).filter(([, x]) => x.settings.includes('start')).length;

  const toggleStart = (name: string, anim: ConfigAnimation) => {
    let settings = anim.settings.split(',').map((x) => x.trim());
    if (settings.includes('start')) {
      settings = _.filter(settings, (x) => x !== 'start');
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
