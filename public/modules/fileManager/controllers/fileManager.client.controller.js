'use strict';

angular.module('filemanager').controller('FilemanagerController', ['$scope', '$stateParams', '$location', 'Authentication', 'LoadedFiles', 'AvailableFiles', 'Socket', 'toaster',
	function($scope, $stateParams, $location, Authentication, LoadedFiles, AvailableFiles, Socket, toaster) {
		$scope.authentication = Authentication;

        console.log("FileManagerController!");
        $scope.filesDownloadingPanelClass = "pull-right";
        $scope.filesPanelClass = "panel-body";

        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.fileLoadedList = [];
        $scope.fileAvailableList = [];
        $scope.filesLoading = 0;
        $scope.loadFilesDisabled = true;
        
        $scope.availableMarkets = [{value: 'DA', label: 'Day Ahead'}, {value: 'RTBM', label: 'Real Time'}];
        $scope.comboboxes = {};
        $scope.comboboxes.selectedMarket = $scope.availableMarkets[0];
        
        //Grid
        $scope.loadedGridOptions = {
            paginationPageSizes: [15, 30, 45],
            paginationPageSize: 15,
            enableSorting: true,
            columnDefs: [
                { field: 'fileName', name: 'Name' },
                { field: 'date', name: 'Date', width: '120', cellFilter: "date:'MMMM dd, yyyy':'UTC'"}
            ]
        };
        
        $scope.availableGridOptions = {
            paginationPageSizes: [30, 45, 60],
            paginationPageSize: 30,
            enableSorting: true,
            columnDefs: [
                { field: 'fileName', name: 'Name'},
                { field: 'date', name: 'Date', width: '120', cellFilter: "date:'MMMM dd, yyyy':'UTC'"}
            ]
        };

        $scope.openAvailableFrom = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedAvailableFrom = true;
        };

        $scope.openAvailableTo = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedAvailableTo = true;
        };
        
        $scope.openLoadedFrom = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedLoadedFrom = true;
        };

        $scope.openLoadedTo = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedLoadedTo = true;
        };

        $scope.listLoadedFiles = function(){
            console.log("Listing loaded files");
            $scope.fileLoadedList = [];
            var dateFrom, dateTo;
            
            if($scope.dateFromLoadedInput){
                dateFrom = new Date(Date.UTC($scope.dateFromLoadedInput.getFullYear(), $scope.dateFromLoadedInput.getMonth(), $scope.dateFromLoadedInput.getDate()));
            }
            if($scope.dateToLoadedInput){
                dateTo = new Date(Date.UTC($scope.dateToLoadedInput.getFullYear(), $scope.dateToLoadedInput.getMonth(), $scope.dateToLoadedInput.getDate()));
            }
            
            $scope.fileLoadedList = LoadedFiles.query({dateFrom: dateFrom, dateTo: dateTo, market: $scope.comboboxes.selectedMarket.value}, function(){
                console.log('Finished list loaded files ');
                $scope.loadedGridOptions.data = $scope.fileLoadedList;
            });
        };

        $scope.initPage = function(){
            $scope.listLoadedFiles();
        };
        
        $scope.listAvailableFiles = function(){
            console.log("Listing available files");
            $scope.fileAvailableList = [];
            var dateFrom, dateTo;
            
            if($scope.dateFromAvailableInput){
                dateFrom = new Date(Date.UTC($scope.dateFromAvailableInput.getFullYear(), $scope.dateFromAvailableInput.getMonth(), $scope.dateFromAvailableInput.getDate()));
            }
            if($scope.dateToAvailableInput){
                dateTo = new Date(Date.UTC($scope.dateToAvailableInput.getFullYear(), $scope.dateToAvailableInput.getMonth(), $scope.dateToAvailableInput.getDate()));
            }
            
            $scope.fileAvailableList = AvailableFiles.query({dateFrom: dateFrom, dateTo: dateTo, market: $scope.comboboxes.selectedMarket.value}, function(response){
                $scope.availableGridOptions.data = $scope.fileAvailableList;
                if($scope.fileAvailableList.length>0){
                    $scope.loadFilesDisabled = false;
                }
            });
        };
        
        $scope.search = function(){
            //list loaded files
            $scope.listLoadedFiles();
            //list also available files
            $scope.listAvailableFiles();
        };
        
        $scope.searchAvailable = function(){
            //list also available files
            $scope.listAvailableFiles();
        };
        
        $scope.searchLoaded = function(){
            //list loaded files
            $scope.listLoadedFiles();
        };
        
        $scope.importAvailableFiles = function(){
            var dateFrom, dateTo;
            
            if($scope.dateFromAvailableInput){
                dateFrom = new Date(Date.UTC($scope.dateFromAvailableInput.getFullYear(), $scope.dateFromAvailableInput.getMonth(), $scope.dateFromAvailableInput.getDate()));
            }
            if($scope.dateToAvailableInput){
                dateTo = new Date(Date.UTC($scope.dateToAvailableInput.getFullYear(), $scope.dateToAvailableInput.getMonth(), $scope.dateToAvailableInput.getDate()));
            }
            console.log("Importing available files");
            $scope.loadFilesDisabled = true;
            toaster.pop('success', 'Load process', 'Launched load for ' + $scope.fileAvailableList.length + ' files');
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
            toaster.pop('success', 'File loading finished', file.fileName);
            $scope.search();
        });
        
        Socket.on('file.import.start', function(file) {
            $scope.filesLoading++;
            toaster.pop('warning', 'File loading started', file.fileName);
        });
        
	}
]);