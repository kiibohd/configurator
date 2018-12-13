import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardHeader, CardContent, TextField, IconButton } from '../mui';
import { EditIcon, CloseIcon, CheckIcon } from '../icons';
import { useSettingsState, updateUri } from '../state/settings';

// TODO: Useful elsewhere... Add Validation
function ModedTextField(props) {
  const { classes, defaultValue, onSave } = props;
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => setValue(defaultValue), [defaultValue, editMode]);

  const enableEdit = () => {
    setEditMode(true);
  };

  const cancel = () => {
    setEditMode(false);
  };

  const save = () => {
    onSave(value);
    setEditMode(false);
  };

  return (
    <div>
      <TextField
        className={classes.field}
        label="Base URI"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={!editMode}
      />
      {!editMode && (
        <IconButton onClick={enableEdit}>
          <EditIcon />
        </IconButton>
      )}
      {editMode && (
        <>
          <IconButton onClick={cancel}>
            <CloseIcon />
          </IconButton>
          <IconButton onClick={save}>
            <CheckIcon />
          </IconButton>
        </>
      )}
    </div>
  );
}

ModedTextField.propTypes = {
  classes: PropTypes.object.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired
};

const styles = () => ({
  text: {
    fontStyle: 'oblique'
  },
  field: {
    minWidth: '20em'
  }
});

function Preferences(props) {
  const { classes } = props;
  const [uri] = useSettingsState('uri');

  return (
    <Card className={classes.card}>
      <CardHeader title="Advanced" subheader="WARNING: Changing these could cause instability" />
      <CardContent>
        <ModedTextField classes={classes} defaultValue={uri} onSave={updateUri} />
      </CardContent>
    </Card>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
