var azure = require('azure-storage');
var path = require('path')
var fs = require('fs');
var config = require('./config.json')

var containerName = config["container_name"];
var localPath = config["folder"];
var extentFilter = config["extention"];
var connectionString = config["account"];

if  (connectionString == undefined || extentFilter == undefined || localPath == undefined || containerName == undefined) {
    console.log('Config error');
    return;
}

if  (connectionString == "" || extentFilter == "" || localPath == "" || containerName == "") {
    console.log('Config error');
    return;
}

var blobSvc = azure.createBlobService(connectionString); 

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

function excuteFunction(){
    //Create container if not exist
    createContainer(function(){
        if (containerName != "") {
            console.log('Blob list:');
            // Get Blob list
            blobSvc.listBlobsSegmented(containerName, null, function(error, result, response) {
                if (error) {
                //console.log(error);
                    console.log(error);
                } else {
                    for (var i = 0 ; i < result.entries.length; i++) {
                        console.log(i + "." + result.entries[i].name);
                    }
                    console.log('');
                }
            });
        }
    });
}

excuteFunction();
