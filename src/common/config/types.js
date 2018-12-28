/** External Types **/
/**
 * @typedef {string} PersistedLayer
 */

/**
 * @typedef PersistedKey
 * @property {string} key
 * @property {string} label
 */

/**
 * @typedef PersistedMatrixItem
 * @property {string} code
 * @property {number} [board]
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {Object<PersistedLayer, PersistedKey>} layers
 */

/**
 * @typedef {PersistedMatrixItem[]} PersistedMatrix
 */

/**
 * @typedef PersistedLed
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {string} [scanCode]
 */

/**
 * @typedef PersistedDefine
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef PersistedAnimation
 * @property {'custom'|'canned'|'static'} type
 * @property {string} settings
 * @property {string[]} frames
 */

/**
 * @typedef PersistedCannedConfigurableItem
 * @property {string} name
 * @property {'color'|'select'} type
 * @property {{r: number, g: number, b: number}|string|number} default
 * @property {{name: string, value:string|number}} [values]
 */

/**
 * @typedef PersistedCannedAnimation
 * @property {string} settings
 * @property {'animation'|'trigger'} type
 * @property {string} description
 * @property {PersistedCannedConfigurableItem[]} configurable
 * @property {string[]} frames
 * @property {string} custom_kll
 */

/**
 * @typedef PersistedMacro
 * @property {string} name
 * @property {string[][]} trigger
 * @property {string[][]} output
 */

/**
 * @typedef PersistedConfig
 * @property {PersistedMatrix} matrix
 * @property {Object<string, string>} header
 * @property {PersistedDefine[]} defines
 * @property {ConfigLed[]} leds
 * @property {Object<string, PersistedAnimation>} animations
 * @property {Object<string, PersistedMacro[]>} macros
 * @property {Object<string, string>} custom
 */

/** Internal Types **/
/**
 * @typedef ConfigKey
 * @property {string} key
 * @property {string} label1
 * @property {string} [label2]
 * @property {string} [label3]
 * @property {Object} style
 * @property {string} [custom]
 */

/**
 * @typedef ConfigMatrixItem
 * @property {string} code
 * @property {number} [board]
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {Object<ConfigLayer, ConfigKey>} layers
 */

/**
 * @typedef {ConfigMatrixItem[]} ConfigMatrix
 */

/**
 * @typedef  ConfigLed
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {string} [scanCode]
 */

/**
 * @typedef ConfigDefine
 * @property {string} id
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef ConfigAnimation
 * @property {'custom'|'canned'|'static'} type
 * @property {string} settings
 * @property {string} frames
 */

/**
 * @typedef ConfigCannedConfigurableItem
 * @property {string} name
 * @property {'color'|'select'} type
 * @property {{r: number, g: number, b: number}|string|number} default
 * @property {{name: string, value:string|number}} [values]
 */

/**
 * @typedef ConfigCannedAnimation
 * @property {string} settings
 * @property {'animation'|'trigger'} type
 * @property {string} description
 * @property {ConfigCannedConfigurableItem[]} configurable
 * @property {string[]} frames
 * @property {string} custom_kll
 */

/**
 * @typedef ConfigMacro
 * @property {string} id
 * @property {string} name
 * @property {string[][]} trigger
 * @property {string[][]} output
 */

/**
 * @typedef {Object<string, ConfigMacro[]>} ConfigMacros
 */

/**
 * @typedef Config
 * @property {ConfigMatrix} matrix
 * @property {Object<string, string>} header
 * @property {ConfigDefine[]} defines
 * @property {ConfigLed[]} leds
 * @property {Object<string, ConfigAnimation>} animations
 * @property {ConfigMacros} macros
 * @property {Object<string, string>} custom
 */

export const _ = '';
