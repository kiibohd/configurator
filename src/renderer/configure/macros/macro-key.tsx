import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '../../mui';
import Cap from '../cap';
import { CloseCircleOutlineIcon } from '../../icons';
import QuickKeyAssignDialog from '../quick-key-assign-dialog';
import _ from 'lodash';
import { keymap } from '../../../common/keys/predefined';
import { PredefinedKey, BaseKey } from '../../../common/keys';

const useStyles = makeStyles({
  container: {
    position: 'relative'
  },
  clear: {
    position: 'absolute',
    color: 'gray',
    backgroundColor: 'white',
    borderRadius: '50%',
    borderWidth: 0,
    right: -5,
    top: -5,
    zIndex: 2,

    '&:hover': {
      color: 'black',
      cursor: 'pointer'
    }
  }
} as const);

type MacroKeyProps = {
  cap: PredefinedKey;
  onChange: (key: string | null) => void;
};

export default function MacroKey(props: MacroKeyProps) {
  const classes = useStyles(props);
  const { cap, onChange } = props;
  const [hovering, setHovering] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const clear = () => onChange(null);
  const click = () => {
    setAssignDialogOpen(true);
  };
  const select = (pkey: BaseKey | null) => {
    setAssignDialogOpen(false);
    if (pkey) {
      const key = keymap[pkey.key];
      onChange(_.head(key.aliases) ?? null);
    } else {
      onChange(null);
    }
  };
  const closeDialog = () => setAssignDialogOpen(false);

  return (
    <div className={classes.container} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      {hovering && <CloseCircleOutlineIcon className={classes.clear} onClick={clear} />}
      <Cap cap={cap} onClick={click} />
      <QuickKeyAssignDialog open={assignDialogOpen} onSelect={select} onClose={closeDialog} />
    </div>
  );
}

MacroKey.propTypes = {
  cap: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};
