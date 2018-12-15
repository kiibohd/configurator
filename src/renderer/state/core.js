import { createSharedState } from '../shared-state/index';
import _ from 'lodash';

const Panels = {
  KeyboardSelect: 'Keyboard Select',
  VariantSelect: 'Variant Select',
  Flash: 'Flash',
  Settings: 'Settings',
  ConfigureKeys: 'Configure Keys',
  ConfigureVisuals: 'Config Visuals'
};

const Actions = {
  Compile: 'compile-firmware'
};

const initialState = {
  executing: [],
  panel: Panels.KeyboardSelect,
  loading: false,
  history: [],
  keyboard: undefined,
  variant: undefined,
  toast: undefined,
  toolbarButtons: []
};

const { useSharedState: useCoreState, setSharedState: setCoreState } = createSharedState(initialState);

export { Actions, Panels, useCoreState };

export function reset() {
  setCoreState('loading', false);
  setCoreState('keyboard', undefined);
  setCoreState('variant', undefined);
  setCoreState('toast', undefined);
}

/**
 * @param {string} name
 */
export function startExecuting(name) {
  setCoreState('executing', curr => [...curr, name]);
}

/**
 * @param {string} name
 */
export function stopExecuting(name) {
  setCoreState('executing', curr => _.without(curr, name));
}

export function updateToolbarButtons(buttons) {
  setCoreState('toolbarButtons', buttons);
}

export function updateSelectedKeyboard(keyboard) {
  setCoreState('keyboard', keyboard);
  setCoreState('panel', Panels.VariantSelect);
}

export function updateSelectedVariant(variant) {
  setCoreState('panel', Panels.ConfigureKeys);
  setCoreState('variant', variant);
}

export function updatePanel(panel) {
  setCoreState('panel', currPanel => {
    setCoreState('history', hist => [currPanel, ...hist.slice(0, 3)]);
    return panel;
  });
}

export function popupToast(toast, timeout = 10000) {
  setCoreState('toast', toast);
  setTimeout(() => {
    setCoreState('toast', undefined);
  }, timeout);
}

export function previousPanel() {
  setCoreState('history', currHistory => {
    const history = [...currHistory];
    setCoreState('panel', history.shift());
    return history;
  });
}

export function toggleLoading() {
  setCoreState('loading', curr => !curr);
}
