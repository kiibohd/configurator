/**
 * Derived from https://github.com/dai-shi/react-hooks-global-state
 **/

import { useState, useEffect } from 'react';
import _ from 'lodash';

// core functions

const createStateItem = (initialValue) => {
  let value = initialValue;
  const getValue = () => value;
  const listeners = [];
  const updater = (funcOrVal) => {
    if (_.isFunction(funcOrVal)) {
      value = funcOrVal(value);
    } else {
      value = funcOrVal;
    }
    listeners.forEach((f) => f(value));
  };
  const hook = () => {
    const [val, setVal] = useState(value);
    useEffect(() => {
      listeners.push(setVal);
      const cleanup = () => {
        const index = listeners.indexOf(setVal);
        listeners.splice(index, 1);
      };
      return cleanup;
    }, []);
    return [val, updater];
  };
  return { getValue, updater, hook };
};

const createGetState = (stateItemMap, initialState) => {
  const keys = Object.keys(stateItemMap);
  let globalState = initialState;
  const getState = () => {
    let changed = false;
    const currentState = {};
    // XXX an extra overhead here
    keys.forEach((key) => {
      currentState[key] = stateItemMap[key].getValue();
      if (currentState[key] !== globalState[key]) {
        changed = true;
      }
    });
    if (changed) {
      globalState = currentState;
    }
    return globalState;
  };
  return getState;
};

const createDispatch = (stateItemMap, getState, reducer) => {
  const keys = Object.keys(stateItemMap);
  const dispatch = (action) => {
    const oldState = getState();
    const newState = reducer(oldState, action);
    if (oldState !== newState) {
      keys.forEach((key) => {
        if (oldState[key] !== newState[key]) {
          stateItemMap[key].updater(newState[key]);
        }
      });
    }
    return action;
  };
  return dispatch;
};

// export functions

export const createSharedState = (initialState) => {
  const stateItemMap = _.mapValues(initialState, createStateItem);
  return {
    useSharedState: (name) => stateItemMap[name].hook(),
    setSharedState: (name, update) => stateItemMap[name].updater(update),
    getSharedState: (name) => stateItemMap[name].getValue(),
  };
};

export const createStore = (reducer, initialState, enhancer) => {
  if (enhancer) {
    return enhancer(createStore)(reducer, initialState);
  }
  const stateItemMap = _.mapValues(initialState, createStateItem);
  const getState = createGetState(stateItemMap, initialState);
  const dispatch = createDispatch(stateItemMap, getState, reducer);
  return {
    useSharedState: (name) => stateItemMap[name].hook(),
    getState,
    dispatch,
  };
};
