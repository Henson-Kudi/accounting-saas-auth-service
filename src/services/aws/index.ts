import AWSService from '../../types/services/AWSService';
import * as secretsManager from './secretsManager';

const AwsService: AWSService = {
  secretsManager,
};

export default AwsService;
