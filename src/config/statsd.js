import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import StatsD from "node-statsd";

const statsdClient = new StatsD({ prefix: "aws.s3." });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function withStatsD(operation, label, command) {
  const start = process.hrtime();
  try {
    const response = await s3Client.send(command);
    const diff = process.hrtime(start);
    const durationMs = diff[0] * 1000 + diff[1] / 1e6;
    statsdClient.timing(`${label}.duration`, durationMs);
    statsdClient.increment(`${label}.success`);
    return response;
  } catch (error) {
    statsdClient.increment(`${label}.error`);
    throw error;
  }
}

export const uploadToS3 = (params) => withStatsD("s3.upload", "upload", new PutObjectCommand(params));
export const deleteFromS3 = (params) => withStatsD("s3.delete", "delete", new DeleteObjectCommand(params));

export { statsdClient };
