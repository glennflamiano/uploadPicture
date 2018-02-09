(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetCurrent = GetCurrent;
        service.GetAdmin = GetAdmin;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.Insert = Insert;
        service.UploadFile = UploadFile;
 
        return service;
 
        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        // Added by glenn
        function GetAdmin() {
            return $http.get('/api/users/isAdmin').then(handleSuccess, handleError);
        }
        
        // Added by glenn
        function GetAll() {
            return $http.get('/api/users/all').then(handleSuccess, handleError);
        }
 
        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }
 
        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }
 
        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }
 
        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }
 
        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function Insert(user){
            return $http.post('/api/users/addUser', user).then(handleSuccess, handleError);
        }
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }

        // upload pic functions
        function UploadFile(file) {
            var fd = new FormData();
            fd.append('myfile', file.upload);
            console.log(fd);
            return $http.post('/api/users/upload', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }}).then(handleSuccess, handleError);
            /*return $http.post('/api/users/upload', (fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }));*/
        }
    }
 
})();