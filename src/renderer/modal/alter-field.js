import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Modal, TextField } from '../mui';

const styled = withStyles(theme => ({
  paper: {
    marginTop: '30%',
    marginLeft: '25%',
    width: '50vw',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
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
  const { classes, open, onClose, value, name, saveText = 'Save' } = props;
  const [currValue, setCurrValue] = useState(value);

  const cancel = () => onClose(false);
  const save = () => onClose(true, currValue);

  return (
    <Modal open={open} onClose={cancel}>
    <form>
      <div className={classes.paper}>
        <TextField value={currValue} onChange={e => setCurrValue(e.target.value)} label={name} fullWidth />
        <div className={classes.actions}>
          <div className={classes.spacer} />
          <Button onClick={cancel}>Cancel</Button>
          <Button onClick={save} type="submit">{saveText}</Button>
        </div>
      </div>
</form>
    </Modal>
  );
}

AlterFieldModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.any.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  saveText: PropTypes.string
};

export default styled(AlterFieldModal);
