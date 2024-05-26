import * as cdk from "@aws-cdk/core";
import { HfLambdaServiceStack } from "./lambda-infra-stack";
import { LambdaRestApi } from "@aws-cdk/aws-apigateway";

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
      handler: lambdaServiceStack.serviceLambda.function,
      proxy: false,
    });

    const emailResource = restApi.root.addResource("email");
    emailResource.addMethod("POST");
  }
}
