# semantic-release-additional-tags
  <a href="https://www.npmjs.com/package/semantic-release-additional-tags">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/semantic-release-additional-tags/latest.svg">
  </a>

A plugin for [semantic-relese](https://github.com/semantic-release/semantic-release) inspired by [semantic-release-major-tag](https://www.npmjs.com/package/semantic-release-major-tag) but with the added option to set tags via the gitlab api to support the reuse of protected tags 



## Supported Steps

### verifyConditions

Verifies the provided additionalTags and tests the gitlab credentials if gitlab is enabled 
### success

Adds the additional tags to the provided commit


# Installation
> npm i --save-dev semantic-release-additional-tags

or
> yarn add -D semantic-release-additional-tags

And follow the configuration below


# Configuration
Every option can be set using Environment variable or the plugin config

Example:
```
{
  "plugins": [
    ["semantic-release-additional-tags", {
            
      }
    ]
  ]
}
```


| Config Option      | Environment variable | Required                | Default             | Description                                                                                                                     |
|--------------------|----------------------|-------------------------|---------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `additionalTags`   | -                    | Yes                     | `[]`                | String array containing the additional tags with possible variables `${major}`, `${minor}`, `${patcg}`. Ex.: `v${major}.latest` | 
| `useGitlabApi`     | `ADDITIONAL_TAGS_GITLAB` | No                      | `false`         | Option to enable the use of the gitlab api to support retagging of protected tags                                               |
| `gitlabToken`      | `GL_TOKEN` or `GITLAB_TOKEN` | when gitlab api is used | -           | Gitlab api token, with permissions to create/delete tags                                                                        |
| `commitSha`        | `CI_COMMIT_SHA`         | when gitlab api is used | -                | The referenced commit to be tagged, by default provided by gitlab_ci                                                            |
| -                  | `CI_API_V4_URL`       | No                      | -                  | URL of the v4 api endpoint of gitlab, by default provided by gitlab ci                                                          |
| `gitlabUrl`        | `GITLAB_URL`  | No                      | `https://gitlab.com` | Base url of the used gitlab instance if `CI_API_V4_URL` is not set                                                              |

# Example CI Config

## Gitlab

```
stages:
  - semantic-release
semantic-release:
  stage: semantic-release
  image: node
  before_script:
    - npm install semantic-release
    - npm install @semantic-release/git
    - npm install @semantic-release/gitlab    
    - npm install semantic-release-additional-tags
  script:
     # Gitlab CI Variables already set in project settings
     # GL_TOKEN
    - |
      cat > .releaserc << EOF
      {
        "branches": ["master", "main"],
        "debug": true,
        "plugins": [
          "@semantic-release/commit-analyzer",
          "@semantic-release/gitlab",
          ["semantic-release-additional-tags", {
            "useGitlabApi": true,
            "additionalTags": ["latest", "v${major}.latest", "$v{major}.${minor}.latest"]
          }]
        ]
      }
      EOF
    - semantic-release
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH 
      when: always
```

