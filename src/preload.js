const {contextBridge, ipcRenderer} = require('electron')
const endpoints = require('./utils/endpoints.js')

contextBridge.exposeInMainWorld('loaderAPI', {
    load: (data) => ipcRenderer.on('load', data),
    header: endpoints.header,
    player_assists_endpoint: endpoints.PLAYER_AST_ENDPOINT,
    makeRequest: (config) => ipcRenderer.invoke('make-http-request', config)
})