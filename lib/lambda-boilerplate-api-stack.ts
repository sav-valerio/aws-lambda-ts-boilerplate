/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as cert from 'aws-cdk-lib/aws-certificatemanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { TypeScriptCode, TypeScriptCodeProps } from '@mrgrain/cdk-esbuild';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export class LambdaBoilerplateApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const env = scope.node.tryGetContext('env');
        const sharedResEnv = env === 'prod' ? 'prod' : 'test';

        // --- IAM ---
        const role = new iam.Role(this, 'LambdaFunctionExecuteServiceRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        // --- API Gateway ---
        const api = new apigateway.RestApi(this, 'APIGateway', {
            restApiName: `lambda-boilerplate-api-${env}`,
            description: 'Lambda Boilerplate API',
            deployOptions: {
                stageName: env,
                metricsEnabled: true,
                dataTraceEnabled: env !== 'prod',
                tracingEnabled: true
            },
            defaultCorsPreflightOptions: {
                allowMethods: ['OPTIONS', 'GET', 'POST'],
                allowCredentials: true,
                allowOrigins: ['https://*'],
            },
        });

        // Set custom domain for public API 
        if (env !== 'prod') {
            const subdomain = `lambda-boilerplate-${env}`;

            api.addDomainName('APIGateway-DomainName', {
                domainName: `${subdomain}.weschoolapp.com`,
                certificate: cert.Certificate.fromCertificateArn(this, 'Certificate-WeSchoolAppCom',
                    ssm.StringParameter.valueForStringParameter(this, '/acm/weschoolapp.com/certificate/arn')),
            });

            new route53.ARecord(this, 'Route53-Alias', {
                zone: route53.HostedZone.fromHostedZoneAttributes(this, 'Route53-HostedZone-weschoolapp', {
                    zoneName: 'weschoolapp.com',
                    hostedZoneId: ssm.StringParameter.valueForStringParameter(this, '/route53/weschoolapp/zone/id'),
                }),
                recordName: subdomain,
                target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api))
            });
        }

        // TODO: Handle custom domain for prod

        new cdk.CfnOutput(this, 'APIGateway-URL', {
            value: api.domainName?.domainName || api.url
        });

        // --- Lambda ---
        const esbuildConfig: TypeScriptCodeProps = {
            buildOptions: {
                bundle: true,
                minify: true,
                sourcemap: false,
                logLevel: 'info',
                legalComments: 'external',
                format: 'esm',
                // Requires for allowing ESM to run on Lambda runtime
                // https://aws.amazon.com/blogs/compute/using-node-js-es-modules-and-top-level-await-in-aws-lambda/
                outExtension: { '.js': '.mjs' },
                // Enable tree shaking for both ECMAScript and CommonJS modules
                // https://esbuild.github.io/api/#main-fields - https://github.com/aws/aws-sdk-js-v3/issues/3542
                mainFields: ['module', 'main'],
                // Allow the use of "require" based deps while shipping ESM
                // https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
                banner: {
                    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
                },
            },
        };

        const lambdaSharedConfig = {
            runtime: lambda.Runtime.NODEJS_18_X,
            architecture: lambda.Architecture.ARM_64,
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            role,
            tracing: lambda.Tracing.ACTIVE,
            logRetention: env === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
            environment: {
                NODE_ENV: env,
                LOG_LEVEL: env === 'prod' ? 'warn' : 'debug',

                API_URL: `https://${api.domainName?.domainName || api.url}`,
            },
        };

        const indexFunction = new lambda.Function(this, 'LambdaFunctionIndex', {
            functionName: `${this.stackName}-index`,
            handler: 'index.handler',
            code: new TypeScriptCode('src/index.ts', esbuildConfig),
            ...lambdaSharedConfig,
        });

        // --- API Gateway routes ---
        const badges = api.root
            .addResource('index');
        badges.addMethod('GET', new apigateway.LambdaIntegration(indexFunction));
    }
}