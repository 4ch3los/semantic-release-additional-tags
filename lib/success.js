const {generateAdditionalTags} = require("./tags")
const {getEnvOrConfigOrDefault, getEnvOrConfig} = require("./util")
const {gitlabRequest} = require("./gitlab")


module.exports = async (pluginConfig, { nextRelease: { version }, logger, options: { repositoryUrl } }) => {
    let additionalTags = generateAdditionalTags(pluginConfig, version)

    logger.log("Adding additional tags", additionalTags)

    if (getEnvOrConfigOrDefault("ADDITIONAL_TAGS_GITLAB", "useGitlabApi", pluginConfig, false)) {
        const commitSha = getEnvOrConfig("CI_COMMIT_SHA", "commitSha", pluginConfig)
        logger.log(`Using gitlab api to add tags to commit ${commitSha}`)
        const projectID = encodeURI(getEnvOrConfig('CI_PROJECT_ID', 'projectPath', pluginConfig))

        for (let additionalTag of additionalTags) {
            logger.log(`Processing tag ${additionalTag}`)
            const tagInfo = await gitlabRequest(pluginConfig, 'get', `/projects/${projectID}/repository/tags/${additionalTag}`)

            if (tagInfo.status == 200) {
                if (tagInfo.data.target == commitSha) {
                    logger.log("Tag set to right commit, doing nothing")
                    continue
                }
                logger.log(`Deleting old tag ${additionalTag} => ${tagInfo.data.target}`)
                const deleteResponse = await gitlabRequest(pluginConfig, 'delete', `/projects/${projectID}/repository/tags/${additionalTag}`)
                if (deleteResponse.status != 204) {
                    throw new Error(`Failed to delete existing tag ${deleteResponse.status}, ${deleteResponse.data}`)
                }
            }
            logger.log("Adding new tag")

            const addTagResponse = await gitlabRequest(pluginConfig, 'post', `/projects/${projectID}/repository/tags`, {
                data: {
                    tag_name: additionalTag,
                    ref: commitSha
                }
            })

            if (addTagResponse.status != 201) {
                throw new Error(`Failed to create new tag ${additionalTag}, ${addTagResponse.status}, ${addTagResponse.data}`)
            }

            logger.log(`Tag published: ${additionalTag}`)
        }
    } else {
        logger.log("Using git cli implementation")

        for (let additionalTag of additionalTags) {
            execSync(`git tag --force ${additionalTag}`)
        }
        execSync(`git push ${repositoryUrl} --force --tags`)
    }
}
