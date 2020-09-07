require('dotenv/config')
const conventionalGithubReleaser = require('conventional-github-releaser')

conventionalGithubReleaser(
  {
    type: 'oauth',
    url: 'https://api.github.com/',
    token: process.env.GITHUB_TOKEN,
  },
  {
    preset: 'angular',
  },
  (e, release) => {
    if (e) {
      console.error(e) //eslint-disable-line no-console
      process.exit(1)
    }

    console.log(release) //eslint-disable-line no-console
    process.exit(0)
  }
)
