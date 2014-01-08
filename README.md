# Amazon S3 Multi Uploader

An Express.js "module" providing the ability to upload multiple images to S3 using a simple, extensible interface.

![amazon-s3-multi-uploader](http://taeram.github.io/media/amazon-s3-multi-uploader-screenshot.png)

### Requirements
* A [Heroku](https://www.heroku.com/) account
* An [Amazon AWS](http://aws.amazon.com/) account
* Your Amazon AWS Access Key and Secret Key
* An [Amazon S3](http://aws.amazon.com/s3/) bucket, for storing the images
* Node.js and NPM properly installed

## Module Integration

See the [amazon-s3-multi-uploader-example](https://github.com/taeram/amazon-s3-multi-uploader-example) repository
for a working implementation of the "module", and how you might approach integrating it into your own
express.js application.

## Module Setup

Add the following config variables to your Heroku application:

* `AWS_ACCESS_KEY_ID` - Your Amazon AWS Access Key
* `AWS_SECRETACCESS_KEY` - Your Amazon AWS Secret Key
* `S3_BUCKET_NAME` - The Amazon S3 bucket to store the uploaded files
* `MAX_UPLOAD_SIZE` - The maximum file size, in bytes

```bash
heroku config:set AWS_ACCESS_KEY_ID=secret \
                  AWS_SECRET_ACCESS_KEY=secret \
                  S3_BUCKET_NAME=foo-bar-baz \
                  MAX_UPLOAD_SIZE=5242880
```

Add this CORS policy to your S3 bucket, making sure to replace `http://YOUR_WEBSITE`
with the url where the uploader will be hosted.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://YOUR_WEBSITE/</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
    </CORSRule>
</CORSConfiguration>
```

### Post-Upload Callbacks

In your code, you can hook into the post-upload callback by defining your own
angular module in your project's JavaScript:

```js
/* Services */
angular.module('uploaderApp.services', []).
    factory('notify', ['$window', function($window) {
        return function($scope, file) {
            console.log("Upload completed", file);
        }
    }
]);
```
