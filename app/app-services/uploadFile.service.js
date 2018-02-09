(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('uploadFile', Service);
 
    function Service($http, $q) {

    	var service = {};

    	service.uploadFile = uploadFile;

    	return service;

        function uploadFile(file) {
			var fd = new FormData();
			fd.append('myfile', file.upload);
			return $http.post('/api/users/upload', fd, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			});
		}
    }
 
})();


/*angular.module('uploadFileService', [])

.service('uploadFile', function($http) {
	this.upload = function(file) {
		var fd = new FormData();
		fd.append('myfile', file.upload);
		return $http.post('/upload', fd, {
			transformRequest: angular.identity,
			headers: { 'Content-Type': undefined }
		});
	};
});*/