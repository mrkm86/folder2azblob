var azure = require('azure-storage');
var path = require('path')
var fs = require('fs');
var config = require('./config.json')

var containerName = config["container_name"];
var localPath = config["folder"];
var extentFilter = config["extention"];
var connectionString = config["account"];
var time = config["time"];
var iMaxRecord = 0; 
var isStart = false;

if  (connectionString == undefined || extentFilter == undefined || localPath == undefined || containerName == undefined) {
    console.log('Config error');
    return;
}

if  (connectionString == "" || extentFilter == "" || localPath == "" || containerName == "") {
    console.log('Config error');
    return;
}

if  (fs.existsSync(localPath) == false) {
    console.log('Folder path is not exist');
    return;
}

if  (fs.lstatSync(localPath).isDirectory() == false) {
    console.log('Folder path is not a directory');
    return;
}

if (time == undefined || time == "") {
    time = 1000;
}

extentFilter = extentFilter.replace('*', '');
var blobSvc = azure.createBlobService(connectionString);

/** Find all files by extention         */
/** pathFolder          : Folder path   */
/** filter              : extention     */
/** isDeleteOther       : Path          */
function findFilesInDir(pathFolder, filter, isDeleteOther){
    var arrResult = [];
    
    if (!fs.existsSync(pathFolder)){
        console.log("no dir ", pathFolder);
        return;
    }
    
    var files = fs.readdirSync(pathFolder);

    for(var i = 0; i < files.length; i++){
        var filename = path.join(pathFolder, files[i]);

        if (filename.indexOf(filter) == (filename.length - filter.length)) {
            arrResult.push(filename);
        }
        else {
            if (isDeleteOther) {
                // Delete file
                if(fs.lstatSync(filename).isDirectory() == false) {
                    fs.unlinkSync(filename);
                }
            }
        }
    };
    
    return arrResult;
};

/** Create container */
function createContainer(callback) {
    blobSvc.createContainerIfNotExists(containerName, function (error) {
        if (error) {
            console.log(error);
        } else {
            //console.log('Created the container ' + containerName);
            callback();
        }
    });
  }

/** Upload file */
function uploadBlob(strContainer, blobName, strLocalFile) {
    blobSvc.createBlockBlobFromLocalFile(strContainer, blobName, strLocalFile, function(error, result, response) {
        if (error) {
            //console.log(error);
            console.log('Upload blob fail:' + strLocalFile);
        } else {
            console.log('Upload blob success:' + strLocalFile);

            // Delete file
            if(fs.lstatSync(strLocalFile).isDirectory() == false) {
                fs.unlinkSync(strLocalFile);
            }

            iMaxRecord--;
            if (iMaxRecord == 0) {
                console.log('Upload Blob End...');
                isStart = false;
            }
        }
    });
}

function main(){

    if (isStart) {
        return;
    }

    console.log('Upload Blob Start...');
    isStart = true;
    
    //Create container if not exist
    createContainer(function(){
        if (containerName != "") {
            var arrResult = findFilesInDir(localPath, extentFilter, true);
            iMaxRecord = arrResult.length;

            if (iMaxRecord == 0) {
                console.log('Upload Blob End...');
                isStart = false;
            }

            for (var i = 0; i < arrResult.length; i++) {
                var localFile = arrResult[i];
                var blobName = path.basename(localFile);
                //Upload
                uploadBlob(containerName, blobName, localFile);
            }
        }
    });
}

//Excute upload blob from file
main();

setInterval(function() {
    //Excute upload blob from file
    main();
}, time);

