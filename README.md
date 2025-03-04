# AWS Lambda TS Boilerplate

An opinionated boilerplate for creating quickly an AWS Lambda-powered project.

## Perks

- [Node.js](https://nodejs.org/en) >= 18 support
- [TypeScript](https://www.typescriptlang.org/) + [ECMAScript Modules](https://www.typescriptlang.org/docs/handbook/esm-node.html) support and enforcing
- [esbuild](https://esbuild.github.io/) bundler for reducing the final size and improving performance
- Testing powered [Vitest](https://vitest.dev/) + basic [GitHub Actions](https://docs.github.com/en/actions) workflows

## Requirements

- Node.js (>= 18)
- AWS CDK (npm install -g aws-cdk)
- AWS credentials configured on your local machine

## Usage

1. Clone the boilerplate:

    ```zsh
    git clone git@github.com:sav-valerio/aws-ts-lambda-boilerplate

    cp -rf aws-ts-lambda-boilerplate <new-project-name>
    ```

2. Find and replace all refs to `LambdaBoilerplate` and `lambda-boilerplate` with `<new-project-name>`.

3. Rename the following files:

    ```zsh
    mv bin/lambda-boilerplate-api.ts bin/<new-project-name>-api.ts
    mv lib/lambda-boilerplate-stack.ts bin/<new-project-name>-stack.ts
    ```

4. Add the code of Lambda functions to the `src/` directory.

5. Update the main stack available under `lib/*-stack.ts` referring the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) docs accordingly:

    - API Gateway: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway-readme.html
    - Lambda: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html

6. Setting up an optional custom domain is already supported.  
    This assumes that you already have an ACM certificate and a Route53 zone provisioned by another stack/IaC tool along with its ARNs exported onto SSM for easy retrieval and import.  
    Feel free to replace my `saval.dev` domain with your own.  

## Deployment

### Lambda functions

Please run the following command for deploying the latest version of the project from your local:

```zsh
# Custom dev env
npm run deploy -- env=ENV_NAME

# Prod environment
npm run deploy -- env=prod
```

### Debugging

```zsh
# Watch local code changes and show real-time logs
npm run watch -- env=ENV_NAME
```
