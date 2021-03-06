/*
 * GET upload page.
 */
exports.index = function(req, res){
    var crypto = require("crypto"),
        mime = require("mime-magic"),
        _ = require("underscore");

    var folder;
    if (typeof(req.params.folder) == "undefined") {
        folder = "";
    } else {
        folder = req.params.folder + '/';
    }

    var s3SuccessActionStatus = '201';
    var s3Acl = "public-read";
    var s3Policy = {
        "expiration": "2038-01-01T00:00:00Z",
        "conditions": [
            {"bucket": process.env.S3_BUCKET_NAME},
            ["starts-with", "$key", folder],
            {"acl": s3Acl},
            {"success_action_status": s3SuccessActionStatus},
            ["content-length-range", 0, parseInt(process.env.MAX_UPLOAD_SIZE, 10)]
        ]
    };

    var policy = new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' );
    var signature = crypto.createHmac( "sha1", process.env.AWS_SECRET_ACCESS_KEY ).update( policy ).digest( "base64" );

    res.render('uploader', _.extend({
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
            s3Acl: s3Acl,
            s3Bucket: process.env.S3_BUCKET_NAME,
            s3Folder: folder,
            s3Policy: policy,
            s3Signature: signature,
            s3SuccessActionStatus: s3SuccessActionStatus,
            maxUploadSize: process.env.MAX_UPLOAD_SIZE
        }, module.exports.locals)
    );
};

module.exports = {
    // Template parameters, to be overridden
    locals: {
        title: "Upload!"
    },

    index: exports.index
};
