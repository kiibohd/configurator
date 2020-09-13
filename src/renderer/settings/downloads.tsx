import React, { useState, useEffect } from 'react';
import { makeStyles, Table, TableHead, TableBody, TableCell, TableRow, IconButton } from '../mui';
import { FlashOnIcon } from '../icons';
import db from '../db';
import { keyboards } from '../../common/device/keyboard';
import Bluebird from 'bluebird';
import _ from 'lodash';
import { tooltipped } from '../utils';
import { setLastDl } from '../state/settings';
import { updatePanel, Panels, popupSimpleToast } from '../state/core';
import { FirmwareResult, normalizeFirmwareResult } from '../local-storage/firmware';

const useStyles = makeStyles({
  text: {
    fontStyle: 'oblique',
  },
  container: {},
} as const);

export default function Downloads(): JSX.Element {
  const classes = useStyles({});
  const [dls, setDls] = useState<FirmwareResult[]>([]);
  const names = _.fromPairs(keyboards.map((k) => [_.head(k.names), k.display]));

  useEffect(() => {
    db.dl
      .keys()
      .then((keys) => Bluebird.all(keys.map((k) => db.dl.get<FirmwareResult>(k))))
      .then((dls) => setDls(dls.filter((x) => x !== null).reverse() as FirmwareResult[]));
  }, []);

  const flash = (dl: FirmwareResult) => {
    // HACK - Replace when moved over to react-router MemoryRouter
    const normalized = normalizeFirmwareResult(dl);

    if (!normalized) {
      popupSimpleToast('error', 'Cannot flash previously downloaded firmware as it appears to be corrupt.');
      return;
    }

    setLastDl(normalized);
    updatePanel(Panels.Flash);
  };

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
          {dls.map((dl) => (
            <TableRow key={dl.time}>
              <TableCell>{names[dl.board]}</TableCell>
              <TableCell>{dl.layout}</TableCell>
              <TableCell>{new Date(dl.time).toLocaleString('en-us')}</TableCell>
              <TableCell>
                {tooltipped(
                  'Flash Firmware',
                  <IconButton onClick={() => flash(dl)}>
                    <FlashOnIcon fontSize="small" />
                  </IconButton>
                )}
                {/* TODO: Load Config Button */}
                {/* TODO: Delete Download Button */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
