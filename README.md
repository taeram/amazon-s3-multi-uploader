# Amazon S3 Multi Uploader

An Express.js module providing the ability to upload multiple images to S3 using a simple, extensible interface.

![amazon-s3-multi-uploader](http://taeram.github.io/media/amazon-s3-multi-uploader-screenshot.png)

### Requirements
* A [Heroku](https://www.heroku.com/) account
* An [Amazon AWS](http://aws.amazon.com/) account
* Your Amazon AWS Access Key and Secret Key
* An [Amazon S3](http://aws.amazon.com/s3/) bucket, for storing the images
* Node.js and NPM properly installed

### Application Setup

See the [amazon-s3-multi-uploader-example](https://github.com/taeram/amazon-s3-multi-uploader-example) repository
for a working implementation.

## Setup

### Heroku Setup
```bash
heroku config:set AWS_ACCESS_KEY_ID=secret \
                  AWS_SECRET_ACCESS_KEY=secret \
                  S3_BUCKET_NAME=foo-bar-baz
```

### Amazon S3 Setup
Add this CORS policy to your S3 bucket

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```
