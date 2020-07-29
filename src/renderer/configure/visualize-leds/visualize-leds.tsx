import React, { useReducer, useEffect, useRef } from 'react';
import { makeStyles } from '../../mui';
import { Palette } from '../styles';
import { getSize, ConfigLed } from '../../../common/config';
import { useConfigureState, setSelectedLeds } from '../../state/configure';
import Key from './key';
import Led from './led';
import log from 'loglevel';
// TODO: Major refactor, this is ugly right now, but it works...

const useStyles = makeStyles({
  backdrop: {
    backgroundColor: Palette.lightgray,
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: '1px solid transparent',
  },
  innerContainer: {
    position: 'relative',
  },
  zone: {
    position: 'absolute',
    zIndex: 99,
    border: '1px solid red',
  },
} as const);

type Point = {
  x: number;
  y: number;
};

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function contained(leds: ConfigLed[], zone: Box) {
  // TODO: Dynamic && Pre-scale!!!
  const sf = 16;
  const left = zone.left;
  const top = zone.top;
  const right = zone.left + zone.width;
  const bottom = zone.top + zone.height;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = (x: number) => 2 * sf + x * conv * sf;
  return leds
    .filter((l) => {
      const x = scale(l.x) - sf / 2;
      const y = scale(l.y) - sf / 2;
      return left <= x && right >= x + sf && top <= y && bottom >= y + sf;
    })
    .map((x) => x.id);
}

function intersects(leds: ConfigLed[], zone: Box) {
  // TODO: Dynamic
  const sf = 16;
  const left = zone.left;
  const top = zone.top;
  const right = zone.left + zone.width;
  const bottom = zone.top + zone.height;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = (x: number) => 2 * sf + x * conv * sf;
  return leds
    .filter((l) => {
      const x = scale(l.x) - sf / 2;
      const y = scale(l.y) - sf / 2;
      return left <= x + sf && right >= x && top <= y + sf && bottom >= y;
    })
    .map((x) => x.id);
}

type State = {
  mouseDown: boolean;
  zoneSelection: boolean;
  leds: ConfigLed[];
  append: boolean;
  start: Point;
  end: Point;
  zone: Box;
  initialSelected: number[];
  selected: number[];
};

// TODO: Refactor away from the payload concept and just put the objects on the type
type ResetAction = {
  type: 'reset';
};

type LocationAction = {
  type: 'move' | 'stop';
  payload: Point;
};

type StartAction = {
  type: 'start';
  payload: { append: boolean; initialSelected: number[]; leds: ConfigLed[] } & Point;
};
type ClickAction = {
  type: 'click';
  target: Optional<ConfigLed>;
  // TODO: Probably only need append, and target
  payload: { append: boolean; initialSelected: number[]; leds: ConfigLed[] } & Point;
};

type Action = ResetAction | LocationAction | StartAction | ClickAction;

// NOTE: The `zoneSelection` flag is to help differentiate between a click and a zone select. Unfortunately
//       the `mouseup` and `click` events are going to fire no matter what (unless the drag exits the window,
//       then the `click` event will not fire). This causes contention between the two events. We use this
//       flag to determine if we are in the midst of a zone select.

const initialState: State = {
  mouseDown: false,
  zoneSelection: false,
  leds: [],
  append: false,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  zone: { left: 0, top: 0, width: 0, height: 0 },
  initialSelected: [],
  selected: [],
};

function reducer(state: State, action: Action): State {
  let point: Point;
  let zone: Box;
  let selected: number[];
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'start':
      point = { x: action.payload.x, y: action.payload.y };
      return {
        ...state,
        ...{
          mouseDown: true,
          zoneSelection: false,
          leds: action.payload.leds,
          append: !!action.payload.append,
          start: point,
          end: point,
          initialSelected: action.payload.initialSelected,
        },
      };
    case 'move':
      if (!state.mouseDown) {
        return state;
      }
      point = { x: action.payload.x, y: action.payload.y };
      zone = {
        top: Math.min(state.start.y, point.y),
        left: Math.min(state.start.x, point.x),
        width: Math.abs(point.x - state.start.x),
        height: Math.abs(point.y - state.start.y),
      };
      selected = state.start.y < point.y ? contained(state.leds, zone) : intersects(state.leds, zone);
      selected = state.append ? [...state.initialSelected, ...selected] : selected;
      return { ...state, ...{ zoneSelection: true, end: point, zone, selected } };
    case 'stop':
      if (state.zoneSelection) {
        return { ...initialState, ...{ zoneSelection: true, selected: state.selected } };
      }
      return state;
    case 'click':
      if (!state.zoneSelection) {
        if (state.append) {
          selected = action.target ? [...state.selected, action.target.id] : state.selected;
        } else {
          selected = action.target ? [action.target.id] : [];
        }

        return { ...initialState, ...{ selected } };
      }
      return state;
    default:
      return state;
  }
}

export default function VisualizeLeds(): JSX.Element {
  const classes = useStyles({});
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const [leds = []] = useConfigureState('leds');
  const [selectedLeds] = useConfigureState('selectedLeds');
  const [ledStatus] = useConfigureState('ledStatus');

  if (!matrix) {
    log.error('matrix not set.');
    throw Error('State error - matrix not set in Visualize Leds');
  }

  const { height, width } = getSize(matrix, ui.sizeFactor);

  const click = (e: React.MouseEvent, led: Optional<ConfigLed>) => {
    //TODO: only select when needed
    if (e.button !== 0 || !containerRef.current) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const append = e.ctrlKey || e.altKey || e.shiftKey;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;
    dispatch({ type: 'click', target: led, payload: { x, y, append, leds, initialSelected: selectedLeds } });
  };

  const mousedown = (e: React.MouseEvent) => {
    if (e.button === 2 || e.nativeEvent.which === 2 || !containerRef.current) {
      return;
    }
    const append = e.ctrlKey || e.altKey || e.shiftKey;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;

    dispatch({ type: 'start', payload: { x, y, append, leds, initialSelected: selectedLeds } });
  };

  const mousemove = (e: MouseEvent) => {
    e.preventDefault();
    if (state.mouseDown && containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      const x = e.pageX - bounds.left;
      const y = e.pageY - bounds.top;
      dispatch({ type: 'move', payload: { x, y } });
    }
  };

  const mouseup = (e: MouseEvent) => {
    if (!containerRef.current) {
      return;
    }
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.pageX - bounds.left;
    const y = e.pageY - bounds.top;
    dispatch({ type: 'stop', payload: { x, y } });
  };

  useEffect(() => {
    if (state.mouseDown) {
      window.document.addEventListener('mousemove', mousemove);
      window.document.addEventListener('mouseup', mouseup);
    }
    return () => {
      window.document.removeEventListener('mousemove', mousemove);
      window.document.removeEventListener('mouseup', mouseup);
    };
  }, [state.mouseDown]);

  useEffect(() => {
    setSelectedLeds(state.selected);
    // TODO: Verify this is correct, if it's not the same array reference it'll trigger
  }, [state.selected]);

  return (
    <div
      className={classes.backdrop}
      style={{ padding: `${ui.backdropPadding}px`, position: 'relative', height, width }}
    >
      <div
        className={classes.innerContainer}
        onClick={(e) => click(e, undefined)}
        onMouseDown={mousedown}
        ref={containerRef}
      >
        {matrix.map((k) => (
          <Key key={`key-${k.board}-${k.code}`} keydef={k} sizeFactor={ui.sizeFactor} />
        ))}
        {leds.map((led) => {
          const status = ledStatus[led.id];
          return (
            <Led
              key={`led-${led.id}`}
              led={led}
              sizeFactor={ui.sizeFactor}
              onClick={click}
              selected={selectedLeds.includes(led.id)}
              status={status}
            />
          );
        })}
        {state.zone && <div className={classes.zone} style={state.zone} />}
      </div>
    </div>
  );
}
