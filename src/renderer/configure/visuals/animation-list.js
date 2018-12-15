import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Table, TableHead, TableBody, TableCell, TableRow, IconButton } from '../../mui';
import { DeleteIcon } from '../../icons';
import { useConfigureState, deleteAnimation } from '../../state/configure';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10
  }
};

function Preferences(props) {
  const { classes } = props;
  const [animations] = useConfigureState('animations');

  return (
    <div className={classes.container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Auto-start?</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.toPairs(animations).map(([name, anim]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>{anim.settings.includes('start') ? 'Yes' : ''}</TableCell>
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
