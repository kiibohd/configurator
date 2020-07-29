import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { makeStyles, Typography, ToggleButton, ToggleButtonGroup, Theme } from '../mui';
import { categorized, Category } from '../../common/keys/predefined';
import Cap from './cap';
import { DisplayKey } from '../../common/keys';

const cats = [
  Category.core,
  Category.std,
  Category.spec,
  Category.vis,
  Category.mult,
  Category.num,
  Category.i11l,
  Category.mouse,
  Category.mac,
  Category.test,
];

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      container: {
        paddingTop: 10,
        paddingRight: 10,
        display: 'flex',
        flexDirection: 'column',
      },
      categories: {
        borderColor: `${theme.palette.secondary.main} !important`,
      },
      selected: {
        backgroundColor: `${theme.palette.secondary.main} !important`,
        color: `${theme.palette.secondary.contrastText} !important`,
      },
      keysContainer: {
        overflowY: 'auto',
      },
      groupContainer: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      categorySelect: {
        marginBottom: 10,
      },
    } as const)
);

type KeyGroupsProps = {
  onSelect?: (key: DisplayKey | null) => void;
};

// TODO: add a filter to quickly find what someone is looking for.
export default function KeyGroups(props: KeyGroupsProps): JSX.Element {
  const classes = useStyles(props);
  const { onSelect } = props;
  const [selected, setSelected] = useState([Category.core]);

  const items = selected.map((category) => ({ category, keys: _.orderBy(categorized[category], 'order') }));

  return (
    <div className={classes.container}>
      <div className={classes.categorySelect}>
        <ToggleButtonGroup value={selected} onChange={(_, vals) => setSelected(vals)} className={classes.categories}>
          {cats.map((category) => (
            <ToggleButton key={category} value={category} classes={{ selected: classes.selected }}>
              <Typography>{category}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      <div className={classes.keysContainer}>
        {items.map((x) => (
          <div key={x.category}>
            <Typography variant="h6">{x.category}</Typography>
            <div className={classes.groupContainer}>
              {x.keys.map((k) => (
                <Cap key={k.name} cap={k} onClick={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

KeyGroups.propTypes = {
  onSelect: PropTypes.func,
};
