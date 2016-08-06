/**
 * Created by XRene on 16/8/5.
 */

var electron = require('electron');
var app = electron.app;
var browserWindow = electron.BrowserWindow;


var win;

function createWin() {
    "use strict";
    win = new browserWindow({width: 1200, height: 600});

    win.loadURL('file://' + __dirname + '/index.html' );

    win.webContents.openDevTools()

    win.on('closed', function () {
        win = null;
    });
}


app.on('ready', createWin);


app.on('window-all-closed', function () {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if(win === null) createWin();
});


