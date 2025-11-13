import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function uploadToS3(base64Image: string, filename: string) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const uploadParams = {
    Bucket: process.env.S3_BUCKET!,
    Key: `gallery/${filename}`,
    Body: buffer,
    ContentType: "image/png",
  };

  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/gallery/${filename}`;
}
