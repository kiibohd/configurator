import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '../mui';
import { ExpandMoreIcon } from '../icons';
import { categorized, Category } from '../../common/keys/predefined';
import Cap from './cap';

const cats = [
  Category.spec,
  Category.std,
  Category.core,
  Category.vis,
  Category.mult,
  Category.num,
  Category.i11l,
  Category.mouse,
  Category.mac
];

/** @type {import('../theme').CssProperties} */
const styles = {
  container: {
    paddingTop: 10,
    paddingRight: 10
  },
  groupContainer: {
    display: 'flex',
    flexWrap: 'wrap'
  }
};

function Group(props) {
  const { classes, group, items, onSelect } = props;
  const keys = _.orderBy(items, 'order');

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.groupName}>{group}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={classes.groupContainer}>
          {keys.map(x => (
            <Cap key={x.name} cap={x} onClick={onSelect} />
          ))}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

Group.propTypes = {
  classes: PropTypes.object.isRequired,
  group: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onSelect: PropTypes.func
};

// TODO: add a filter to quickly find what someone is looking for.
function KeyGroups(props) {
  const { classes, onSelect } = props;

  return (
    <div className={classes.container}>
      {cats.map(category => (
        <Group key={category} classes={classes} group={category} items={categorized[category]} onSelect={onSelect} />
      ))}
    </div>
  );
}

KeyGroups.propTypes = {
  classes: PropTypes.object.isRequired,
  onSelect: PropTypes.func
};

export default withStyles(styles)(KeyGroups);
