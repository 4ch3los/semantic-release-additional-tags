/**
 * Get the value from env oder plugin config. Env has the higher priority. If both dont exist, throws error
 *
 * @param envName environment variable name
 * @param configName config field name
 * @param pluginConfig the plugin config
 * @returns Returns a matching value if it exists, order: env -> config -> error
 */
const getEnvOrConfig = (envName, configName, pluginConfig) => {
    if (process.env[envName]) {
        return process.env[envName]
    }

    if (pluginConfig[configName]) {
        return pluginConfig[configName]
    }

    throw new Error(`No value found in env(${envName}) or pluginConfig(${configName})`)
}

/**
 * Get the value from env oder plugin config. Env has the higher priority. If both dont exist, returns defaultValue
 *
 * @param envName environment variable name
 * @param configName config field name
 * @param pluginConfig the plugin config
 * @param defaultValue fallback value
 * @returns Returns the env var, config value or fallback defaultValue
 */
const getEnvOrConfigOrDefault = (envName, configName, pluginConfig, defaultValue) => {
    try {
        return getEnvOrConfig(envName, configName, pluginConfig)
    } catch (err) {
        return defaultValue
    }
}

/**
 * Get the value from the plugin config, or the default value if the config does not contain the key
 *
 * @param configName
 * @param pluginConfig
 * @param defaultValue
 * @returns {*}
 */
const getConfigOrDefault = (configName, pluginConfig, defaultValue) => {
    if (Object.keys(pluginConfig).includes(configName)) {
        return pluginConfig[configName]
    }
    return defaultValue
}

/**
 * Unpacks nested field with specific path
 *
 * @param object the source Object
 * @param path the total path joined with '.' ex. fielda.fieldb.fieldd
 * @returns {*} the nest
 */
const unwrapObject = (object, path) => {
    for ( let field of path.split(".")) {
        if (object[field]) {
            object = object[field]
        }
    }
    return object
}

module.exports = {
    getEnvOrConfig,
    getEnvOrConfigOrDefault,
    getConfigOrDefault,
    unwrapObject
}
