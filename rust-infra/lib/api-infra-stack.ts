import * as cdk from "@aws-cdk/core";
import { HfLambdaServiceStack } from "./lambda-infra-stack";
import { LambdaRestApi, Cors, ApiKey, Period, LambdaIntegration } from "@aws-cdk/aws-apigateway";

export class HfApiGatewayStack extends cdk.Stack {
  readonly apiGatewayResources: {
    restApi: LambdaRestApi;
  };

  constructor(
    scope: cdk.Construct,
    id: string,
    lambdaServiceStack: HfLambdaServiceStack,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);
    const apiGatewayResources =
      this.createApiGatewayResources(lambdaServiceStack);
  }

  private createApiGatewayResources(lambdaServiceStack: HfLambdaServiceStack) {
    const restApi = new LambdaRestApi(this, "HfMiddleburgApi", {
      handler: lambdaServiceStack.serviceLambda,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS, // this is also the default
      },
    });

    const apiKey = new ApiKey(this, "api-key", {
      apiKeyName: "HfApikey",
      enabled: true,
    });

    // define the usage plan
    const usagePlan = restApi.addUsagePlan("UsagePlan", {
      name: "UsagePlan",
      throttle: {
        rateLimit: 10,
        burstLimit: 10,
      },
      quota: {
        period: Period.DAY,
        limit: 50,
      },
    });

    usagePlan.addApiKey(apiKey);
    const CORS_HEADERS = ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token',
      'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods']
    const emailResource = restApi.root.addResource("email", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS, // this is also the default
        allowHeaders: CORS_HEADERS,
        statusCode: 200
      },
    });

    emailResource.addMethod("POST", undefined, {
      apiKeyRequired: true,
      requestParameters: {
        "method.request.header.X-Api-key": true,
      },
    });

    usagePlan.addApiStage({ stage: restApi.deploymentStage });
  }
}
