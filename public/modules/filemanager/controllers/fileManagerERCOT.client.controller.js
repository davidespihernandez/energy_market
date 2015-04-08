'use strict';

angular.module('filemanager').controller('FilemanagerERCOTController', ['$scope', '$stateParams', '$location', 'Authentication', 'LoadedFiles', 'FileUploader', 'Socket', 'toaster',
	function($scope, $stateParams, $location, Authentication, LoadedFiles, FileUploader, Socket, toaster) {
		$scope.authentication = Authentication;

        console.log("FileManagerERCOTController!");
        $scope.filesDownloadingPanelClass = "pull-right";
        $scope.filesPanelClass = "panel-body";

        $scope.fileLoadedList = [];
        $scope.filesLoading = [];
        $scope.loadFilesDisabled = true;
        
        
        $scope.availableMarkets = [{value: 'ERCOT_DA', label: 'Day Ahead'}, {value: 'ERCOT_RTBM', label: 'Real Time'}];
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
        
        $scope.search = function(){
            //list loaded files
            $scope.listLoadedFiles();
        };
        
        $scope.searchLoaded = function(){
            //list loaded files
            $scope.listLoadedFiles();
        };
        
        //socket.io
        Socket.on('file.importERCOT.end', function(file) {
            toaster.pop('success', 'File loading finished', file.filePath);
            $scope.search();
        });
        
        Socket.on('file.importERCOT.start', function(file) {
            toaster.pop('warning', 'File loading started', file.filePath);
        });
        
        Socket.on('file.importERCOT.progress', function(file) {
            var existingFileIndex = -1;
            for(var i = 0; i < $scope.filesLoading.length; i++) {
                if($scope.filesLoading[i].filePath === file.filePath){
                    existingFileIndex = i;
                }
            }
            if(existingFileIndex > -1){
                $scope.filesLoading[existingFileIndex] = file;
                if(file.percent === 100){
                    $scope.filesLoading.splice(existingFileIndex, 1);
                    $scope.search();
                }
            } else{
                $scope.filesLoading.push(file);
            }
        });
        
        //UPLOADER        
        var uploader = $scope.uploader = new FileUploader({
            url: 'uploadERCOT'
        });

        // CALLBACKS for uploader

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            //console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            //console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            //console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            //console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            //console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            //console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            //console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            //console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            //console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            //console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
            uploader.clearQueue();
        };
        
	}
]);