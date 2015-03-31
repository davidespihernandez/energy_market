'use strict';

angular.module('analysis').controller('AnalysisController', ['$scope', '$filter', '$timeout', '$stateParams', '$location', 'Authentication', 'AnalysisData', 'SearchParams',
	function($scope, $filter, $timeout, $stateParams, $location, Authentication, AnalysisData, SearchParams) {
        
		$scope.authentication = Authentication;
        $scope.availableMarkets = [{value: 'DA', label: 'Day Ahead'}, {value: 'RTBM', label: 'Real Time'}];
        $scope.comboboxes = {};
        $scope.comboboxes.selectedLocations = [];
        $scope.comboboxes.selectedMarket = $scope.availableMarkets[0];
        $scope.panelColor = 'panel panel-primary';
        $scope.marketName = 'Day Ahead';
        $scope.isDayAhead = true;
        if($stateParams.market === 'RTBM'){
            $scope.comboboxes.selectedMarket = $scope.availableMarkets[1];
            $scope.panelColor = 'panel panel-warning';
            $scope.marketName = 'Real Time';
            $scope.isDayAhead = false;
        }
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

        $scope.totalItems = 0;
        
        
        //Grid
        $scope.gridOptions = {
            paginationPageSizes: [24, 48, 72],
            paginationPageSize: 24,
            enableSorting: true,
            columnDefs: [
                { field: 'Interval', name: 'Date', width: '120', cellFilter: "date:'MM/dd/yyyy HH:mm':'UTC'" },
                { field: 'Settlement_Location', name: 'Location' },
                { field: 'LMP', name: 'LMP', width: '80',
                 headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                        return 'text-uppercase';
                                    }
                },
                { field: 'MLC', name: 'MLC', width: '80',
                 headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                        return 'text-uppercase';
                                    }
                },
                { field: 'MCC', name: 'MCC', width: '80',
                 headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                        return 'text-uppercase';
                                    }
                },
                { field: 'MEC', name: 'MEC', width: '80',
                 headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                        return 'text-uppercase';
                                    }
                }
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

        //method for multiple locations
        $scope.fillGraphData = function(){
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
                
                if(newLabels.indexOf($filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'))===-1){
                    newLabels.push($filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'));
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
        
        $scope.toUTCDate = function(dateStr){
            var date = new Date(dateStr);
            var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            return _utc;
        };

        
        $scope.search = function(){
            console.log("Searching ");
            $scope.panelClass = "panel-body whirl standard";
            var dateFrom, dateTo;
            
            if($scope.dateFromInput){
                var date = $scope.dateFromInput;
                if(!(date instanceof Date)){
                    date = new Date($scope.dateFromInput);
                }
                dateFrom = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            }
            if($scope.dateToInput){
                var date = $scope.dateToInput;
                if(!(date instanceof Date)){
                    date = new Date($scope.dateToInput);
                }
                dateTo = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            }
            
            $scope.dataList = AnalysisData.query({market: $scope.comboboxes.selectedMarket.value, 
                                                  locations: $scope.comboboxes.selectedLocations, 
                                                  dateFrom: dateFrom, 
                                                  dateTo: dateTo}, function(){
                $scope.panelClass = "panel-body";
                $scope.totalItems = $scope.dataList.length;
                $scope.gridOptions.data = $scope.dataList;
                //fill the graph data
                $scope.fillGraphData();
            });
        };

        $scope.filterSeries = function(serie){
            $scope.graphSelectedSeries = serie;
            $scope.fillGraphData();
        };

        $scope.getSearchParams = function(callback){
            console.log("search params for " + $scope.comboboxes.selectedMarket.value);
            SearchParams.get( { market: $scope.comboboxes.selectedMarket.value }, function(result){
                console.log('result search params');
                console.log(result);
                if(result.locations.length>0){
                    $scope.locations = result.locations;
                    $scope.dateFromInput = result.maxDate;
                    $scope.dateToInput = result.maxDate;
                    $scope.comboboxes.selectedLocations.push($scope.locations[0]);
                    callback();                
                }
            });
        };

        $scope.exportData = function(){
            var finalData = [ ['Interval', 'Settlement_Location', 'Pnode', 'LMP', 'MLC', 'MCC', 'MEC'] ];
            $scope.dataList.forEach(function(item){
                $filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC');
                finalData.push( [$filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'), item.Settlement_Location, item.Pnode, item.LMP, item.MLC, item.MCC, item.MEC] );
            });
            return(finalData);
        };

//        $scope.$on('create', function (event, chart) {
//            console.log('chart created!');
//            console.log(chart);
//        });    

        $scope.initPage = function(){
            $('.chosen-select').chosen();
            $scope.getSearchParams(function(){
                $scope.search();
            });
        };
	}
]);

angular.module('analysis').controller('TitleController', ['$scope', '$filter', '$timeout', '$stateParams', '$location', 'Authentication', 'AnalysisData',
	function($scope, $filter, $timeout, $stateParams, $location, Authentication, AnalysisData) {
        $scope.marketName = 'Day Ahead';
        if($stateParams.market === 'RTBM'){
            $scope.marketName = 'Real Time';
        }
	}
]);
        


