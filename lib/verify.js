const {getEnvOrConfigOrDefault, getEnvOrConfig, unwrapObject, getConfigOrDefault} = require("./util")
const {gitlabRequest} = require("./gitlab")

module.exports = async (pluginConfig, { logger }) => {
    if (getEnvOrConfigOrDefault("ADDITIONAL_TAGS_GITLAB", "useGitlabApi", pluginConfig, false)) {
        logger.log("Gitlab tagging was enabled, testing gitlab Credentials")

        getEnvOrConfig("CI_COMMIT_SHA", "commitSha", pluginConfig)

        const response = await gitlabRequest(
            pluginConfig,
            'get',
            `projects/${encodeURI(getEnvOrConfig('CI_PROJECT_ID', 'projectPath', pluginConfig))}`
        )

        if (response.status != 200) {
            logger.log("Failed to authenticate with gitlab", response.status, response.data)
        }

        let projectAccess = unwrapObject(response.data, "permissions.project_access.access_level")
        let groupAccess = unwrapObject(response.data, "permissions.group_access.access_level")

        if ((projectAccess && projectAccess >= 30) || (groupAccess && groupAccess >= 30)) {
            logger.log("Gitlab authentication successful")
        } else {
            throw new Error(`Token does not have the required permissions (projectAccess: ${projectAccess}, groupAccess: ${groupAccess})`)
        }
    }

    const additionalTags = getConfigOrDefault("additionalTags", pluginConfig, [])
    if (!Array.isArray(additionalTags)) {
        throw new Error("Config field additionalTags should be an array of Strings")
    }

    for (let additionalTag of additionalTags) {
        if (typeof additionalTag !== 'string') {
            throw new Error(`Additional tags should be defined as string, got ${typeof additionalTag} for ${additionalTag}`)
        }
    }

    logger.log(`The following additional tags were configured: ${additionalTags.join(", ")}`)


}
