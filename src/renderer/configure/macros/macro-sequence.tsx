import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { makeStyles, IconButton } from '../../mui';
import { PlusCircleOutlineIcon } from '../../icons';
import MacroCombo from './macro-combo';
import RecordMacroDialog from './record-macro-dialog';
import _ from 'lodash';

const useStyles = makeStyles({
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
  },
  actions: {}
} as const);

type MacroSequenceProps = {
  seq: string[][];
  onChange?: (updated: string[][]) => void;
};

export default function MacroSequence(props: MacroSequenceProps) {
  const classes = useStyles(props);
  const { seq, onChange } = props;
  const [recording, setRecording] = useState(false);

  const change = (combo: string[] | null, idx: number) => {
    if (_.isNil(combo)) {
      onChange && onChange(_.without(seq, seq[idx]));
    } else {
      const updated = [...seq];
      updated[idx] = combo;
      onChange && onChange(updated);
    }
  };

  const newCombo = () => {
    const updated = [...seq, []];

    onChange && onChange(updated);
  };

  const record = () => {
    setRecording(true);
  };

  const stopRecording = (result: string[][]) => {
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
      <div className={classNames(classes.actions, { [classes.hidden]: (_.last(seq) ?? []).length === 0 })}>
        <IconButton onClick={newCombo}>
          <PlusCircleOutlineIcon />
        </IconButton>
      </div>
      <RecordMacroDialog open={recording} onClose={() => setRecording(false)} onSave={stopRecording} />
    </div>
  );
}

MacroSequence.propTypes = {
  seq: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};
