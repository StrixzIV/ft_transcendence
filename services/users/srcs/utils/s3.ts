import { Readable } from "stream";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: "us-east-1",
    endpoint: "http://minio:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER ?? "",
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? ""
    }
});

export async function stream_to_buf(stream: Readable): Promise<Buffer> {
    
    return new Promise((resolve, reject) => {

        const chunks: Buffer[] = [];
    
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    
    });

}
