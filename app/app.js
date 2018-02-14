(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router', 'ui.sortable', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'btford.socket-io', 'angular-filepicker'])
        .config(config)
        .run(run);
 
    function config($stateProvider, $urlRouterProvider, $httpProvider, filepickerProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
        
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            
            //Added by Glenn
            .state('manageUsers', {
                url: '/manageUsers',
                templateUrl: 'manageUsers/index.html',
                controller: 'ManageUsers.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageUsers' }
            })

            //Added by Glenn
            .state('manageDevices', {
                url: '/manageDevices',
                templateUrl: 'manageDevices/index.html',
                controller: 'ManageDevices.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageDevices' }
            })
            
            //added by jeremy
            .state('asset', {
                url: '/asset',
                templateUrl: 'asset/index.html',
                controller: 'Asset.IndexController',
                //not yet used
                controllerAs: 'vm',
                data: {activeTab: 'asset'}
            })
            
            .state('fields' ,{
                url: '/fields?name',
                templateUrl: 'fields/index.html',
                controller: 'Fields.IndexController',
                controllerAs: 'vm',
                data: {activeTab: 'fields'}
            });

        //Add the API key to use filestack service -- added by dyan0
        filepickerProvider.setKey('A9oJJK1I8QSCvhFQpJzyGz');    
        

        // added by jeremy
        // this is to intercept all errors. when 401 is received, must redirect to login
        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();

                    //401 is unauthorized error, meaning token has expired 
                    if(rejection.status == 401){
                        //this is done to imitate the returnUrl in app.controller.js 
                        //when accessing pages that requires login

                        //pathname only shows /app/ which is wrong
                        //so get fullpath first then get substring starting from pathname
                        var fullpath = $window.location.href;
                        var returnUrl = fullpath.substring(fullpath.indexOf($window.location.pathname));

                        //add expired query to explicitly state that the session has expired and not just trying to access via typing the address
                        $window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl) + '&expired=true';
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    function run($http, $rootScope, $window, UserService) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
 
        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });

        //get current user and set details to rootScope
        $http.get('/api/users/isAdmin').success(function(response){
            //response is true if user is admin from api/users.controller.js
            if(response){

                // Determine if user is admin
                if(true){
                    // User can manage users
                    $rootScope.isAdmin = true;
                } else {

                    //User cannot manage users
                    $rootScope.isAdmin = false;
                }
            }
            else{
                return false;
            }
        });    

        
 
        getInitials();
  
        function getInitials() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                var str = user._id;

                if (user.firstName == null){
                    $rootScope.initials = "new";
                }
                else{
                    var initials = user.firstName.charAt(0) + user.lastName.charAt(0);
                    $rootScope.initials = initials.toUpperCase();
                    $rootScope.profilePic = user.profilePicUrl;
                    //$rootScope.profilePic = "https://theyoungerheroes.org/wp-content/uploads/blank-profile-pic.jpg";
                    if(user.profilePicUrl == undefined){
                        $rootScope.profilePic = '';
                    }
                }

                $rootScope.bgColor = {"background" : stringToColour(str)} ;

                function stringToColour(str) {
                    var hash = 0;
                    for (var i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var colour = '#';
                    for (var i = 0; i < 3; i++) {
                      var value = (hash >> (i * 8)) & 0xFF;
                      colour += ('00' + value.toString(16)).substr(-2);
                    }
                    return colour;
                  }
            });
        }
    }
 
    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;
 
            angular.bootstrap(document, ['app']);
        });
    });
})();