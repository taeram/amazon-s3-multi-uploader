'use strict';

// Declare app level module
angular.module('uploaderApp', ['uploaderApp.controllers', 'uploaderApp.directives', 'uploaderApp.services']);

/* Directives */
angular.module('uploaderApp.directives', []).
    directive('fileChange', [function() {
        // Add a directive so we can trigger change events on file inputs
        // Retrieved on 2013-07-28 from http://jsfiddle.net/neilsarkar/vQzKJ/
        return {
            link: function(scope, element, attrs) {
                element[0].onchange = function() {
                    scope[attrs['fileChange']](element[0]);
                };
            }
        };
    }
]);

/* Services */
angular.module('uploaderApp.services', []).
    factory('notify', ['$window', function($window) {
        return function($scope, file) {
            console.log("Upload completed", file);
        }
    }
]);

/* Controllers */

/**
 * The uploader controller
 *
 * @param Scope $scope The Angular.js scope
 */
angular.module('uploaderApp.controllers', [])
    .controller('UploaderCtrl', ['$scope', 'notify', function($scope, $uploadCompleteCallback) {

    // Initialize our variables
    $scope.files = [];

    // Fit the input box the same size as its button
    var inputFile = $('.input-file');
    $(inputFile).css({
        height: $(inputFile).parent().css('height'),
        width: $(inputFile).parent().css('width'),
        marginTop: '-' + $(inputFile).parent().css('paddingTop'),
        marginLeft: '-' + $(inputFile).parent().css('paddingLeft')
    });
    $(inputFile).attr('multiple', 'multiple');

    /**
     * Get the total number of bytes to upload
     *
     * @return integer
     */
    $scope.getBytesTotal = function () {
        var bytesTotal = 0;
        for (var i=0; i < $scope.files.length; i++) {
            bytesTotal += $scope.files[i].size;
        }

        return bytesTotal;
    };

    /**
     * Get the total number of bytes uploaded
     *
     * @return integer
     */
    $scope.getBytesUploaded = function () {
        var bytesUploaded = 0;
        for (var i=0; i < $scope.files.length; i++) {
            if ($scope.files[i].bytesUploaded !== undefined) {
                bytesUploaded += $scope.files[i].bytesUploaded;
            }
        }

        return bytesUploaded;
    };

    /**
     * Return the upload progress as a percentage
     *
     * @return integer
     */
    $scope.getUploadProgress = function () {
        var bytesTotal = $scope.getBytesTotal();
        var bytesUploaded = $scope.getBytesUploaded();

        return (bytesUploaded / bytesTotal) * 100;
    };

    /**
     * Get the number of files left to upload
     *
     * @return integer
     */
    $scope.getFilesToUpload = function () {
        return _.filter($scope.files, function (file) {
            return !file.isUploaded;
        }).length;
    };

    /**
     * Add one or more files to the upload queue
     *
     * @param DOM element The file upload element
     */
    $scope.addFiles = function(element) {
        if ($scope.getUploadProgress() > 0) {
            // Clear previously uploaded files
            $scope.files = [];
        }

        $scope.$apply(function() {
            // Add the files to the list
            for (var i=0; i < element.files.length; i++) {
                var file = element.files[i];
                file.sizeFormatted = number_format(file.size);
                file.progress = 0;
                file.url = null;
                file.isUploaded = false;

                $scope.files.push(file);
            }

            // Make sure there are no dupes
            $scope.files = _.uniq($scope.files);
        });
    };

    /**
     * Clear all files from the upload queue
     */
    $scope.clearFiles = function () {
        // Abort any pending uploads
        for (var i=0; i < $scope.files.length; i++) {
            if ($scope.files[i].xhr !== undefined) {
                $scope.files[i].xhr.abort();
            }
        }

        $scope.files = [];
    };

    /**
     * Remove a single file from the upload queue
     *
     * @param File file The file to remove
     */
    $scope.removeFile = function (file) {
        if (file.xhr !== undefined) {
            file.xhr.abort();
        }

        $scope.files = _.without($scope.files, file);
    };

    /**
     * Upload the files in the queue
     *
     * @params Event $event The DOM event
     */
    $scope.uploadFiles = function ($event) {
        $event.preventDefault();

        // Get the form data as a key => value array
        var formObject = $('.form-upload').serializeObject();
        var formUrl = $('.form-upload').attr('action');
        var formMethod = $('.form-upload').attr('method');

        for (var i=0; i < $scope.files.length; i++) {
            var file = $scope.files[i];

            // Don't upload the same file twice
            if (file.isUploaded == false) {
                var u = new Uploader($scope, $uploadCompleteCallback, file, formObject, formUrl, formMethod);
                u.send();
            }
        }
    };
}]);

/**
 * The uploader class
 *
 * @param Scope $scope The Angular.js scope
 * @param function $uploadCompleteCallback The upload complete callback function
 * @param File file The file to upload
 * @param object formObject The form fields in a key => value object
 * @param string formUrl The url to upload the file to
 * @param string formMethod The form method
 */
function Uploader($scope, $uploadCompleteCallback, file, formObject, formUrl, formMethod) {
    this.file = file;
    this.formObject = formObject;
    this.formUrl = formUrl;
    this.formMethod = formMethod;
    this.$scope = $scope;
    this.$uploadCompleteCallback = $uploadCompleteCallback;
}

/**
 * Upload the file
 */
Uploader.prototype.send = function () {
    var $this = this;
    var xhr = new XMLHttpRequest();
    this.file.xhr = xhr;

    /**
     * Update the upload progress for this file
     *
     * @param Event e The event
     */
    var uploadProgress = function(e) {
        var percent = Math.round((e.loaded / e.total) * 100);
        $this.$scope.$apply(function() {
            $this.file.bytesUploaded = e.loaded;
            $this.file.progress = percent;
        });
    };
    xhr.upload.addEventListener("progress", uploadProgress, false);

    /**
     * Triggered when the upload is complete
     *
     * @param Event e The event
     */
    var uploadComplete = function(e) {
        var url = $(e.target.responseXML).find('Location').text();
        var folder = dirname($(e.target.responseXML).find('Key').text());

        $this.$scope.$apply(function() {
            $this.file.isUploaded = true;
            $this.file.url = url;
            $this.file.folder = folder;

            // Trigger the upload complete callback
            $this.$uploadCompleteCallback($this.$scope, $this.file);
        });

    };
    xhr.addEventListener("load", uploadComplete, false);

    // Assemble the form data
    var form = new FormData();
    for (var j in this.formObject) {
        form.append(j, this.formObject[j]);
    }
    form.append('file', this.file);

    // Super cEvin Attack Mode Go!
    xhr.open(this.formMethod, this.formUrl, true);
    xhr.send(form);
};
