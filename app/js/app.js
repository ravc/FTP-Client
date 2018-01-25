const fs = require('fs');
var Client = require('ssh2').Client;
var conn = new Client();

function connect(){
    var connSettings = {
        username: document.getElementById("conn").elements[0].value,
        password: document.getElementById("conn").elements[1].value,
        host: document.getElementById("conn").elements[2].value,
        port: document.getElementById("conn").elements[3].value
    };
    
    conn.on('ready', function(){
        conn.sftp(function(err, sftp){
            if (err) throw (err);
                  
            sftp.readdir(document.getElementById("remotedir").value, function(err, list){
                
                var select = document.getElementById("remotefiles");
                select.options.length = 0;
                for(index in list){
                    var type = "File";
                    if(list[index].longname[0] == "d"){
                        type = "Directory";
                    };
                    select.options[select.options.length] = new Option(list[index].filename, list[index].filename + "|" + type);
                }
                conn.end();
            });
        });
    }).connect(connSettings);
}

function localdir(){
    var select = document.getElementById("localfiles");
    var localdir = document.getElementById("localdir").value;
    
    fs.stat(localdir, function(err, stats){
        if(stats.isDirectory()){
            select.options.length = 0;
            
            fs.readdir(document.getElementById("localdir").value, (err, files) => {
                files.forEach(file => {
                    select.options[select.options.length] = new Option(file);
                });
            });
        };
    });
}

function setup(){
    var select = document.getElementById("localfiles");
    select.options.length = 0;
    
    fs.readdir(document.getElementById("localdir").value, (err, files) => {
        files.forEach(file => {
            select.options[select.options.length] = new Option(file);
        });
    });
    
    connect();
}

function doubleClickLocal(){
    var locald = document.getElementById("localdir").value+ document.getElementById("localfiles").value + "/";
    
    fs.stat(locald, function(err, stats){
        if(stats.isDirectory()){
            document.getElementById("localdir").value = document.getElementById("localdir").value+ document.getElementById("localfiles").value + "/";
            localdir();
        };
    });
}

function doubleClickRemote(){
    var dir = document.getElementById("remotefiles").value;
    
    if(dir.split("|")[1] == "Directory"){
        document.getElementById("remotedir").value = document.getElementById("remotedir").value + dir.split("|")[0] + "/";
        connect();
    }
}

function downloadfile(){
    var connSettings = {
        username: document.getElementById("conn").elements[0].value,
        password: document.getElementById("conn").elements[1].value,
        host: document.getElementById("conn").elements[2].value,
        port: document.getElementById("conn").elements[3].value
    };
    
    conn.on('ready', function(){
        conn.sftp(function(err, sftp){
            if (err) throw err;
                  
            var mvFrom = document.getElementById("remotedir").value + document.getElementById("remotefiles").value.split("|")[0];
            var mvTo = document.getElementById("localdir").value + document.getElementById("remotefiles").value.split("|")[0];
            
            sftp.fastGet(mvFrom, mvTo, {}, function(downloadError){
                if(downloadError) throw downloadError;
            });
        });
    }).connect(connSettings);
}
