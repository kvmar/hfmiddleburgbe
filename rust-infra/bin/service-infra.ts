#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { HfLambdaServiceStack } from "../lib/lambda-infra-stack";
import { HfApiGatewayStack } from "../lib/api-infra-stack";

const ACCOUNT = "205197764738";
const REGION = "us-east-1";
const app = new cdk.App();
const lambdaServiceStack = new HfLambdaServiceStack(
  app,
  "HfLambdaServiceStack",
  {
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */

    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    env: { account: ACCOUNT, region: REGION },

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  },
);

const apiGateway = new HfApiGatewayStack(
  app,
  "HfApiGatewayStack",
  lambdaServiceStack,
  {
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */

    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    env: { account: ACCOUNT, region: REGION },

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  },
);

apiGateway.addDependency(lambdaServiceStack);
