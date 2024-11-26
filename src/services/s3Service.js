import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { statsdClient } from "../config/statsd.js";
import logger from "../utils/logger.js";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to measure operation duration with StatsD
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
    logger.error(`S3 ${operation} Error: ${error.message}`);
    throw error;
  }
}

// Function to upload a file to S3
export const uploadToS3 = (params) =>
  withStatsD("upload", "s3.upload", new PutObjectCommand(params));

// Function to delete a file from S3
export const deleteFromS3 = (params) =>
  withStatsD("delete", "s3.delete", new DeleteObjectCommand(params));

export default s3Client;
