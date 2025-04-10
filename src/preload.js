const {contextBridge, ipcRenderer} = require('electron')
const endpoints = require('./utils/endpoints.js')
const fetchers = require('./utils/fetchers.js')
const utils = require('./utils/utils.js')

contextBridge.exposeInMainWorld('loaderAPI', {
    load: (data) => ipcRenderer.on('load', data),
    header: endpoints.header,
    fetch_lineups: fetchers.fetch_lineups,
    player_assists_endpoint: endpoints.PLAYER_AST_ENDPOINT,
    draw_table: utils.create_table,
    makeRequest: (config) => ipcRenderer.invoke('make-http-request', config)
})