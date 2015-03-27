'use strict';

angular.module('filemanager').controller('FilemanagerController', ['$scope', '$stateParams', '$location', 'Authentication', 'Files', 'LoadedFiles',
	function($scope, $stateParams, $location, Authentication, Files, LoadedFiles) {
		$scope.authentication = Authentication;

        console.log("FileManagerController!");
        $scope.currentDirectory = ''; //default dir
        $scope.filesDownloadingPanelClass = "pull-right";
        $scope.filesPanelClass = "panel-body";

        $scope.currentPage = 1;
        $scope.itemsPerPage = 15;
        $scope.totalItems = 0;
        $scope.dateFromInput = "";
        $scope.dateToInput = "";
        $scope.fileList = [];
        $scope.fileLoadedList = [];
        
        //Grid
        $scope.gridOptions = {
            paginationPageSizes: [15, 30, 45],
            paginationPageSize: 15,
            enableSorting: true,
            columnDefs: [
                { field: 'market', name: 'Market', width: '80' },
                { field: 'filePath', name: 'Path' },
                { field: 'date', name: 'Date', width: '120', cellFilter: "date:'MMMM dd, yyyy':'UTC'"}
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
            var dateFrom = undefined, dateTo = undefined
            
            if($scope.dateFromInput){
                dateFrom = new Date(Date.UTC($scope.dateFromInput.getFullYear(), $scope.dateFromInput.getMonth(), $scope.dateFromInput.getDate()))
            }
            if($scope.dateToInput){
                dateTo = new Date(Date.UTC($scope.dateToInput.getFullYear(), $scope.dateToInput.getMonth(), $scope.dateToInput.getDate()))
            }
            
            $scope.fileLoadedList = LoadedFiles.query({dateFrom: dateFrom, dateTo: dateTo}, function(){
                console.log('Finished list loaded files ');
                $scope.totalItems = $scope.fileLoadedList.length;
                $scope.gridOptions.data = $scope.fileLoadedList;
            });
        };

        $scope.loadFile = function(fileName){
            console.log("Loading file " + fileName);
            var fullPath = $scope.currentDirectory + "/" + fileName;
            $scope.filesDownloadingPanelClass = "pull-right whirl standard";
    //        $http.post('/importfile?filePath=' + fullPath).success( function(response){
    //            $scope.showFileDownloading = false;
    //            //reload files
    //            $scope.listLoadedFiles();
    //        });
            $scope.fileList = Files.save({dir: fullPath}, function(){
                console.log('Finished load file ');
                $scope.filesDownloadingPanelClass = "pull-right";
                $scope.listLoadedFiles();
                $scope.setDir($scope.currentDirectory);
            });
        };

        $scope.initPage = function(){
            //configure the table
            $scope.currentDirectoryComponents = $scope.splitCurrentDirectory();

            //call the function to show loaded files
            $scope.listLoadedFiles();
            //list current dir files
            $scope.setDir('Markets/DA/LMP_By_SETTLEMENT_LOC');
        };
        
//tree
        
        $scope.getChildren = function(branch){
            console.log("Loading children for " + branch.data.fullPath);
            $scope.filesPanelClass = "panel-body whirl standard";            
            Files.query({dir: branch.data.fullPath}, function(response){
                console.log('Finished load children ');
                branch.children = [];
                response.forEach(function(file){
                    var newBranch = {
                        label: file.name,
                        data: {
                            name: file.name,
                            fullPath: branch.data.fullPath + '/' + file.name,
                            size: file.size,
                            type: file.type,
                            reloadable: (file.type==='d')
                        }
                    };
                    if(file.type==='d'){
                        newBranch.children = [{label: 'Reloading...'}]
                    }
                    else{
                        newBranch.label = file.name + " (" + Math.round(file.size/10000)/100 + " MB)"
                    }
                    branch.children.push(newBranch);
                });
                $scope.filesPanelClass = "panel-body";
            });

        };
        
        $scope.treeData = [
            {
                label: 'DA',
                data: {
                    name: 'DA',
                    fullPath: 'Markets/DA',
                    size: 0,
                    type: 'd',
                    reloadable: false
                },
                children: [
                    {
                        label: 'LMP_By_SETTLEMENT_LOC',
                        data: {
                            name: 'LMP_By_SETTLEMENT_LOC',
                            fullPath: 'Markets/DA/LMP_By_SETTLEMENT_LOC',
                            size: 0,
                            type: 'd',
                            reloadable: true
                        },
                        children: [{label: 'Reloading...'}]
                    }
                ]
            }, {
                label: 'RTBM',
                data: {
                    name: 'RTBM',
                    fullPath: 'Markets/RTBM',
                    size: 0,
                    type: 'd',
                    reloadable: false
                },
                children: [
                    {
                        label: 'LMP_By_SETTLEMENT_LOC',
                        data: {
                            name: 'LMP_By_SETTLEMENT_LOC',
                            fullPath: 'Markets/RTBM/LMP_By_SETTLEMENT_LOC',
                            size: 0,
                            type: 'd',
                            reloadable: true
                        },
                        children: [{label: 'Reloading...'}]
                    }
                ]
            }
        ];
                
        var tree;
        // This is our API control variable
        $scope.my_tree = tree = {};        
        $scope.selectedBranch = null;
        $scope.my_tree_handler = function(branch) {
            if(branch.data.type==='d' && branch.data.reloadable===true){
                $scope.getChildren(branch);
            }
            if(branch.data.type!='d'){
                $scope.selectedBranch = branch;
            } else{
                $scope.selectedBranch = null;
            }
        };        
        
        $scope.loadSelectedFile = function(){
            console.log("Loading file " + $scope.selectedBranch.data.fullPath);
            $scope.filesDownloadingPanelClass = "pull-right whirl standard";
            $scope.fileList = Files.save({dir: $scope.selectedBranch.data.fullPath}, function(){
                console.log('Finished load file ');
                $scope.filesDownloadingPanelClass = "pull-right";
                $scope.listLoadedFiles();
                $scope.setDir($scope.currentDirectory);
            });
        }
        
	}
]);