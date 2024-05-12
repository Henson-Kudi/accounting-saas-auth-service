// eslint-disable-next-line node/no-unpublished-import
import accessKey from '../../keys/accessKey.json';
// eslint-disable-next-line node/no-unpublished-import
import refreshKey from '../../keys/refreshKey.json';

export default {
  server: {
    port: process.env.PORT || 5003,
  },
  database: {
    name: 'mongo',
    uri: process.env.DATABASE_URI,
  },
  aws: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  },
  jwt: {
    accessKey: accessKey,
    refreshKey: refreshKey,
  },
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    noReply: process.env.SMTP_NO_REPLY,
  },
  google: {
    oauthClientId: process.env.GOOGLE_CLIENT_ID,
    oauthClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
};
