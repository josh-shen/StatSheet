const {contextBridge, ipcRenderer} = require('electron')
const endpoints = require('./utils/endpoints.js')

contextBridge.exposeInMainWorld('loaderAPI', {
    load: (data) => ipcRenderer.on('load', data),
    header: endpoints.header,
    lineups_endpoint: endpoints.LINEUP_ENDPOINT,
    player_ast_endpoint: endpoints.PLAYER_AST_ENDPOINT,
    makeRequest: (options) => ipcRenderer.invoke('make-http-request', options),
    makeRequestAndParse: (options) => ipcRenderer.invoke('request-and-parse', options)
})