'use strict';

angular.module('analysis').controller('AnalysisController', ['$scope', '$stateParams', '$location', 'Authentication', 'AnalysisData', 'Locations',
	function($scope, $stateParams, $location, Authentication, AnalysisData, Locations) {
		$scope.authentication = Authentication;
        $scope.market = $stateParams.market;
        console.log('Analysis controller for market ' + $scope.market);
        $scope.panelClass = "panel-body";

        console.log("AnalysisController!");
        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.locationInput = "";
        $scope.dataList = [];
        $scope.pageDataList = [];
        $scope.graphSelectedSeries = "ALL";
        $scope.locations = [];
        $scope.averageLMP = 0; $scope.averageMLC = 0; $scope.averageMCC = 0; $scope.averageMEC = 0; 
        $scope.labels = [" ", " "];

        $scope.series = ["LMP", "MLC", "MCC", "MEC"];
        $scope.graphData = [
            [0, 0],
            [0, 0]
        ];
        $scope.graphOptions = { 
                                //datasetFill : false, 
                                pointDotRadius : 3
                              };

        $scope.currentPage = 1;
        $scope.itemsPerPage = 24;
        $scope.totalItems = 0;

        $scope.labelsFilter = function (label,index){return false;};

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        //angular bootstrap
        $scope.openFrom = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedFrom = true;
        };
        $scope.openTo = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedTo = true;
        };

        $scope.toUTCDate = function(dateStr){
            var date = new Date(dateStr);
            var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            return _utc;
        };
        
        function pad(n, width, z) {
          z = z || '0';
          n = n + '';
          return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        $scope.toUTCDateString = function(dateStr){
            var date = new Date(dateStr);
            var _utc = pad((date.getUTCMonth()+1),2) + "-" + pad(date.getUTCDate(),2) + "-" + date.getUTCFullYear()  + " " + pad(date.getUTCHours(),2) + ":" + pad(date.getUTCMinutes(),2);
            return _utc;
        };


        $scope.fillGraphData = function(){
            var serie = $scope.graphSelectedSeries;
            $scope.labels = [];
            var LMP = [], MLC = [], MCC = [], MEC = [];
            $scope.graphData = [];
            var avgLMP = 0, avgMLC = 0, avgMCC = 0, avgMEC = 0;
            $scope.dataList.forEach(function(item){
                avgLMP += item.LMP; avgMLC += item.MLC; avgMCC += item.MCC; avgMEC += item.MEC;
                $scope.labels.push($scope.toUTCDateString(item.Interval));
                LMP.push(item.LMP);
                MLC.push(item.MLC);
                MCC.push(item.MCC);
                MEC.push(item.MEC);
            });
            $scope.averageLMP = (avgLMP / $scope.dataList.length).toFixed(2); 
            $scope.averageMLC = (avgMLC / $scope.dataList.length).toFixed(2); 
            $scope.averageMCC = (avgMCC / $scope.dataList.length).toFixed(2); 
            $scope.averageMEC = (avgMEC / $scope.dataList.length).toFixed(2); 
            if(serie === "ALL" || serie === "LMP"){
                $scope.graphData.push(LMP);
            }
            if(serie === "ALL" || serie === "MLC"){
                $scope.graphData.push(MLC);
            }
            if(serie === "ALL" || serie === "MCC"){
                $scope.graphData.push(MCC);
            }
            if(serie === "ALL" || serie === "MEC"){
                $scope.graphData.push(MEC);
            }
        };

        $scope.search = function(){
            console.log("Searching ");
            $scope.panelClass = "panel-body whirl standard";
            $scope.dataList = AnalysisData.query({market: $scope.marketInput, location: $scope.locationInput, dateFrom: $scope.dateFromInput, dateTo: $scope.dateToInput}, function(){
                $scope.panelClass = "panel-body";
                $scope.totalItems = $scope.dataList.length;
                var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
                $scope.pageDataList = $scope.dataList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
                //fill the graph data
                $scope.fillGraphData();
            });
        };

        $scope.filterSeries = function(serie){
            $scope.graphSelectedSeries = serie;
            $scope.fillGraphData();
        };

        $scope.fillLocations = function(callback){
            console.log("searching locations for " + $scope.marketInput);
            $scope.locations = Locations.query({market: $scope.marketInput }, function(){
                if($scope.locations.length>0){
                    $scope.locationInput = $scope.locations[0].toString();
                    console.log('First location ' + $scope.locationInput);
                }
                callback();                
            });
        };

        $scope.exportData = function(){
            var finalData = [ ['Interval', 'Settlement_Location', 'Pnode', 'LMP', 'MLC', 'MCC', 'MEC'] ];
            $scope.dataList.forEach(function(item){
                finalData.push( [$scope.toUTCDateString(item.Interval), item.Settlement_Location, item.Pnode, item.LMP, item.MLC, item.MCC, item.MEC] );
            });
            return(finalData);
        };

        $scope.pageChanged = function(){
            console.log('Page changed to ' + $scope.currentPage);
            var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
            $scope.pageDataList = $scope.dataList.slice(indexFrom, indexFrom + $scope.itemsPerPage);

        };

        $scope.$on('create', function (event, chart) {
            console.log('chart created!');
            console.log(chart);
        });    

        $scope.initPage = function(){
/*
            angular.element('#datatable1').dataTable({
                    'paging':   true,  // Table pagination
                    'ordering': true,  // Column ordering 
                    'info':     true,  // Bottom left status text
                    // Text translation options
                    // Note the required keywords between underscores (e.g _MENU_)
                    oLanguage: {
                        sSearch:      'Search all columns:',
                        sLengthMenu:  '_MENU_ records per page',
                        info:         'Showing page _PAGE_ of _PAGES_',
                        zeroRecords:  'Nothing found - sorry',
                        infoEmpty:    'No records available',
                        infoFiltered: '(filtered from _MAX_ total records)'
                    }
                });
*/
            
            $scope.fillLocations(function(){
                $scope.search();
            });
        };
	}
]);