import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles, Typography, ToggleButton, ToggleButtonGroup } from '../mui';
import { categorized, Category } from '../../common/keys/predefined';
import Cap from './cap';

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
  Category.test
];

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  container: {
    paddingTop: 10,
    paddingRight: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  categories: {
    borderColor: `${theme.palette.secondary.main} !important`
  },
  selected: {
    backgroundColor: `${theme.palette.secondary.main} !important`,
    color: `${theme.palette.secondary.contrastText} !important`
  },
  keysContainer: {
    overflowY: 'auto'
  },
  groupContainer: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  categorySelect: {
    marginBottom: 10
  }
});

// TODO: add a filter to quickly find what someone is looking for.
function KeyGroups(props) {
  const { classes, onSelect } = props;
  const [selected, setSelected] = useState([Category.core]);

  const items = selected.map(category => ({ category, keys: _.orderBy(categorized[category], 'order') }));

  return (
    <div className={classes.container}>
      <div className={classes.categorySelect}>
        <ToggleButtonGroup value={selected} onChange={(_, vals) => setSelected(vals)} className={classes.categories}>
          {cats.map(category => (
            <ToggleButton key={category} value={category} classes={{ selected: classes.selected }}>
              <Typography>{category}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      <div className={classes.keysContainer}>
        {items.map(x => (
          <div key={x.category}>
            <Typography variant="h6">{x.category}</Typography>
            <div className={classes.groupContainer}>
              {x.keys.map(k => (
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
  classes: PropTypes.object.isRequired,
  onSelect: PropTypes.func
};

export default withStyles(styles)(KeyGroups);
