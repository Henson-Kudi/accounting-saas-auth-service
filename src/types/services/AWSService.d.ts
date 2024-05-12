import {CreateSecretCommandOutput} from '@aws-sdk/client-secrets-manager';

export default interface AWSService {
  secretsManager: {
    getSecretValue(secretName: string): Promise<string | undefined>;
    createSecret(
      secretName: string,
      secretValue: string
    ): Promise<CreateSecretCommandOutput>;
  };
}
