'use strict';

angular.module('core').controller('KibanaController', ['$scope', 'Authentication', 'Menus', 'Elastic', 'Socket',
	function($scope, Authentication, Menus, Elastic, Socket) {
		$scope.authentication = Authentication;
        $scope.elasticStarted = false;
        $scope.indexing = false;
        $scope.DADocs = 0;
        $scope.RTBMDocs = 0;
        $scope.finishedDA = false;
        $scope.finishedRTBM = false;
        
        $scope.initPage = function(){
            console.log('InitPage on KibanaController');
            Elastic.get(function(response){
                console.log('Elastic returned');
                console.log(response.ready);
                $scope.elasticStarted = response.ready;
            });
        };
        
        $scope.indexAll = function(){
            console.log('IndexAll on KibanaController');
            $scope.indexing = true;
            $scope.finishedDA = false;
            $scope.finishedRTBM = false;
            Elastic.save(function(response){
                console.log('Elastic indexation returned');
            });
        };

        //socket.io
        Socket.on('elastic.index.progress.DA', function(process) {
            $scope.DADocs = 'Processed ' + process.processed + ' rows';
        });
        
        Socket.on('elastic.index.progress.RTBM', function(process) {
            $scope.RTBMDocs = 'Processed ' + process.processed + ' rows';
        });
        
        Socket.on('elastic.index.end.DA', function(process) {
            $scope.DADocs = 'FINISH, total rows ' + process.processed;
            $scope.finishedDA = true;
            if($scope.finishedRTBM){
                $scope.indexing = false;
            }
        });
        
        Socket.on('elastic.index.end.RTBM', function(process) {
            $scope.RTBMDocs = 'FINISH, total rows ' + process.processed;
            $scope.finishedRTBM = true;
            if($scope.finishedDA){
                $scope.indexing = false;
            }
        });
        
	}
]);