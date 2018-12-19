import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles, IconButton } from '../../mui';
import { PlusCircleOutlineIcon } from '../../icons';
import MacroCombo from './macro-combo';
import RecordMacroDialog from './record-macro-dialog';
import _ from 'lodash';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  hidden: {
    display: 'none'
  },
  separator: {
    fontSize: 36,
    fontWeight: 'bolder',
    alignSelf: 'flex-end',
    margin: '10px 15px'
  }
};

/**
 * @param {{classes: Object, seq: string[][], onChange?: (updated: string[][]) => void }} props
 */
function MacroSequence(props) {
  const { classes, seq, onChange } = props;
  const [recording, setRecording] = useState(false);

  /** @type {(update: string[], idx: number) => void} */
  const change = (combo, idx) => {
    if (_.isNil(combo)) {
      onChange(_.without(seq, seq[idx]));
    } else {
      const updated = [...seq];
      updated[idx] = combo;
      onChange(updated);
    }
  };

  const newCombo = () => {
    const updated = [...seq, []];

    onChange && onChange(updated);
  };

  const record = () => {
    setRecording(true);
  };

  const stopRecording = result => {
    onChange && onChange(result);
    setRecording(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.container}>
        {seq.map((m, idx) => (
          <Fragment key={idx}>
            <MacroCombo
              combo={m}
              onChange={update => change(update, idx)}
              onRecord={seq.length === 1 && !seq[0].length ? record : undefined}
            />
            {idx < seq.length - 1 && <span className={classes.separator}>,</span>}
          </Fragment>
        ))}
      </div>
      <div className={classNames(classes.actions, { [classes.hidden]: _.last(seq).length === 0 })}>
        <IconButton onClick={newCombo}>
          <PlusCircleOutlineIcon />
        </IconButton>
      </div>
      <RecordMacroDialog open={recording} onClose={stopRecording} />
    </div>
  );
}

MacroSequence.propTypes = {
  classes: PropTypes.object.isRequired,
  seq: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default withStyles(styles)(MacroSequence);
