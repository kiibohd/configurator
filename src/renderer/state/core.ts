import { createSharedState } from '../shared-state/index';
import _ from 'lodash';
import { AttachedKeyboard } from '../../common/device/types';

const Panels = {
  KeyboardSelect: 'Keyboard Select',
  VariantSelect: 'Variant Select',
  Flash: 'Flash',
  Settings: 'Settings',
  ConfigureKeys: 'Configure Keys',
  ConfigureVisuals: 'Config Visuals'
} as const;

type ValidPanels = ValueOf<typeof Panels>;

const Actions = {
  Compile: 'compile-firmware'
};

type CoreState = {
  executing: string[];
  panel: ValidPanels;
  loading: boolean;
  history: ValidPanels[];
  keyboard?: AttachedKeyboard;
  variant?: string;
  toast?: JSX.Element;
  toolbarButtons?: JSX.Element;
};

const initialState: CoreState = {
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

export function startExecuting(name: string) {
  setCoreState('executing', curr => [...curr, name]);
}

export function stopExecuting(name: string) {
  setCoreState('executing', curr => _.without(curr, name));
}

export function updateToolbarButtons(buttons: Optional<JSX.Element>) {
  setCoreState('toolbarButtons', buttons);
}

export function updateSelectedKeyboard(keyboard: Optional<AttachedKeyboard>) {
  setCoreState('keyboard', keyboard);
  setCoreState('panel', Panels.VariantSelect);
}

export function updateSelectedVariant(variant: Optional<string>) {
  setCoreState('panel', Panels.ConfigureKeys);
  setCoreState('variant', variant);
}

export function updatePanel(panel: ValidPanels) {
  setCoreState('panel', currPanel => {
    setCoreState('history', hist => [currPanel, ...hist.slice(0, 3)]);
    return panel;
  });
}

export function popupToast(toast?: JSX.Element, timeout = 10000) {
  setCoreState('toast', toast);
  setTimeout(() => {
    setCoreState('toast', undefined);
  }, timeout);
}

export function previousPanel() {
  setCoreState('history', currHistory => {
    const history = [...currHistory];
    setCoreState('panel', history.shift() ?? Panels.KeyboardSelect);
    return history;
  });
}

export function toggleLoading() {
  setCoreState('loading', curr => !curr);
}
