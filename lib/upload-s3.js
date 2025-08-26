const AWS = require('aws-sdk')
const Timer = require('./timer')

// configure AWS to log to stdout
AWS.config.update({
    logger: process.stdout
})

module.exports = function (stream, config, key) {
    if (!stream || typeof stream.on !== 'function') {
        throw new Error('invalid stream provided')
    }
    return new Promise((resolve, reject) => {
        const timer = new Timer();
        console.log(
            'streaming dump to s3 ' +
            `bucket=${config.S3_BUCKET}, ` +
            `key=${key} ` +
            `region=${config.S3_REGION}` +
            `storageclass=${config.S3_STORAGE_CLASS}` +
            `url=${config.S3_URL}`
        )
        const s3 = new AWS.S3({
            params: {
                Bucket: config.S3_BUCKET,
                Key: key,
                //ACL: 'bucket-owner-full-control',
                StorageClass: config.S3_STORAGE_CLASS
            },
            endpoint: config.S3_URL
        })
        
    // ---- Key change: give the managed uploader bigger parts ----
        // Pick 64 MiB (good for backups up to ~640 GiB). Go bigger if needed.
        const partSize = Number(process.env.S3_PART_SIZE_MB || 64) * 1024 * 1024

        const uploader = s3.upload(
        { Body: stream },
        {
            partSize,          // << prevent hitting the 10,000 part limit
            queueSize: 4,      // parallel uploads (tune for your bandwidth/CPU)
            leavePartsOnError: false
        }
        )
        .send((err, data) => {
            if (err) {
                reject(err)
            }
            else {
                console.log(
                    'SUCCESS: The backup was uploaded to ' +
                    `${data.Location} in ${timer.elapsedString()}`
                )
                resolve(data.Location)
            }
        })
    })
}
