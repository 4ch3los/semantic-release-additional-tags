const {getConfigOrDefault} = require("./util")
const generateAdditionalTags = (pluginConfig, version) => {
    const [major, minor, patch] = version.split('.')

    const additionalTags = getConfigOrDefault("additionalTags", pluginConfig, [])

    return additionalTags.map(additionalTag =>
        additionalTag
            .replace("${major}", major)
            .replace("${minor}", minor)
            .replace("${patch}", patch)
    )
}

module.exports = {
    generateAdditionalTags
}
