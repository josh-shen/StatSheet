const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('loaderAPI', {
    load: (data) => ipcRenderer.on('load', data)
})