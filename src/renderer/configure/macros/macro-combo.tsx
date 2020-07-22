import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { makeStyles, IconButton } from '../../mui';
import { getKeyFromAlias } from '../../../common/keys/firmware';
import { PlusOutlineIcon, PlusCircleOutlineIcon, RecordRecIcon, CloseCircleOutlineIcon } from '../../icons';
import MacroKey from './macro-key';
import _ from 'lodash';
import { PredefinedKey } from '../../../common/keys';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 10,
    border: '1px dashed darkgray',
    borderRadius: 4,
    minWidth: 64,
    minHeight: 64,
  },
  invalid: {
    borderColor: 'red !important',
  },
  keys: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 64,
    minHeight: 64,
  },
  soloButton: {
    marginLeft: 8,
  },
  record: {
    position: 'absolute',
    color: 'gray',
    backgroundColor: 'white',
    borderRadius: '50%',
    borderWidth: 0,
    left: -15,
    top: -15,
    zIndex: 2,

    '&:hover': {
      color: 'black',
      cursor: 'pointer',
    },
  },
  clear: {
    position: 'absolute',
    color: 'gray',
    backgroundColor: 'white',
    borderRadius: '50%',
    borderWidth: 0,
    right: -15,
    top: -10,
    fontSize: 28,
    zIndex: 2,

    '&:hover': {
      color: 'black',
      cursor: 'pointer',
    },
  },
  actions: {},
} as const);

type MacroComboProps = {
  combo: string[];
  onChange: (updated: string[] | null) => void;
  onRecord?: () => void;
};

export default function MacroCombo(props: MacroComboProps) {
  const classes = useStyles(props);
  const { combo, onChange, onRecord } = props;
  const [hovering, setHovering] = useState(false);

  const mapped = combo.map(getKeyFromAlias);

  const changeKey = (idx: number, key: string | null) => {
    if (_.isNil(key)) {
      onChange(_.without(combo, combo[idx]));
    } else {
      const updated = [...combo];
      updated[idx] = key;
      onChange(updated);
    }
    setHovering(false);
  };

  const addKey = () => {
    const updated = [...combo, ''];
    onChange(updated);
  };

  const clear = () => {
    onChange(null);
  };

  const empty = combo.length === 0;
  const unassigned = empty || combo.some((x) => x === '');

  function blankKey(): PredefinedKey {
    return {
      name: '',
      label: '',
      aliases: [],
      triggerDef: 0,
      resultDef: 0,
      order: 0,
      style: {},
    };
  }

  return (
    <div
      className={classNames(classes.container, { [classes.invalid]: empty || unassigned })}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={classes.keys}>
        {mapped.map((c, idx) => (
          <Fragment key={idx}>
            <MacroKey cap={c || blankKey()} onChange={(x) => changeKey(idx, x)} />
            {idx < combo.length - 1 && <PlusOutlineIcon />}
          </Fragment>
        ))}
        {hovering && (
          <div className={classes.actions}>
            <IconButton className={classNames({ [classes.soloButton]: empty })} onClick={addKey}>
              <PlusCircleOutlineIcon />
            </IconButton>
          </div>
        )}
      </div>
      {hovering && (
        <>
          {onRecord && <RecordRecIcon fontSize="large" className={classes.record} onClick={onRecord} />}
          <CloseCircleOutlineIcon className={classes.clear} onClick={clear} />
        </>
      )}
    </div>
  );
}

MacroCombo.propTypes = {
  combo: PropTypes.array.isRequired,
  onRecord: PropTypes.func,
  onChange: PropTypes.func.isRequired,
};
