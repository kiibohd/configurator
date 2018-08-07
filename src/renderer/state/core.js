import { createSharedState } from '../shared-state/index';

const Panels = {
  KeyboardSelect: 'Keyboard Select',
  VariantSelect: 'Variant Select',
  Flash: 'Flash',
  Settings: 'Settings',
  ConfigureKeys: 'Configure Keys',
  ConfigureVisuals: 'Config Visuals'
};

const initialState = {
  panel: Panels.KeyboardSelect,
  loading: false,
  history: [],
  keyboard: undefined,
  variant: undefined,
  toolbarButtons: []
};

const { useSharedState: useCoreState, setSharedState: setCoreState } = createSharedState(initialState);

export { Panels, useCoreState };

export function reset() {
  setCoreState('loading', false);
  setCoreState('keyboard', undefined);
  setCoreState('variant', undefined);
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
