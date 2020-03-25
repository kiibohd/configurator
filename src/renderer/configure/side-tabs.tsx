import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { makeStyles, Theme } from '../mui';

import { useConfigureState } from '../state';
import { getSize } from '../../common/config';
import { Palette } from './styles';
import { SideTab } from './types';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      tabContainer: {
        float: 'left',
      },
      active: {
        border: '1px solid black',
        borderRightColor: theme.palette.background.default,
      },
      inactive: {
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderRadius: '50%',
          cursor: 'pointer',
        },
      },
      tab: {
        textAlign: 'center',
        width: 54,
        marginBottom: 10,
        padding: '5px 0',
        borderRadius: '4px 0 0 4px',
        color: Palette.darkgray,
      },
    } as const)
);

type SideTabsProps = {
  items: NonEmptyArray<SideTab>;
};

export default function SideTabs(props: SideTabsProps) {
  const classes = useStyles(props);
  const { items } = props;
  const [activeTab, setActiveTab] = useState(items[0].id);
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const { width } = matrix ? getSize(matrix, ui.sizeFactor) : { width: 0 };

  const active = items.find((t) => t.id === activeTab);

  return (
    <div>
      <div className={classes.tabContainer}>
        {items.map((t) => (
          <div
            key={t.id}
            className={classNames(classes.tab, activeTab === t.id ? classes.active : classes.inactive)}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
          </div>
        ))}
      </div>
      <div style={{ width: width + 2 + 2 * ui.backdropPadding, marginTop: 15 }}>
        <div style={{ border: '1px solid black', marginLeft: 55, paddingLeft: 20, minHeight: 250 }}>
          {active && active.tab}
          <div style={{ clear: 'both', height: 14 }} />
        </div>
      </div>
    </div>
  );
}

SideTabs.propTypes = {
  items: PropTypes.array.isRequired,
};
