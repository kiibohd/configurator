import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Dialog, TextField, DialogContent, DialogActions } from '../mui';

const styled = withStyles({
  //TODO: this should probably be passed in.
  text: {
    minWidth: '30em'
  }
});

function AlterFieldModal(props) {
  const { classes, open, onClose, value, name, saveText = 'Save', validation = () => {} } = props;
  const [currValue, setCurrValue] = useState(value);
  const [error, setError] = useState(validation(value));
  const [dirty, setDirty] = useState(false);

  // Reset the current value when open changes
  useEffect(
    () => {
      setCurrValue(value);
      setError(validation(value));
      setDirty(false);
    },
    [open]
  );

  const cancel = () => onClose(false);
  const save = e => {
    e.preventDefault();
    onClose(true, currValue);
  };
  const update = e => {
    const val = e.target.value;
    setDirty(true);
    setCurrValue(val);
    setError(validation(val));
  };

  return (
    <Dialog open={open} onClose={cancel}>
      <DialogContent>
        <form onSubmit={save}>
          <TextField
            value={currValue}
            onChange={update}
            onBlur={() => setDirty(true)}
            label={name}
            fullWidth
            className={classes.text}
            helperText={dirty ? error : ''}
            error={dirty && !!error}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={!dirty || !!error}>
          {saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AlterFieldModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.any.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  validation: PropTypes.func,
  saveText: PropTypes.string
};

export default styled(AlterFieldModal);
