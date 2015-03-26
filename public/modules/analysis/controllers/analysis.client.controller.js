'use strict';

angular.module('analysis').controller('AnalysisController', ['$scope', '$timeout', '$stateParams', '$location', 'Authentication', 'AnalysisData', 'Locations',
	function($scope, $timeout, $stateParams, $location, Authentication, AnalysisData, Locations) {
        
		$scope.authentication = Authentication;
        $scope.availableMarkets = [{value: 'DA', label: 'Day Ahead'}, {value: 'RTBM', label: 'Real Time'}];
        $scope.comboboxes = {};
        $scope.comboboxes.selectedLocations = [];
        $scope.comboboxes.selectedMarket = $scope.availableMarkets[0];
        $scope.panelClass = "panel-body";

        console.log("AnalysisController!");
        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.dataList = [];
        $scope.graphSelectedSeries = "ALL";
        $scope.locations = [];
        $scope.averageLMP = 0; $scope.averageMLC = 0; $scope.averageMCC = 0; $scope.averageMEC = 0; 
        $scope.labels = [" ", " "];
        $scope.showAveragesOnGraph = false;

        $scope.series = ["LMP", "MLC", "MCC", "MEC"];
        $scope.graphData = [
            [0, 0],
            [0, 0]
        ];
        $scope.graphOptions = { 
                                //datasetFill : false, 
                                pointDotRadius : 3,
                                legend: false
                              };

        $scope.currentPage = 1;
        $scope.itemsPerPage = 24;
        $scope.totalItems = 0;
        
        
        //Grid
  $scope.gridOptions = {
    paginationPageSizes: [24, 48, 72],
    paginationPageSize: 24,
    enableSorting: true,
    columnDefs: [
      { field: 'Interval', name: 'Date' },
      { field: 'Settlement_Location', name: 'Location' },
      { field: 'LMP', name: 'LMP'},
      { field: 'MLC', name: 'MLC'},
      { field: 'MCC', name: 'MCC'},
      { field: 'MEC', name: 'MEC'}
    ]
  };
        
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

        //this method is for showing only 4 lines, for a single location
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
        
        //method for multiple locations
        $scope.fillGraphDataNew = function(){
            var serie = $scope.graphSelectedSeries;
            $scope.labels = [];
            $scope.graphData = [];
            var newSeries = [];
            var newLabels = [];
            var newData = {};
            var avgLMP = 0, avgMLC = 0, avgMCC = 0, avgMEC = 0;
            var measures = [serie];
            if(serie === "ALL"){
                measures = ["LMP", "MLC", "MCC", "MEC"];
            }
            $scope.dataList.forEach(function(item){
                if(newLabels.indexOf($scope.toUTCDateString(item.Interval))===-1){
                    newLabels.push($scope.toUTCDateString(item.Interval));
                }
                //check series
                measures.forEach(function(measure){
                    var seriesLabel = item.Settlement_Location + " - " + measure;
                    if(newSeries.indexOf(seriesLabel)===-1){
                        newSeries.push(seriesLabel);
                        newData[seriesLabel] = [];
                    }
                    newData[seriesLabel].push(item[measure]);
                });
                avgLMP += item.LMP; avgMLC += item.MLC; avgMCC += item.MCC; avgMEC += item.MEC;
            });
            $scope.averageLMP = (avgLMP / $scope.dataList.length).toFixed(2); 
            $scope.averageMLC = (avgMLC / $scope.dataList.length).toFixed(2); 
            $scope.averageMCC = (avgMCC / $scope.dataList.length).toFixed(2); 
            $scope.averageMEC = (avgMEC / $scope.dataList.length).toFixed(2); 
            //put all the series data
            for (var property in newData) {
                if (newData.hasOwnProperty(property)) {
                    $scope.graphData.push(newData[property]);
                    newSeries.push(property);
                }
            }
            $scope.showAveragesOnGraph = true;
            if($scope.comboboxes.selectedLocations.length>1){
                console.log('Not showing averages');
                $scope.showAveragesOnGraph = false;
            }
            $scope.graphOptions.legend = false;
            if(newSeries.length<=4){
                $scope.graphOptions.legend = true;
            }
            $scope.labels = newLabels;
            $scope.series = newSeries;
        };
        

        $scope.search = function(){
            console.log("Searching ");
            $scope.panelClass = "panel-body whirl standard";
            $scope.dataList = AnalysisData.query({market: $scope.comboboxes.selectedMarket.value, locations: $scope.comboboxes.selectedLocations, dateFrom: $scope.dateFromInput, dateTo: $scope.dateToInput}, function(){
                $scope.panelClass = "panel-body";
                $scope.totalItems = $scope.dataList.length;
                 $scope.gridOptions.data = $scope.dataList;
                //fill the graph data
                $scope.fillGraphDataNew();
            });
        };

        $scope.filterSeries = function(serie){
            $scope.graphSelectedSeries = serie;
            $scope.fillGraphDataNew();
        };

        $scope.fillLocations = function(callback){
            console.log("searching locations for " + $scope.comboboxes.selectedMarket.value);
            $scope.locations = Locations.query( { market: $scope.comboboxes.selectedMarket.value }, function(){
                if($scope.locations.length>0){
                    $scope.comboboxes.selectedLocations.push($scope.locations[0]);
                    console.log('First location'); 
                    console.log($scope.locations[0]);
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

//        $scope.$on('create', function (event, chart) {
//            console.log('chart created!');
//            console.log(chart);
//        });    

        $scope.initPage = function(){
            $('.chosen-select').chosen();
            $scope.fillLocations(function(){
                $scope.search();
            });
        };
	}
]);