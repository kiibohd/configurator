const Known = {
  Animation: {
    name: 'cust/anim',
    rx: /#:A\[(.*)]\((start|stop|pause|single)\)/,
    toLabel: match => `A:${match[2]}`,
    toData: match => ({ animation: match[1], action: match[2] }),
    style: { fontStyle: 'oblique', fontSize: 12 }
  }
};

/**
 * @param {string} animation
 * @param {string} action
 * @returns {import(".").DisplayKey}
 */
export function buildAnimationActionKey(animation, action) {
  return {
    key: Known.Animation.name,
    label1: `A:${action}`,
    style: Known.Animation.style,
    custom: `#:A[${animation}](${action})`,
    data: { animation, action }
  };
}

/**
 *
 * @param {string} raw
 * @returns {import(".").DisplayKey}
 */
export function parseRawToKnown(raw) {
  const match = Known.Animation.rx.exec(raw);

  if (!match) {
    return;
  }

  return {
    key: Known.Animation.name,
    label1: Known.Animation.toLabel(match),
    style: Known.Animation.style,
    custom: raw,
    data: Known.Animation.toData(match)
  };
}
