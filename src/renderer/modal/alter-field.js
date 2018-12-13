import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Modal, TextField } from '../mui';

const styled = withStyles(theme => ({
  paper: {
    marginTop: '30%',
    marginLeft: '25%',
    width: '50vw',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: `${theme.spacing.unit * 2}px`,
    paddingBottom: `${theme.spacing.unit}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  actions: {
    display: 'flex',
    minHeight: 40,
    margin: `${theme.spacing.unit}px 0`
  },
  spacer: {
    flex: '1'
  }
}));

function AlterFieldModal(props) {
  const { classes, open, onClose, value, name, saveText = 'Save', validation = () => {} } = props;
  const [currValue, setCurrValue] = useState(value);
  const [error, setError] = useState(validation(value));
  const [dirty, setDirty] = useState(false);

  // Reset the current value when open changes
  useEffect(
    () => {
      setCurrValue(value);
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
    <Modal open={open} onClose={cancel}>
      <div className={classes.paper}>
        <form onSubmit={save}>
          <TextField
            value={currValue}
            onChange={update}
            onBlur={() => setDirty(true)}
            label={name}
            fullWidth
            helperText={dirty ? error : ''}
            error={dirty && !!error}
          />
          <div className={classes.actions}>
            <div className={classes.spacer} />
            <Button onClick={cancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty || !!error}>
              {saveText}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
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
