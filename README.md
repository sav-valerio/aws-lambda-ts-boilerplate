# WS Lambda Boilerplate

An opinionated boilerplate for creating quickly an AWS Lambda-powered project.

## Perks

- Node.js >= 18 support
- TypeScript + ECMAScript modules support and enforcing
- Webpack bundling for reducing the ZIP size
- Testing powered Vitest + basic GitHub Actions workflows

## Requirements

- Node.js (>= 18)
- [Serverless Framework](https://github.com/serverless/serverless)
- AWS credentials configured on your local machine
- Base infra resources from [infra-pulumi](https://github.com/WeSchoolEng/infra-pulumi/tree/main/res/platform/uploads) already deployed

## Usage

```zsh
git clone git@github.com:WeSchoolEng/lambda-boilerplate

cp -rf lambda-boilerplate <new-project-name>

# Replace all references to "lambda-boilerplate" with <new-project-name>
# and update accordingly the config files following your needs
vim package.json
vim serverless.yml

# Start adding your functions to the src/ dir along with your tests
```

## Deployment

### Lambda functions

Please run the following command for deploying the latest version of the project from your local:

```zsh
# Test environment (used on all non-prod envs)
npm run deploy

# Prod environment
npm run deploy -- --stage prod
```
