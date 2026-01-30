declare module 'africastalking' {
  interface AfricasTalkingConfig {
    apiKey: string;
    username: string;
  }

  interface SMSSendOptions {
    to: string[];
    message: string;
    from?: string;
  }

  interface SMSSendResponse {
    SMSMessageData: {
      Message: string;
      Recipients: Array<{
        statusCode: number;
        number: string;
        status: string;
        cost: string;
        messageId: string;
      }>;
    };
  }

  interface SMSClient {
    send(options: SMSSendOptions): Promise<SMSSendResponse>;
  }

  interface AfricasTalkingInstance {
    SMS: SMSClient;
  }

  function AfricasTalking(config: AfricasTalkingConfig): AfricasTalkingInstance;

  export = AfricasTalking;
}
