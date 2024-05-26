import * as cdk from "@aws-cdk/core";
import { Code, Function, Runtime, RuntimeFamily } from "@aws-cdk/aws-lambda";
import * as path from "path";

export class HfLambdaServiceStack extends cdk.Stack {
  readonly serviceLambda: {
    function: Function;
  };

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.serviceLambda = this.createLambdaFunction();
  }

  private createLambdaFunction() {
    const handler = new Function(this, "LambdaService", {
      code: Code.fromAsset(
        path.join(
          __dirname,
          "..",
          "..",
          "rust-service/target/lambda/hfmiddleburg",
        ),
      ),
      runtime: new Runtime('provided.al2023', RuntimeFamily.OTHER),
      handler: "does_not_matter",
      functionName: "HfMiddleburgApiLambda",
    });

    return { function: handler };
  }
}
