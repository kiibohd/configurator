import React, { Fragment, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Dialog, DialogContent, DialogContentText, DialogActions, DialogTitle, Button } from '../../mui';
import Cap from '../cap';
import { useSettingsState } from '../../state';
import { locales } from '../../../common/keys';
import { getKey } from '../../../common/keys/firmware';
import _ from 'lodash';
import { PlusOutlineIcon } from '../../icons';

/** @type {import('../../theme').ThemedCssProperties} */
const styles = theme => ({
  dialog: {
    fontFamily: theme.typography.fontFamily
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  combo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 20
  },
  keys: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    border: '1px dashed darkgray',
    borderRadius: 4,
    minWidth: 64,
    minHeight: 64
  },
  separator: {
    fontSize: 36,
    fontWeight: 'bolder',
    alignSelf: 'flex-end',
    margin: '10px 15px'
  }
});

/** @typedef {import('../../../common/keys/predefined').PredefinedKey} PredefinedKey */
/**
 * @typedef State
 * @property {PredefinedKey[][]} macro
 * @property {PredefinedKey[]} held
 */
/**
 * @typedef Action
 * @property {'reset'|'press'|'release'} type
 * @property {PredefinedKey} [payload]
 */

/** @type {State} */
const initialState = { macro: [], held: [] };
/**
 *
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'press':
      if (state.held.length) {
        const updated = [...state.macro];
        updated[updated.length - 1] = [..._.last(state.macro), action.payload];
        return { macro: updated, held: [...state.held, action.payload] };
      }
      return { macro: [...state.macro, [action.payload]], held: [action.payload] };
    case 'release':
      return {
        macro: state.macro,
        held: _.without(state.held, action.payload)
      };
    default:
      return state;
  }
}

function RecordMacroDialog(props) {
  const { classes, open, onClose, onSave } = props;
  const [localeName] = useSettingsState('locale');
  const [state, dispatch] = useReducer(reducer, initialState);

  /** @type {(e: KeyboardEvent) => PredefinedKey} */
  const targetKey = e => {
    const locale = locales[localeName];
    const adj = e.keyCode + 1000 * e.location;
    const key = locale.iec2key[locale.code2iec[e.keyCode]];
    const adjKey = locale.iec2key[locale.code2iec[adj]];

    const localKey = adjKey || key;
    if (!localKey) {
      console.warn(`unrecognized code '${e.keyCode}' - '${e.key}'`);
      return null;
    }

    const fwKey = getKey(localKey.key);
    return fwKey;
  };

  /** @type {(e: KeyboardEvent) => void} */
  const keydown = e => {
    e.stopPropagation();
    e.preventDefault();
    if (e.repeat) {
      return;
    }

    dispatch({ type: 'press', payload: targetKey(e) });
  };

  /** @type {(e: KeyboardEvent) => void} */
  const keyup = e => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'release', payload: targetKey(e) });
  };

  const save = () => {
    const mapped = state.macro.map(xs => xs.map(x => _.head(x.aliases)));
    onSave(mapped);
  };

  useEffect(
    () => {
      if (open) {
        document.addEventListener('keyup', keyup);
        document.addEventListener('keydown', keydown);
      }
      return () => {
        document.removeEventListener('keyup', keyup);
        document.removeEventListener('keydown', keydown);
      };
    },
    [open]
  );

  useEffect(() => dispatch({ type: 'reset' }), [open]);

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose} className={classes.dialog}>
      <DialogTitle>Record Macro</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Press keys to record macro. Note: Type slowly to ensure keypresses are registered individually.
        </DialogContentText>
        <div className={classes.container}>
          {state.macro.map((combo, iCombo) => (
            <Fragment key={iCombo}>
              <div className={classes.combo}>
                <div className={classes.keys}>
                  {combo.map((x, iKey) => (
                    <Fragment key={iKey}>
                      <Cap cap={x} />
                      {iKey < combo.length - 1 && <PlusOutlineIcon />}
                    </Fragment>
                  ))}
                </div>
              </div>
              {iCombo < state.macro.length - 1 && <span className={classes.separator}>,</span>}
            </Fragment>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch({ type: 'reset' })} color="secondary">
          Clear
        </Button>
        <div style={{ flex: '1' }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={save} color="primary" disabled={!state.macro.length}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RecordMacroDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default withStyles(styles)(RecordMacroDialog);
