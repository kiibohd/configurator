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

/**
 * @type{{
 *  executing: string[]
 *  panel: string
 *  loading: boolean
 *  history: string[]
 *  keyboard: import('../../common/device/types').AttachedKeyboard
 *  variant: string
 *  toast: JSX.Element
 *  toolbarButtons: JSX.Element
 * }} */
const initialState = {
  executing: [],
  panel: Panels.KeyboardSelect,
  loading: false,
  history: [],
  keyboard: undefined,
  variant: undefined,
  toast: undefined,
  toolbarButtons: undefined
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
/**
 * @param {JSX.Element} buttons
 */
export function updateToolbarButtons(buttons) {
  setCoreState('toolbarButtons', buttons);
}

/**
 * @param {import('../../common/device/types').AttachedKeyboard} keyboard
 */
export function updateSelectedKeyboard(keyboard) {
  setCoreState('keyboard', keyboard);
  setCoreState('panel', Panels.VariantSelect);
}

/**
 * @param {string} variant
 */
export function updateSelectedVariant(variant) {
  setCoreState('panel', Panels.ConfigureKeys);
  setCoreState('variant', variant);
}

/**
 * @param {string} panel
 */
export function updatePanel(panel) {
  setCoreState('panel', currPanel => {
    setCoreState('history', hist => [currPanel, ...hist.slice(0, 3)]);
    return panel;
  });
}

/**
 * @param {JSX.Element} toast
 * @param {number} timeout
 */
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
