export enum Alert {
  None = 'none',
  NoFlashable = 'no-flashable',
  Dfu = 'dfu',
  Bin = 'bin',
}

export enum Stage {
  Setup = 'setup',
  Flashing = 'flashing',
  Failed = 'failed',
  Success = 'success',
}

export enum Failure {
  DfuNotFound = 'dfu-not-found',
  DeviceNotFound = 'device-not-found',
  Other = 'other',
}

type BaseState = {
  binPath: string;
  dfuPath: string;
  alert: Alert;
  stage: Stage;
};

export type ReadyState = {
  alert: Alert.None;
  stage: Stage.Setup;
} & BaseState;

export type WarningState = {
  alert: Alert.NoFlashable;
  showResetHelp: boolean;
  stage: Stage.Setup;
} & BaseState;

export type ErrorState = {
  alert: Alert.Dfu | Alert.Bin;
  showResetHelp: boolean;
  stage: Stage.Setup;
} & BaseState;

export type FlashingState = {
  progress: string;
  stage: Stage.Flashing;
} & BaseState;

export type FailureState = {
  progress: string;
  stage: Stage.Failed;
  failure: Failure;
  code: number;
} & BaseState;

export type SuccessState = {
  progress: string;
  stage: Stage.Success;
} & BaseState;

export type State = ReadyState | WarningState | ErrorState | FlashingState | FailureState | SuccessState;
