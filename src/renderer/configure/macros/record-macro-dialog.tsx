import React, { Fragment, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  makeStyles,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  Button,
  Theme,
} from '../../mui';
import Cap from '../cap';
import { useSettingsState } from '../../state';
import { locales, PredefinedKey, BaseKey } from '../../../common/keys';
import { getKey } from '../../../common/keys/firmware';
import _ from 'lodash';
import { PlusOutlineIcon } from '../../icons';
import log from 'loglevel';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      dialog: {
        fontFamily: theme.typography.fontFamily,
      },
      container: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      },
      combo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
      },
      keys: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        border: '1px dashed darkgray',
        borderRadius: 4,
        minWidth: 64,
        minHeight: 64,
      },
      separator: {
        fontSize: 36,
        fontWeight: 'bolder',
        alignSelf: 'flex-end',
        margin: '10px 15px',
      },
    } as const)
);

type State = {
  macro: PredefinedKey[][];
  held: PredefinedKey[];
};

type ResetAction = {
  type: 'reset';
};

type KeyAction = {
  type: 'press' | 'release';
  payload: PredefinedKey;
};

type Action = ResetAction | KeyAction;

const initialState: State = { macro: [], held: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'press':
      if (state.held.length) {
        const updated = [...state.macro];
        updated[updated.length - 1] = [...(_.last(state.macro) ?? []), action.payload];
        return { macro: updated, held: [...state.held, action.payload] };
      }
      return { macro: [...state.macro, [action.payload]], held: [action.payload] };
    case 'release':
      return {
        macro: state.macro,
        held: _.without(state.held, action.payload),
      };
    default:
      return state;
  }
}

type RecordMacroDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (value: string[][]) => void;
};

export default function RecordMacroDialog(props: RecordMacroDialogProps): JSX.Element {
  const classes = useStyles(props);
  const { open, onClose, onSave } = props;
  const [localeName] = useSettingsState('locale');
  const [state, dispatch] = useReducer(reducer, initialState);

  const targetKey = (e: KeyboardEvent): PredefinedKey | null | undefined => {
    const locale = locales[localeName];
    const adj = e.keyCode + 1000 * e.location;

    const iec = locale.code2iec[e.keyCode];
    const adjIec = locale.code2iec[adj];

    const key = iec ? locale.iec2key[iec] : undefined;
    const adjKey = adjIec ? locale.iec2key[adjIec] : undefined;

    const localKey: Optional<BaseKey> = adjKey || key;
    if (!localKey) {
      log.warn(`unrecognized code '${e.keyCode}' - '${e.key}'`);
      return null;
    }

    const fwKey = getKey(localKey);
    return fwKey;
  };

  const keydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.repeat) {
      return;
    }
    const key = targetKey(e);
    if (!key) {
      return;
    }

    dispatch({ type: 'press', payload: key });
  };

  const keyup = (e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const key = targetKey(e);
    if (!key) {
      return;
    }

    dispatch({ type: 'release', payload: key });
  };

  const save = () => {
    // TODO: Solve the undefined madness
    const mapped = state.macro.map((xs) => xs.map((x) => _.head(x.aliases)));
    onSave(mapped as string[][]);
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('keyup', keyup);
      document.addEventListener('keydown', keydown);
    }
    return () => {
      document.removeEventListener('keyup', keyup);
      document.removeEventListener('keydown', keydown);
    };
  }, [open]);

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
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
