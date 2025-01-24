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

import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { TypeScriptCode, TypeScriptCodeProps } from '@mrgrain/cdk-esbuild';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export class LambdaBoilerplateApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const env = scope.node.tryGetContext('env');

        // --- Custom domain ---
        const USE_ROUTE_53 = false;
        const domainName = `api-${env}.saval.dev`;

        // --- IAM ---
        const role = new iam.Role(this, 'LambdaFunctionExecuteServiceRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        // --- API Gateway ---
        const apigwDomainName = new apigwv2.DomainName(this, 'APIGateway-DomainName', {
            domainName,
            // Make sure that you have already created a certificate in ACM
            certificate: cert.Certificate.fromCertificateArn(this, 'Certificate-SavalDev',
                ssm.StringParameter.valueForStringParameter(this, '/acm/saval.dev/certificate/arn')),
        });

        const api = new apigwv2.HttpApi(this, 'APIGateway', {
            apiName: `lambda-boilerplate-api-${env}`,
            description: 'Lambda Boilerplate API',
            corsPreflight: {
                allowHeaders: ['Authorization'],
                allowMethods: [apigwv2.CorsHttpMethod.GET],
                allowOrigins: ['*'],
                maxAge: cdk.Duration.days(10),
            },
            defaultDomainMapping: {
                domainName: apigwDomainName,
            }
        });

        new cdk.CfnOutput(this, 'API-RecordName', {
            value: domainName
        });

        // --- Route 53 (optional) ---
        if (USE_ROUTE_53) {
            new route53.ARecord(this, 'Route53-Alias', {
                zone: route53.HostedZone.fromHostedZoneAttributes(this, 'Route53-HostedZone-SavalDev', {
                    zoneName: domainName.split('.')[1],
                    hostedZoneId: ssm.StringParameter.valueForStringParameter(this, '/route53/saval.dev/zone/id'),
                }),
                recordName: domainName,
                target: route53.RecordTarget.fromAlias(new targets.ApiGatewayv2DomainProperties(
                    apigwDomainName.regionalDomainName, apigwDomainName.regionalHostedZoneId))
            });
        } else {
            // Expose the API target if Route 53 is not in use (thus requiring the manual creation of a record in the DNS zone)
            new cdk.CfnOutput(this, 'API-RecordTarget', {
                value: apigwDomainName.regionalDomainName,
            });
        }

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
            runtime: lambda.Runtime.NODEJS_20_X,
            architecture: lambda.Architecture.ARM_64,
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            role,
            tracing: lambda.Tracing.ACTIVE,
            logRetention: env === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
            environment: {
                NODE_ENV: env,
                LOG_LEVEL: env === 'prod' ? 'warn' : 'debug',
                API_URL: domainName
            },
        };

        const indexFunction = new lambda.Function(this, 'LambdaFunctionIndex', {
            functionName: `${this.stackName}-index`,
            handler: 'index.handler',
            code: new TypeScriptCode('src/index.ts', esbuildConfig),
            ...lambdaSharedConfig,
        });

        // --- API Gateway routes ---
        api.addRoutes({
            path: '/index',
            methods: [apigwv2.HttpMethod.GET],
            integration: new HttpLambdaIntegration('FunctionIntegration', indexFunction),
        });
    }
}