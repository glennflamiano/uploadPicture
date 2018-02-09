(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Home.IndexController', Controller);
 
     function Controller($window, AssetService, FlashService, $scope, $interval, $filter, DeviceService, socket, FieldsService) {
 
        //initialization
        $scope.assets = [];
        $scope.warehouses = [];
        $scope.reverse = false;
        $scope.sortColumn = "tag";
        $scope.fields = [];
        $scope.isNull = false;
        $scope.readOnly = true;
		
		$scope.loading = true;
        
        // function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        
        $scope.reportColumns = [];
        
        
        function getAllFields(){
          FieldsService.GetAll("asset").then(function(response){
               $scope.fields = response.fields;
               $scope.fieldsLength = Object.size(response.fields);
        }).catch(function(err){
                alert(err.msg_error);
            }).finally(function() {
				$scope.loading = false;
			});
        };
        
        getAllFields();


 

        //need to store filtered assets to correct total items in pagination
        //this is so that the number of pages are correct
        $scope.$watch(function(){
            $scope.filtered_assets = $scope.$eval("assets | filter: search | orderBy: sortColumn : reverse");
        });

        // get realtime changes
        socket.on('assetChange', function(){
            getAllAssets();
            $scope.searchColumn = "";
            $scope.search = {};
        });

        function getAllAssets(){
            //get all assets
            AssetService.GetAll().then(function(assets){
                if(assets.length > 0){               
                    //store to array
                    $scope.assets = assets;
                }
                else{
                    //perform notification here
                    FlashService.Error("No assets found");
                }
            })
            .catch(function(error){
                errorFunction(error);
            });
        }

        //get all assets when controller is first loaded
        getAllAssets();
    };

    
})();