#!/usr/bin/env node

/* eslint-disable no-new */
/* eslint-disable import/no-extraneous-dependencies */
import * as cdk from 'aws-cdk-lib';
import { LambdaBoilerplateApiStack } from '../lib/lambda-boilerplate-api-stack';

const app = new cdk.App();

const stackEnv = app.node.tryGetContext('env');

new LambdaBoilerplateApiStack(app, 'LambdaBoilerplateApiStack', {
    stackName: `lambda-boilerplate-api-${stackEnv}`,
    description: `Lambda Boilerplate API (${stackEnv})`,

    // https://github.com/aws/aws-cdk/wiki/Security-And-Safety-Dev-Guide#clicredentialsstacksynthesizer
    synthesizer: new cdk.CliCredentialsStackSynthesizer(),

    env: {
        region: 'eu-west-1'
    }

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});