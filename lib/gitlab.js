const axios = require("axios")
const {getEnvOrConfigOrDefault, getEnvOrConfig} = require("./util")

const gitlabRequest = async (pluginConfig, method, url, options = {}) => {
    const gitlabUrl = getEnvOrConfigOrDefault("GITLAB_URL", "gitlabUrl", pluginConfig, "https://gitlab.com")

    let apiUrl

    if (process.env['CI_API_V4_URL']) {
        apiUrl = process.env['CI_API_V4_URL']
    } else {
        apiUrl = gitlabUrl + (gitlabUrl.endsWith("/") ? "" : "/") + "api/v4"
    }

    let authToken

    if (process.env['GL_TOKEN']) {
        authToken = process.env['GL_TOKEN']
    } else if (!(authToken = getEnvOrConfig("GITLAB_TOKEN", "gitlabToken", pluginConfig))) {
        throw new Error("Gitlab Token not supplied(Env: GL_TOKEN/GITLAB_TOKEN, config: gitlabToken)")
    }

    let axiosOptions = {
        url: apiUrl + (url.startsWith("/") ? "" : "/") + url,
        method: method,
        validateStatus: () => true,
        ...options
    }

    if(!axiosOptions.headers) {
        axiosOptions.headers = {}
    }

    axiosOptions.headers["PRIVATE-TOKEN"] = authToken



    return await axios(axiosOptions)
}

module.exports = {
    gitlabRequest
}
