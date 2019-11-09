import React from 'react';
import PropTypes from 'prop-types';
import GenericToast from './generic';
import electron from 'electron';

type NewVersionToastProps = {
  version: string;
  url: string;
  onClose?: () => void;
};

export default function NewVersionToast(props: NewVersionToastProps) {
  const { version, url, onClose } = props;
  const click = () => {
    electron.shell.openExternal(url);
    onClose && onClose();
  };

  return (
    <GenericToast
      variant="success"
      message={
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={click}>
          New version available ({version}) (click to open)
        </span>
      }
      onClose={onClose}
    />
  );
}

NewVersionToast.propTypes = {
  version: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func
};
