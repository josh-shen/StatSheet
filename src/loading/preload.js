const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('lloaderAPI', {
    on_update_progress: (callback) => ipcRenderer.on('progress', (_event, value) => callback(value))
})