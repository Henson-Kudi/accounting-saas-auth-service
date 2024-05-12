import crypto from 'crypto';

export default function generateKeyPair(passphrase: string): {
  privateKey: string;
  publicKey: string;
} {
  const key = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key size (can be 2048, 3072, or 4096)
    publicKeyEncoding: {
      type: 'pkcs1', // PKCS#1 format for public key
      format: 'pem', // PEM format
    },
    privateKeyEncoding: {
      type: 'pkcs1', // PKCS#1 format for private key
      format: 'pem', // PEM format
      cipher: 'aes-256-cbc', // Encryption algorithm for private key
      passphrase: passphrase, // Passphrase to protect the private key
    },
  });

  console.log(JSON.stringify(key, null, 2));

  return key;
}
