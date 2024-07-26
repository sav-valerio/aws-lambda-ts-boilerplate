import random from '@utils/random';

import { Tracer } from '@aws-lambda-powertools/tracer';
import { Logger } from '@aws-lambda-powertools/logger';
import { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { LogLevel } from '@aws-lambda-powertools/logger/types';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const { LOG_LEVEL } = process.env;

const serviceName = 'lambda-boilerplate';
const logger = new Logger({
  serviceName,
  logLevel: LOG_LEVEL as LogLevel,
});
const tracer = new Tracer({ serviceName });

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(event: APIGatewayProxyEvent, context: any): Promise<APIGatewayProxyResult> {
    logger.addContext(context);

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello World!', value: random() }),
    };

    return response;
  }
}

export const handlerClass = new Lambda();
export const { handler } = handlerClass;
