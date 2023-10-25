# WS Lambda Boilerplate

An opinionated boilerplate for creating quickly an AWS Lambda-powered project.

## Perks

- [Node.js](https://nodejs.org/en) >= 18 support
- [TypeScript](https://www.typescriptlang.org/) + [ECMAScript Modules](https://www.typescriptlang.org/docs/handbook/esm-node.html) support and enforcing
- [esbuild](https://esbuild.github.io/) bundler for reducing the final size and improving performance
- Testing powered [Vitest](https://vitest.dev/) + basic [GitHub Actions](https://docs.github.com/en/actions) workflows

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

### Debugging

You can use the [`logs` command available in Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/cli-reference/logs) for retrieving the logs.

```zsh
cd lambda-boilerplate

# Tail real-time logs
sls logs --stage ENV_NAME --function execute --tail

# Get logs starting from 1 hour ago
sls logs --stage ENV_NAME --function execute --startTime 1hr
```
