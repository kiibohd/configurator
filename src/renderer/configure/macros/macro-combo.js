import React, { Fragment, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles, IconButton } from '../../mui';
import { getKeyFromAlias } from '../../../common/keys/firmware';
import { PlusOutlineIcon, PlusCircleOutlineIcon, RecordRecIcon, CloseCircleOutlineIcon } from '../../icons';
import MacroKey from './macro-key';
import _ from 'lodash';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 10,
    border: '1px dashed darkgray',
    borderRadius: 4,
    minWidth: 64,
    minHeight: 64
  },
  invalid: {
    borderColor: 'red !important'
  },
  keys: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 64,
    minHeight: 64
  },
  soloButton: {
    marginLeft: 8
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
      cursor: 'pointer'
    }
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
      cursor: 'pointer'
    }
  }
};

/**
 * @param {{classes: Object, combo: string[], onChange?: (updated: string[]) => void, onRecord?: () => void }} props
 */
function MacroCombo(props) {
  const { classes, combo, onChange, onRecord } = props;
  const [hovering, setHovering] = useState(false);

  const mapped = combo.map(getKeyFromAlias);

  const changeKey = (idx, key) => {
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
  const unassigned = empty || combo.some(x => x === '');

  return (
    <div
      className={classNames(classes.container, { [classes.invalid]: empty || unassigned })}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={classes.keys}>
        {mapped.map((c, idx) => (
          <Fragment key={idx}>
            <MacroKey cap={c || {}} onChange={x => changeKey(idx, x)} />
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
  classes: PropTypes.object.isRequired,
  combo: PropTypes.array.isRequired,
  onRecord: PropTypes.func,
  onChange: PropTypes.func
};

export default withStyles(styles)(MacroCombo);
