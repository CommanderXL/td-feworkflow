/**
 * Created by XRene on 16/8/5.
 */

var electron = require('electron');
var Menu = electron.Menu;
var app = electron.app;
var ipcMain = electron.ipcMain;
var browserWindow = electron.BrowserWindow;


var win;

function createWin() {
    "use strict";
    win = new browserWindow({width: 1000, height: 600});

    win.loadURL('file://' + __dirname + '/index.html' );
    //console.log(win.webContents.getURL());

    //避免每次打开程序都打开devTools工具
    //win.webContents.openDevTools();

    win.on('closed', function () {
        win = null;
    });
}

function createMenu() {
    var template = [
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteandmatchstyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if(focusedWindow) focusedWindow.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function (item, focusedWindow) {
                        if(focusedWindow) focusedWindow.webContents.toggleDevTools();
                    }
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            role: 'window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
    ];

    if (process.platform === 'darwin') {
        var name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        });
    }

    // Window menu.
    template[3].submenu = [
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ]

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


app.on('ready', function () {
    //打开窗口
    createWin();
    //添加菜单
    createMenu();
});


app.on('window-all-closed', function () {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if(win === null) createWin();
});


