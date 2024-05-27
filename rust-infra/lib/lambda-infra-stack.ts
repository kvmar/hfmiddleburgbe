import * as cdk from "@aws-cdk/core";
import { Code, Function, Runtime, RuntimeFamily } from "@aws-cdk/aws-lambda";
import * as path from "path";
import { Topic } from "@aws-cdk/aws-sns"
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export class HfLambdaServiceStack extends cdk.Stack {
  readonly serviceLambda: Function

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const topic = new Topic(this, 'Topic', {
      topicName: 'HfEmailNoti',
      displayName: 'Email notification topic',
    });

    this.serviceLambda = new Function(this, "LambdaService", {
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
      environment: {
        "EMAIL_SNS_TOPIC": topic.topicArn
      }
    });

    topic.grantPublish(this.serviceLambda);
  }
}
