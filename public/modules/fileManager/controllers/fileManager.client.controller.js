'use strict';

angular.module('filemanager').controller('FilemanagerController', ['$scope', '$stateParams', '$location', 'Authentication', 'Files', 'LoadedFiles',
	function($scope, $stateParams, $location, Authentication, Files, LoadedFiles) {
		$scope.authentication = Authentication;

        console.log("FileManagerController!");
        $scope.currentDirectory = ''; //default dir
        $scope.showFileDownloading = false;
        $scope.filesPanelClass = "panel-body";

        $scope.currentPage = 1;
        $scope.itemsPerPage = 15;
        $scope.totalItems = 0;
        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.fileList = [];
        $scope.fileLoadedList = [];
        $scope.pagedFileLoadedList = [];

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

        $scope.splitCurrentDirectory = function(){
            var dirs = $scope.currentDirectory.split('/');
            var arrayLength = dirs.length;
            var dirComponentsList = [];
            for (var i = 0; i < arrayLength; i++) {
                var subDirFullString = "";
                for(var j = 0; j<=i; j++){
                    if(subDirFullString !== ""){
                        subDirFullString += "/";
                    }
                    subDirFullString += dirs[j];
                }
                var dirComponent = {
                    subDirFullString: subDirFullString,
                    subDirString: dirs[i]
                };
                dirComponentsList.push(dirComponent);
            }
            return(dirComponentsList);
        };

        $scope.listDir = function(dirName){
            console.log("Loading dir " + dirName);
            $scope.currentDirectory = $scope.currentDirectory + "/" + dirName;
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();
            $scope.filesPanelClass = "panel-body whirl standard";
            $scope.fileList = Files.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished load dirs ');
                $scope.filesPanelClass = "panel-body";
            });

        };
        $scope.listPreviousDir = function(){
            $scope.currentDirectory = $scope.currentDirectory.substring(0, $scope.currentDirectory.lastIndexOf("/"));
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();
            console.log("Previous dir " + $scope.currentDirectory);
            $scope.filesPanelClass = "panel-body whirl standard";
            $scope.fileList = Files.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished load previous dir ');
                $scope.filesPanelClass = "panel-body";
            });
        };

        $scope.setDir = function(dirName){
            console.log("Set dir " + dirName);
            $scope.currentDirectory = dirName;
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();
            $scope.filesPanelClass = "panel-body whirl standard";
            $scope.fileList = Files.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished set dir dir ');
                $scope.filesPanelClass = "panel-body";
            });
        };

        $scope.listLoadedFiles = function(){
            console.log("Listing loaded files");
            $scope.fileLoadedList = [];
            $scope.pagedFileLoadedList = [];
    //        $http.get('/loadedfilelist?dateFrom=' + $scope.dateFromInput + "&dateTo=" + $scope.dateToInput).success( function(response){
    //            console.log('Files retrieved ');
    //            $scope.fileLoadedList = response;
    //            $scope.totalItems = $scope.fileLoadedList.length;
    //            console.log('Total files ' + $scope.totalItems);
    //            var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
    //            $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
    //        });
            $scope.fileLoadedList = LoadedFiles.query({dateFrom: $scope.dateFromInput, dateTo: $scope.dateToInput}, function(){
                console.log('Finished list loaded files ');
                $scope.totalItems = $scope.fileLoadedList.length;
                console.log('Total files ' + $scope.totalItems);
                var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
                $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
            });
        };

        $scope.loadFile = function(fileName){
            console.log("Loading file " + fileName);
            var fullPath = $scope.currentDirectory + "/" + fileName;
            $scope.showFileDownloading = true;
    //        $http.post('/importfile?filePath=' + fullPath).success( function(response){
    //            $scope.showFileDownloading = false;
    //            //reload files
    //            $scope.listLoadedFiles();
    //        });
            $scope.fileList = Files.save({dir: fullPath}, function(){
                console.log('Finished load file ');
                $scope.showFileDownloading = false;
                $scope.listLoadedFiles();
            });
        };

        $scope.pageChanged = function(){
            console.log('Page changed to ' + $scope.currentPage);
            var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
            $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage);
        };

        $scope.initPage = function(){
            //configure the table
            console.log('table elem -> ' + angular.element('#loadedFilesTable'));
/*
            angular.element('#loadedFilesTable').dataTable({
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
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();

            //call the function to show loaded files
            $scope.listLoadedFiles();
            //list current dir files
            $scope.setDir('Markets/DA/LMP_By_SETTLEMENT_LOC/2015/03');
        };
        
	}
]);