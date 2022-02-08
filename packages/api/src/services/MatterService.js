const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {  GetObjectCommand } = require('@aws-sdk/client-s3');
const client = require('../lib/s3-client')

const MATTER_BUCKET_NAME = 'mma-webapp-dev-bucket'

exports.generatePresignedUrl = async (Key) => {

    const command = new GetObjectCommand({
         Bucket: MATTER_BUCKET_NAME,
         Key,
    });

    /**
     * Generate Pre-signed url using getSignedUrl expires after 1 hour
     */
    return getSignedUrl(client, command, { expiresIn: 3600 });
}