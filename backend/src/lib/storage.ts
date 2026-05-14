import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";

const client = new S3Client({
  endpoint: config.s3.endpoint || undefined,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: !config.s3.endpoint?.includes("amazonaws"),
});

const bucket = config.s3.bucket;

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return key;
}

export async function downloadFile(key: string): Promise<Buffer> {
  const { Body } = await client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
  return Buffer.from(await Body!.transformToByteArray());
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
}

export function getPublicUrl(key: string): string {
  if (config.s3.endpoint) {
    return `${config.s3.endpoint}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
}
