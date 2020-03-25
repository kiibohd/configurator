import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, TextField, IconButton } from '../mui';
import { EditIcon, CloseIcon, CheckIcon } from '../icons';

const useStyles = makeStyles({
  field: {
    minWidth: '20em',
  },
} as const);

type ModedTextFieldProps = {
  defaultValue: string;
  onSave: (value: string) => void;
  label?: string;
};

// TODO:  Add Validation
export default function ModedTextField(props: ModedTextFieldProps) {
  const classes = useStyles(props);
  const { defaultValue, onSave, label } = props;
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
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  defaultValue: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  label: PropTypes.string,
};
