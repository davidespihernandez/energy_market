'use strict';

angular.module('core').controller('KibanaController', ['$scope', 'Authentication', 'Menus', 'Elastic', 'KibanaDashboards', 'Socket','$sce',
	function($scope, Authentication, Menus, Elastic, KibanaDashboards, Socket, $sce) {
		$scope.authentication = Authentication;
        $scope.elasticStarted = false;
        $scope.indexing = false;
        $scope.DADocs = 0;
        $scope.RTBMDocs = 0;
        $scope.finishedDA = false;
        $scope.finishedRTBM = false;
        $scope.dashboardList = [];
        $scope.formDashboards = {};
        
                                                       
        $scope.initPage = function(){
            console.log('InitPage on KibanaController');
            Elastic.get(function(response){
                $scope.elasticStarted = response.ready;
                //now retrieve all dashboards
                $scope.dashboardList = [];
                KibanaDashboards.get(function(resp){
                    resp.dashboardsList.forEach(function(dashboard){
                        //$scope.dashboardList.push({title: dashboard.title, url: "http://localhost:5601/#/dashboard/Day-Ahead?_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-30d,mode:quick,to:now))&_a=(filters:!(),panels:!((col:1,id:SPP-Day-Ahead-LMP,row:1,size_x:2,size_y:5,type:visualization),(col:1,id:ERCOT-Day-Ahead-LMP,row:12,size_x:2,size_y:5,type:visualization),(col:3,id:SPP-Day-Ahead-Averages-Table,row:1,size_x:10,size_y:5,type:visualization),(col:1,id:SPP-Day-Ahead-hourly-LMP-Line-Chart,row:6,size_x:12,size_y:6,type:visualization),(col:1,id:ERCOT-Day-Ahead-hourly-LMP-Line-Chart,row:17,size_x:12,size_y:6,type:visualization),(col:3,id:ERCOT-Day-Ahead-Averages-Table,row:12,size_x:10,size_y:5,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'*')),title:'Day%20Ahead')"});
                        $scope.dashboardList.push({title: dashboard.title, url: dashboard.url});
                    });
                    $scope.dashboards = resp.dashboards;
                    $scope.formDashboards = resp.dashboards;
                });
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
            
        $scope.saveDashboards = function(){
            KibanaDashboards.save($scope.formDashboards, function(response){
                console.log('Saved!');
                $scope.dashboards = $scope.formDashboards;
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