import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import he from 'he';
import { withStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '../mui';
import { ExpandMoreIcon } from '../icons';
import { categorized, Category } from '../../common/keys/predefined';
import { getLayerFg, capStyle } from './styles';
import { useConfigureState, updateSelected } from '../state/configure';
import { useSettingsState } from '../state/settings';
import { mergeKeys, locales } from '../../common/keys';

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

const styles = () => ({
  container: {
    paddingTop: 10,
    paddingRight: 10
  },
  groupContainer: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  ...capStyle
});

function Cap(props) {
  const { classes, cap } = props;
  const [ui] = useConfigureState('ui');
  const [locale] = useSettingsState('locale');
  const size = ui.sizeFactor * 4;
  const localized = locales[locale].keyname2key[cap.name] || {};
  const merged = mergeKeys(cap, localized);
  const color = getLayerFg(0);
  const label1 = merged ? merged.label1 || ' ' : cap.label;
  const label2 = (merged && merged.label2) || ' ';
  const style = merged && merged.style;

  return (
    <div className={classes.key} style={{ width: size, height: size, position: 'relative' }}>
      <div
        className={classes.base}
        style={{ width: size - 6, height: size - 6 }}
        onClick={() => updateSelected(merged)}
      >
        <div className={classes.cap} style={{ width: size - 10, height: size - 12 }}>
          {label(label2, style)}
          {label(label1, style)}
          {label('', {})}
        </div>
      </div>
    </div>
  );

  function label(value, style) {
    return (
      <div className={classes.label} style={{ ...style, ...{ color } }}>
        <span>{he.unescape(value)}</span>
      </div>
    );
  }
}

Cap.propTypes = {
  classes: PropTypes.object.isRequired,
  cap: PropTypes.object.isRequired
};

function Group(props) {
  const { classes, group, items } = props;
  const keys = _.orderBy(items, 'order');
  const elements = keys.map(x => <Cap key={x.name} classes={classes} cap={x} />);

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.groupName}>{group}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={classes.groupContainer}>{elements}</div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

Group.propTypes = {
  classes: PropTypes.object.isRequired,
  group: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
};

// TODO: add a filter to quickly find what someone is looking for.
function KeyGroups(props) {
  const { classes } = props;

  return (
    <div className={classes.container}>
      {cats.map(category => (
        <Group key={category} classes={classes} group={category} items={categorized[category]} />
      ))}
    </div>
  );
}

KeyGroups.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(KeyGroups);
