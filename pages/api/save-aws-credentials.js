import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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

    // TEMP USER ID placeholder — we'll replace with real user auth later
    const user_id = 'test-user-123';

    const { error } = await supabase.from('aws_credentials').insert([
      {
        user_id,
        region,
        access_key: encryptedAccessKey,
        secret_key: encryptedSecretKey
      }
    ]);

    if (error) throw error;

    return res.status(200).json({ message: 'Credentials encrypted and stored in Supabase' });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}