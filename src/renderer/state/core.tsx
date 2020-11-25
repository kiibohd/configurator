import { createSharedState } from '../shared-state/index';
import _ from 'lodash';
import React from 'react';
import { GenericToast } from '../toast';
import { paths } from '../env';
import path from 'path';
import { AttachedKeyboard, KeyboardFamily, loadFromFile, Variant } from '../../common/keyboards';

const Panels = {
  KeyboardSelect: 'Keyboard Select',
  VariantSelect: 'Variant Select',
  Flash: 'Flash',
  Settings: 'Settings',
  ConfigureKeys: 'Configure Keys',
  ConfigureVisuals: 'Config Visuals',
} as const;

type ValidPanels = ValueOf<typeof Panels>;

const Actions = {
  Compile: 'compile-firmware',
};

type CoreState = {
  executing: string[];
  panel: ValidPanels;
  loading: boolean;
  history: ValidPanels[];
  keyboardFamily?: KeyboardFamily;
  keyboard?: AttachedKeyboard;
  variant?: Variant;
  toast?: JSX.Element;
  toolbarButtons?: JSX.Element;
};

const initialState: CoreState = {
  executing: [],
  panel: Panels.KeyboardSelect,
  loading: false,
  history: [],
  keyboardFamily: undefined,
  keyboard: undefined,
  variant: undefined,
  toast: undefined,
  toolbarButtons: undefined,
};

const { useSharedState: useCoreState, setSharedState: setCoreState } = createSharedState(initialState);

export { Actions, Panels, useCoreState };

export function reset(): void {
  setCoreState('loading', false);
  setCoreState('keyboard', undefined);
  setCoreState('variant', undefined);
  setCoreState('toast', undefined);
}

export function startExecuting(name: string): void {
  setCoreState('executing', (curr) => [...curr, name]);
}

export function stopExecuting(name: string): void {
  setCoreState('executing', (curr) => _.without(curr, name));
}

export function updateToolbarButtons(buttons: Optional<JSX.Element>): void {
  setCoreState('toolbarButtons', buttons);
}

export function updateSelectedKeyboard(keyboard: Optional<AttachedKeyboard>): void {
  setCoreState('keyboard', keyboard);
  setCoreState('panel', Panels.VariantSelect);
}

export function updateSelectedVariant(variant: Optional<Variant>): void {
  setCoreState('panel', Panels.ConfigureKeys);
  setCoreState('variant', variant);
}

export function updatePanel(panel: ValidPanels): void {
  setCoreState('panel', (currPanel) => {
    setCoreState('history', (hist) => [currPanel, ...hist.slice(0, 3)]);
    return panel;
  });
}

export function popupToast(toast?: JSX.Element, timeout = 10000): void {
  setCoreState('toast', toast);
  setTimeout(() => {
    setCoreState('toast', undefined);
  }, timeout);
}

export function popupSimpleToast(level: 'error' | 'success' | 'info' | 'warning', msg: string): void {
  popupToast(<GenericToast variant={level} message={<span>{msg}</span>} onClose={() => popupToast()} />);
}

export function previousPanel(): void {
  setCoreState('history', (currHistory) => {
    const history = [...currHistory];
    setCoreState('panel', history.shift() ?? Panels.KeyboardSelect);
    return history;
  });
}

export function toggleLoading(): void {
  setCoreState('loading', (curr) => !curr);
}

export async function loadAvailableKeyboards(configName = 'input-club'): Promise<void> {
  const filepath = path.join(paths.config, configName + '.json');
  const family = await loadFromFile(filepath);

  setCoreState('keyboardFamily', family);
}
