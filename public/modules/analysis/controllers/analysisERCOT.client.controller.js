'use strict';

angular.module('analysis').controller('AnalysisERCOTController', ['$scope', '$filter', '$timeout', '$stateParams', '$location', 'Authentication', 'AnalysisData', 'SearchParams',
	function($scope, $filter, $timeout, $stateParams, $location, Authentication, AnalysisData, SearchParams) {
        
		$scope.authentication = Authentication;
        $scope.availableMarkets = [{value: 'ERCOT_DA', label: 'Day Ahead'}, {value: 'ERCOT_RTBM', label: 'Real Time'}];
        $scope.comboboxes = {};
        $scope.selectedLocations = [];
        $scope.comboboxes.selectedMarket = $scope.availableMarkets[0];
        $scope.panelColor = 'panel-primary';
        $scope.marketName = 'Day Ahead';
        $scope.isDayAhead = true;
        if($stateParams.market === 'RTBM'){
            $scope.comboboxes.selectedMarket = $scope.availableMarkets[1];
            $scope.panelColor = 'panel-warning';
            $scope.marketName = 'Real Time';
            $scope.isDayAhead = false;
        }
        $scope.panelClass = "panel-body";

        console.log("AnalysisERCOTController!");
        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.dataList = [];
        $scope.graphSelectedSeries = "ALL";
        $scope.locations = [];
        $scope.averageLMP = 0; 
        $scope.labels = [" ", " "];
        $scope.showAveragesOnGraph = false;

        $scope.series = ["LMP"];
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
                }
            ]
        };
        
        $scope.averagesGridOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableSorting: true,
            columnDefs: [
                { field: 'Interval', name: 'Date', width: '120', cellFilter: "date:'MM/dd/yyyy':'UTC'" },
                { field: 'Settlement_Location', name: 'Location' },
                { field: 'LMP', name: 'LMP', width: '80',
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
            $scope.labels = [];
            $scope.graphData = [];
            var newSeries = [];
            var newLabels = [];
            var newData = {};
            var averagesData = {};
            var avgLMP = 0;
            $scope.dataList.forEach(function(item){
                if(newLabels.indexOf($filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'))===-1){
                    newLabels.push($filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'));
                }
                //check series
                var seriesLabel = item.Settlement_Location;
                if(newSeries.indexOf(seriesLabel)===-1){
                    newSeries.push(seriesLabel);
                    newData[seriesLabel] = [];
                }
                newData[seriesLabel].push(item.LMP);
                avgLMP += item.LMP; 
                //store data for averages per location and date
                var averageKey = $filter('date')(item.date, 'MM/dd/yyyy', 'UTC') + "_" + item.Settlement_Location;
                var avgData;
                if(averagesData.hasOwnProperty(averageKey)){
                    avgData = averagesData[averageKey];
                    avgData.LMP += item.LMP;
                    avgData.rows++;
                    averagesData[averageKey] = avgData;
                } else{
                    avgData = { Interval: $filter('date')(item.date, 'MM/dd/yyyy', 'UTC'),
                                    Settlement_Location: item.Settlement_Location,
                                    LMP: item.LMP,
                                    rows: 1
                                  };
                    averagesData[averageKey] = avgData;
                }
            });
            $scope.averageLMP = (avgLMP / $scope.dataList.length).toFixed(2); 
            var averagesGridData = [];
            for (var prop in averagesData) {
                if (averagesData.hasOwnProperty(prop)) {
                    averagesData[prop].LMP = (averagesData[prop].LMP / averagesData[prop].rows).toFixed(2);
                    averagesGridData.push(averagesData[prop]);
                }
            }
            $scope.averagesGridOptions.data = averagesGridData;
            
            //put all the series data
            for (var property in newData) {
                if (newData.hasOwnProperty(property)) {
                    $scope.graphData.push(newData[property]);
                    newSeries.push(property);
                }
            }
            $scope.showAveragesOnGraph = true;
            if($scope.selectedLocations.length>1){
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
            var date;
            if($scope.dateFromInput){
                date = $scope.dateFromInput;
                if(!(date instanceof Date)){
                    date = new Date($scope.dateFromInput);
                }
                dateFrom = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            }
            if($scope.dateToInput){
                date = $scope.dateToInput;
                if(!(date instanceof Date)){
                    date = new Date($scope.dateToInput);
                }
                dateTo = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            }
            
            $scope.dataList = AnalysisData.query({market: $scope.comboboxes.selectedMarket.value, 
                                                  locations: $scope.selectedLocations, 
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
                    $scope.selectedLocations.push($scope.locations[0]);
                    callback();                
                }
            });
        };

        $scope.exportData = function(){
            var finalData = [ ['Interval', 'Settlement_Location', 'LMP'] ];
            $scope.dataList.forEach(function(item){
                $filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC');
                finalData.push( [$filter('date')(item.Interval, 'MM/dd/yyyy HH:mm', 'UTC'), item.Settlement_Location, item.LMP] );
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

angular.module('analysis').controller('TitleERCOTController', ['$scope', '$filter', '$timeout', '$stateParams', '$location', 'Authentication', 'AnalysisData',
	function($scope, $filter, $timeout, $stateParams, $location, Authentication, AnalysisData) {
        $scope.marketName = 'Day Ahead';
        if($stateParams.market === 'RTBM'){
            $scope.marketName = 'Real Time';
        }
	}
]);
        


