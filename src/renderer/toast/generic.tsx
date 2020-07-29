import React, { ReactNode } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { makeStyles, amber, green, IconButton, SnackbarContent, Theme } from '../mui';
import { CheckCircleIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '../icons';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      message: {
        display: 'flex',
        alignItems: 'center',
      },
      icon: {
        fontSize: 20,
      },
      statusIcon: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
      },
      success: {
        backgroundColor: green[600],
      },
      error: {
        backgroundColor: theme.palette.error.dark,
      },
      info: {
        backgroundColor: theme.palette.primary.light,
      },
      warning: {
        backgroundColor: amber[700],
      },
      close: {},
    } as const)
);

type IconType = 'error' | 'success' | 'info' | 'warning';

function icon(variant: IconType, className: string) {
  switch (variant) {
    case 'error':
      return <ErrorIcon className={className} />;
    case 'success':
      return <CheckCircleIcon className={className} />;
    case 'info':
      return <InfoIcon className={className} />;
    case 'warning':
      return <WarningIcon className={className} />;
  }
}

type GenericToastProps = {
  variant: IconType;
  message?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode[];
};

export default function GenericToast(props: GenericToastProps): JSX.Element {
  const classes = useStyles(props);
  const { variant, message, onClose, actions = [] } = props;

  const statusIcon = icon(variant, classNames(classes.icon, classes.statusIcon));

  const closeButton = (
    <IconButton className={classes.close} key="close" color="inherit" onClick={() => onClose && onClose()}>
      <CloseIcon className={classes.icon} />
    </IconButton>
  );

  const composed = (
    <span className={classes.message}>
      {statusIcon}
      {message}
    </span>
  );

  return <SnackbarContent className={classes[variant]} message={composed} action={[...actions, closeButton]} />;
}

GenericToast.propTypes = {
  message: PropTypes.node,
  onClose: PropTypes.func,
  actions: PropTypes.array,
  variant: PropTypes.oneOf(['error', 'success', 'info', 'warning']).isRequired as PropTypes.Validator<IconType>,
};
