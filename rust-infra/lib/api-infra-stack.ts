import * as cdk from '@aws-cdk/core';
import {HttpApi} from '@aws-cdk/aws-apigatewayv2';
import { AccountRecovery, UserPool, UserPoolClient, UserPoolClientIdentityProvider } from '@aws-cdk/aws-cognito';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { LambdaServiceStack } from './lambda-infra-stack';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';

export class ApiGatewayStack extends cdk.Stack {
  readonly apiGatewayResources: {
    httpApi: HttpApi
  };


  constructor(scope: cdk.Construct, id: string, lambdaServiceStack: LambdaServiceStack, props?: cdk.StackProps) {
    super(scope, id, props);
    const apiGatewayResources = this.createApiGatewayResources(lambdaServiceStack);   
  }
  
  private createApiGatewayResources(lambdaServiceStack: LambdaServiceStack) {
    const userPool = new UserPool(this, 'userpool', {
      userPoolName: `service-user-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {email: true},
      autoVerify: {email: true},
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });

    const userPoolClient = new UserPoolClient(this, 'userpool-client', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    const authorizer = new HttpUserPoolAuthorizer(
      'user-pool-authorizer',
      userPool,
      {
        userPoolClients: [userPoolClient],
        identitySource: ['$request.header.Authorization'],
      },
    );

    


    const httpApi = new HttpApi(this, 'ServiceApi', {
      apiName: `service-api`,
    });

    httpApi.addRoutes({
      integration: new HttpLambdaIntegration(
        'protected-fn-integration',
        lambdaServiceStack.serviceLambda.function,
      ),
      path: '/hello',
      authorizer,
    });

    new cdk.CfnOutput(this, 'region', {value: cdk.Stack.of(this).region});
    new cdk.CfnOutput(this, 'userPoolId', {value: userPool.userPoolId});
    new cdk.CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'apiUrl', {
      value: httpApi.url!,
    });


    return {httpApi: httpApi}; 
  }
}
