//
// AzureMonitorAddonForSplunk
//
// Copyright (c) Microsoft Corporation
//
// All rights reserved. 
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the ""Software""), to deal 
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished 
// to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all 
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/* jshint unused: true */

var splunkjs = require("splunk-sdk");
var ModularInputs = splunkjs.ModularInputs;
var ModularInput = ModularInputs.ModularInput;
var Logger = ModularInputs.Logger;
var path = require('path');
var fs = require('fs');

exports.getCheckpoints = function (name) {

    var checkpointFileName = getCheckpointFileName(name);

    var checkpointsData = "{}";
    try {
        //Logger.debug(name, 'Reading contents of checkpoint file.');
        checkpointsData = fs.readFileSync(checkpointFileName, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') { }
        else {
            Logger.debug(name, 'Caught error reading checkpoint file: ' + err);
            checkpointsData = "{}";
        }
    }
    checkpointsObject = JSON.parse(checkpointsData);

    return checkpointsObject;
}

exports.putCheckpoints = function (err, name, checkpoints) {

    var checkpointFileName = getCheckpointFileName(name);
    try {
        //Logger.debug(name, 'Writing checkpoint file');
        fs.writeFileSync(checkpointFileName, JSON.stringify(checkpoints));
    } catch (err) {
        Logger.debug(name, 'Caught error writing checkpoint file: ' + err);
    }

}

function makeDirectoryDeep(myDirectory) {

    var myDirname = path.dirname(myDirectory);
    var splitDirname = myDirname.split(path.sep);
    var splitLength = splitDirname.length;

    var subDir = splitDirname[0];
    for (i=1; i<splitLength; i++) {
        subDir = path.join(subDir, splitDirname[i]);
        if (!fs.existsSync(subDir)) {
            fs.mkdirSync(subDir);
        }
    }
}

function getCheckpointFileName(name) {

    var inputDefinition = ModularInput._inputDefinition;
    var checkpoint_dir = inputDefinition.metadata.checkpoint_dir;

    var dataInputName = name.substring(name.indexOf('://') + 3);

    var oldCheckpointFileName = path.join(checkpoint_dir, 'checkpoints.json');
    var checkpointFileName = path.join(checkpoint_dir, dataInputName + '_checkpoints.json');

    Logger.debug(name, "Checkpoint file name is: " + checkpointFileName);

    try {
        if (fs.existsSync(oldCheckpointFileName)) {
            fs.renameSync(oldCheckpointFileName, checkpointFileName);
        }
    } catch (err) {
        Logger.info(name, "Error renaming checkpoint file: " + err);
    }

    if (!fs.existsSync(path.dirname(checkpointFileName))) { 
        makeDirectoryDeep(checkpointFileName);
    }

    return checkpointFileName;
}