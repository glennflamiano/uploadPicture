(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Account.IndexController', Controller)

        //Added for file upload
        .directive('fileModel', ['$parse', function($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var parsedFile = $parse(attrs.fileModel);
                    var parsedFileSetter = parsedFile.assign;

                    element.bind('change', function() {
                        scope.$apply(function() {
                            parsedFileSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }]);
 
    function Controller($window, UserService, FlashService, $scope, FieldsService, $timeout, $http, filepickerService) {
        var vm = this;
 
        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;
        $scope.aUsers = {};
        $scope.profilePicUrl = '';
        $scope.uploading = false; 

        //THIS added by dyano for uploading image please change variable names
                $scope.superhero = {};

                //Send the newly created superhero to the server to store in the db
                $scope.createSuperhero = function(){
                    $http.post('/superhero', $scope.superhero).then(function(data){
                                console.log(JSON.stringify(data));
                                //Clean the form to allow the user to create new superheroes
                                $scope.superhero = {};
                        });
                };

                //Single file upload, you can take a look at the options
                $scope.upload = function(){
                    filepickerService.pick(
                        {
                            mimetype: 'image/*',
                            language: 'en',
                            services: ['COMPUTER'],
                            openTo: 'COMPUTER'
                        },
                        function(Blob){
                            console.log(JSON.stringify(Blob));
                            $scope.superhero.picture = Blob;
                            $scope.$apply();
                        }
                    );
                };

                //Retrieve all the superheroes to show the gallery
                $http.get('/superhero')
                .then(function(data){
                    console.log(JSON.stringify(data));
                    $scope.superheroes = data;
                    console.log($scope.superheroes);
                });
        //end of THIS
 
        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                $scope.aUsers = user;
                $scope.profilePicUrl = user.profilePicUrl;
                if(user.profilePicUrl == undefined){
                    $scope.profilePicUrl = '';
                    $scope.modalPic = '';
                }
                $scope.modalPic = user.profilePicUrl;
            });
        }

        $scope.id = "";
        $scope.fields = [];
        $scope.name = 'user';
        function getAllFields(){
            FieldsService.GetAll($scope.name).then(function(response){
    
                $scope.fields = response.fields;
                $scope.id = response._id;
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        };
        
        getAllFields();
        initController();
 
        function saveUser() {
            if(vm.user.password===undefined){
                FlashService.Error("Enter New Password");
            }else{
                if(vm.user.password != vm.user.confirmPassword){
                    
                    FlashService.Error("Password doesn't match");
                }else{
                    UserService.Update(vm.user)
                        .then(function () {
                            FlashService.Success('User updated');
                        })
                        .catch(function (error) {
                            FlashService.Error(error);
                        });
                }
            }
        }
 
        function deleteUser() {

            if (confirm("sure to delete?")){


            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }

        //Functions for file upload
        $scope.file = {};
        $scope.message = false;
        $scope.alert = '';
        $scope.default = '';

        $scope.Submit = function() {
            //console.log('submit ', $scope.file);
            $scope.uploading = true;
            UserService.UploadFile($scope.file).then(function(data) {
                if (data.data.success) {
                    $scope.uploading = false;
                    $scope.alert = 'alert alert-success';
                    $scope.message = data.data.message;
                    $scope.file = {};
                } else {
                    $scope.uploading = false;
                    $scope.alert = 'alert alert-danger';
                    $scope.message = data.data.message;
                    $scope.file = {};
                }
            });
        };

        $scope.photoChanged = function(files) {
            if (files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg)$/)) {
                $scope.uploading = true;
                var file = files[0];
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = function(e) {
                    $timeout(function() {
                        $scope.thumbnail = {};
                        $scope.thumbnail.dataUrl = e.target.result;
                        $scope.modalPic = e.target.result;
                        //$scope.file = e.target.result;
                        //console.log('aaasswwewe', $scope.profilePicUrl);
                        $scope.uploading = false;
                        $scope.message = false;
                    });
                };
            } else {
                $scope.thumbnail = {};
                $scope.message = false;
            }
            console.log('photochanged ', $scope.file);
        }

        //End of functions for file upload
    }
 
})();