'use strict';

angular.module('filemanager').controller('FilemanagerController', ['$scope', '$stateParams', '$location', 'Authentication', 'Files', 'LoadedFiles', 'AvailableFiles', 'Socket',
	function($scope, $stateParams, $location, Authentication, Files, LoadedFiles, AvailableFiles, Socket) {
		$scope.authentication = Authentication;

        console.log("FileManagerController!");
        $scope.filesDownloadingPanelClass = "pull-right";
        $scope.filesPanelClass = "panel-body";

        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.fileLoadedList = [];
        $scope.fileAvailableList = [];
        $scope.filesLoading = 0;
        
        $scope.availableMarkets = [{value: 'DA', label: 'Day Ahead'}, {value: 'RTBM', label: 'Real Time'}];
        $scope.comboboxes = {};
        $scope.comboboxes.selectedMarket = $scope.availableMarkets[0];
        
        //Grid
        $scope.loadedGridOptions = {
            paginationPageSizes: [15, 30, 45],
            paginationPageSize: 15,
            enableSorting: true,
            columnDefs: [
                { field: 'market', name: 'Market', width: '80' },
                { field: 'fileName', name: 'Name' },
                { field: 'date', name: 'Date', width: '120', cellFilter: "date:'MMMM dd, yyyy':'UTC'"}
            ]
        };
        
        $scope.availableGridOptions = {
            paginationPageSizes: [30, 45, 60],
            paginationPageSize: 30,
            enableSorting: true,
            columnDefs: [
                { field: 'year', name: 'Year', width: '80' },
                { field: 'month', name: 'Month', width: '100' },
                { field: 'date', name: 'Date', width: '120', cellFilter: "date:'MMMM dd, yyyy':'UTC'"},
                { field: 'fileName', name: 'Name'}
            ]
        };

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

        $scope.listLoadedFiles = function(){
            console.log("Listing loaded files");
            $scope.fileLoadedList = [];
            var dateFrom, dateTo;
            
            if($scope.dateFromInput){
                dateFrom = new Date(Date.UTC($scope.dateFromInput.getFullYear(), $scope.dateFromInput.getMonth(), $scope.dateFromInput.getDate()));
            }
            if($scope.dateToInput){
                dateTo = new Date(Date.UTC($scope.dateToInput.getFullYear(), $scope.dateToInput.getMonth(), $scope.dateToInput.getDate()));
            }
            
            $scope.fileLoadedList = LoadedFiles.query({dateFrom: dateFrom, dateTo: dateTo, market: $scope.comboboxes.selectedMarket.value}, function(){
                console.log('Finished list loaded files ');
                $scope.loadedGridOptions.data = $scope.fileLoadedList;
            });
        };

        $scope.initPage = function(){
            
        };
        
        $scope.listAvailableFiles = function(){
            console.log("Listing available files");
            $scope.fileAvailableList = [];
            var dateFrom, dateTo;
            
            if($scope.dateFromInput){
                dateFrom = new Date(Date.UTC($scope.dateFromInput.getFullYear(), $scope.dateFromInput.getMonth(), $scope.dateFromInput.getDate()));
            }
            if($scope.dateToInput){
                dateTo = new Date(Date.UTC($scope.dateToInput.getFullYear(), $scope.dateToInput.getMonth(), $scope.dateToInput.getDate()));
            }
            
            $scope.fileAvailableList = AvailableFiles.query({dateFrom: dateFrom, dateTo: dateTo, market: $scope.comboboxes.selectedMarket.value}, function(response){
                console.log('Finished list available files ');
                $scope.availableGridOptions.data = $scope.fileAvailableList;
                console.log('Response from availableFile');
                console.log(response);
            });
        };
        
        $scope.search = function(){
            //list loaded files
            $scope.listLoadedFiles();
            //list also available files
            $scope.listAvailableFiles();
        };
        
        $scope.importAvailableFiles = function(){
            var dateFrom, dateTo;
            
            if($scope.dateFromInput){
                dateFrom = new Date(Date.UTC($scope.dateFromInput.getFullYear(), $scope.dateFromInput.getMonth(), $scope.dateFromInput.getDate()));
            }
            if($scope.dateToInput){
                dateTo = new Date(Date.UTC($scope.dateToInput.getFullYear(), $scope.dateToInput.getMonth(), $scope.dateToInput.getDate()));
            }
            console.log("Importing available files");
            AvailableFiles.save({dateFrom: dateFrom, dateTo: dateTo, market: $scope.comboboxes.selectedMarket.value}, function(response){
                console.log('Finished import available files ');
                console.log(response);
            });
        };
        
        //socket.io
        Socket.on('file.import.end', function(file) {
            $scope.filesLoading--;
            if($scope.filesLoading<0){
                $scope.filesLoading = 0;
            }
            console.log(file);
            $scope.search();
        });
        
        Socket.on('file.import.start', function(file) {
            $scope.filesLoading++;
            console.log(file);
        });
        
	}
]);