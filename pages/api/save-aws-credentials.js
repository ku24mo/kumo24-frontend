import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { S3Client, GetBucketAclCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY;
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, 'hex'),
    Buffer.from(encrypted.iv, 'hex')
  );
  let decrypted = decipher.update(Buffer.from(encrypted.content, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function runScan({ accessKeyId, secretAccessKey, region, bucketName }) {
  const client = new S3Client({
    region,
    forcePathStyle: false,
    endpoint: `https://s3.${region}.amazonaws.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  try {
    const aclRes = await client.send(new GetBucketAclCommand({ Bucket: bucketName }));
    const policyRes = await client.send(new GetBucketPolicyCommand({ Bucket: bucketName }));

    let risk = 'low';
    const grants = aclRes.Grants || [];
    const policy = JSON.parse(policyRes.Policy || '{}');

    if (
      grants.some(g => g.Grantee?.URI?.includes('AllUsers')) ||
      JSON.stringify(policy).includes('"Principal":"*"')
    ) {
      risk = 'public';
    }

    return {
      bucket: bucketName,
      acl: aclRes,
      policy,
      risk_level: risk
    };
  } catch (err) {
    console.error('Scan failed:', err);
    throw new Error('Error scanning bucket');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { accessKey, secretKey: awsSecretKey, region } = req.body;

  if (!accessKey || !awsSecretKey || !region) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    const encryptedAccessKey = encrypt(accessKey);
    const encryptedSecretKey = encrypt(awsSecretKey);

    const user_id = 'test-user-123';

    // 1. Save encrypted credentials
    const { error: insertError } = await supabase.from('aws_credentials').insert([
      {
        user_id,
        region,
        access_key: encryptedAccessKey,
        secret_key: encryptedSecretKey
      }
    ]);

    if (insertError) throw insertError;

    // 2. Decrypt credentials for scanning
    const accessKeyId = decrypt(encryptedAccessKey);
    const secretAccessKey = decrypt(encryptedSecretKey);

    // 3. Run scan
    const result = await runScan({ accessKeyId, secretAccessKey, region, bucketName: 'kumo24-test-bucket' });

    // 4. Save scan result
    const { error: scanInsertError } = await supabase.from('scan_results').insert([
      {
        user_id,
        region,
        bucket: result.bucket,
        acl: result.acl,
        policy: result.policy,
        risk_level: result.risk_level
      }
    ]);

    if (scanInsertError) throw scanInsertError;

    return res.status(200).json({ message: 'Credentials saved and scan completed', scan: result });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}