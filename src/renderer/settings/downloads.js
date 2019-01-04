import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Table, TableHead, TableBody, TableCell, TableRow /*, IconButton*/ } from '../mui';
import db from '../db';
import { keyboards } from '../../common/device/keyboard';
import Bluebird from 'bluebird';
import _ from 'lodash';

/** @type {import('../theme').CssProperties} */
const styles = {
  text: {
    fontStyle: 'oblique'
  }
};

function Downloads(props) {
  const { classes } = props;
  /** @type {[import('../local-storage/firmware').FirmwareResult[], (val: any) => void} */
  const [dls, setDls] = useState([]);
  const names = _.fromPairs(keyboards.map(k => [_.head(k.names), k.display]));

  useEffect(() => {
    db.dl
      .keys()
      .then(keys => Bluebird.all(keys.map(k => db.dl.get(k))))
      .then(dls => setDls(dls.reverse()));
  }, []);

  return (
    <div className={classes.container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Keyboard</TableCell>
            <TableCell>Layout</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dls.map(dl => (
            <TableRow key={dl.time}>
              <TableCell>{names[dl.board]}</TableCell>
              <TableCell>{dl.layout}</TableCell>
              <TableCell>{new Date(dl.time).toLocaleString('en-us')}</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

Downloads.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Downloads);
