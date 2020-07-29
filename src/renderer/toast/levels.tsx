import React, { ReactNode } from 'react';
import GenericToast from './generic';

type ToastProps = {
  message?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode[];
};

export function SuccessToast(props: ToastProps): JSX.Element {
  return <GenericToast variant="success" {...props} />;
}

export function ErrorToast(props: ToastProps): JSX.Element {
  return <GenericToast variant="error" {...props} />;
}

export function WarningToast(props: ToastProps): JSX.Element {
  return <GenericToast variant="warning" {...props} />;
}

export function InfoToast(props: ToastProps): JSX.Element {
  return <GenericToast variant="info" {...props} />;
}
