import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

const REGION = process.env.B2_BUCKET_REGION!;
const BUCKET = process.env.B2_BUCKET_NAME!;
const PUBLIC_URL = process.env.B2_PUBLIC_URL!;

const s3 = new S3Client({
  endpoint: `https://s3.${REGION}.backblazeb2.com`,
  region: REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

const ALLOWED_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function uploadImageToB2(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  const contentType = ALLOWED_MIME_TYPES[ext];
  if (!contentType) throw new Error("Invalid image type");

  const key = `posts/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${PUBLIC_URL}/${key}`;
}
