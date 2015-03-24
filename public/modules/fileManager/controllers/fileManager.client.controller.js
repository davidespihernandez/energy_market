'use strict';

angular.module('fileManager').controller('FileManagerController', ['$scope', '$stateParams', '$location', 'Authentication', 'FileManager', 'LoadedFiles',
	function($scope, $stateParams, $location, Authentication, FileManager, LoadedFiles) {
		$scope.authentication = Authentication;

        console.log("FileListController!");
        $scope.currentDirectory = ''; //default dir
        $scope.showFileDownloading = false;
        $scope.showFilesLoading = false;

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
            var dirComponentsList = []
            for (var i = 0; i < arrayLength; i++) {
                var subDirFullString = ""
                for(var j = 0; j<=i; j++){
                    if(subDirFullString != ""){
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
            $scope.showFilesLoading = true;
            $scope.fileList = FileManager.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished load dirs ');
                $scope.showFilesLoading = false;
            });

        };
        $scope.listPreviousDir = function(){
            $scope.currentDirectory = $scope.currentDirectory.substring(0, $scope.currentDirectory.lastIndexOf("/"));
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();
            console.log("Previous dir " + $scope.currentDirectory);
            $scope.showFilesLoading = true;
            $scope.fileList = FileManager.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished load previous dir ');
                $scope.showFilesLoading = false;
            });
        };

        $scope.setDir = function(dirName){
            console.log("Set dir " + dirName);
            $scope.currentDirectory = dirName;
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();
            $scope.showFilesLoading = true;
            $scope.fileList = FileManager.query({dir: $scope.currentDirectory}, function(){
                console.log('Finished set dir dir ');
                $scope.showFilesLoading = false;
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
            $scope.fileLoadedList = $scope.fileList = LoadedFiles.query({dateFrom: $scope.dateFromInput, dateTo: $scope.dateToInput}, function(){
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
            $scope.fileList = FileManager.post({dir: fullPath}, function(){
                console.log('Finished load file ');
                $scope.showFileDownloading = false;
            });
        };

        $scope.pageChanged = function(){
            console.log('Page changed to ' + $scope.currentPage);
            var indexFrom = ($scope.currentPage-1)*$scope.itemsPerPage;
            $scope.pagedFileLoadedList = $scope.fileLoadedList.slice(indexFrom, indexFrom + $scope.itemsPerPage)
        };

        $scope.initPage = function(){
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();

            //call the function to show loaded files
            $scope.listLoadedFiles();
            //list current dir files
            $scope.setDir('Markets/DA/LMP_By_SETTLEMENT_LOC');
        };
        
	}
]);