import {
  SecretsManagerClient,
  CreateSecretCommand,
  GetSecretValueCommand,
  CreateSecretCommandOutput,
} from '@aws-sdk/client-secrets-manager';
import environment from '../../utils/environment';

const secretsManager = new SecretsManagerClient([
  {
    apiVersion: '2017-10-17',
    credentials: {
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
    },
    region: 'us-east-1',
  },
]);

export const createSecret = async (
  secretName: string,
  secretValue: string
): Promise<CreateSecretCommandOutput> => {
  const secretCommand = new CreateSecretCommand({
    Name: secretName,
    SecretString: secretValue,
  });

  const secret = await secretsManager.send(secretCommand);

  return secret;
};

export const getSecretValue = async (
  secretName: string
): Promise<string | undefined> => {
  const getCommand = new GetSecretValueCommand({
    SecretId: secretName,
  });
  const secret = await secretsManager.send(getCommand);

  return secret.SecretString;
};

// Add other methods for revoking a secret and updating a secret.
