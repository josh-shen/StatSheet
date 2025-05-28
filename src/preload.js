const {contextBridge, ipcRenderer} = require('electron')
const endpoints = require('./utils/endpoints.js')
const config = require('../config.js')

contextBridge.exposeInMainWorld('loaderAPI', {
    load: (data) => ipcRenderer.on('load', data),
    season: config.SEASON,
    trade_deadline_date: config.TRADE_DEADLINE,
    createNewTable: (lineups, stats, props) => ipcRenderer.invoke('create_new_table', lineups, stats, props),
    header: endpoints.header,
    lineups_endpoint: endpoints.LINEUP_ENDPOINT,
    player_ast_endpoint: endpoints.PLAYER_AST_ENDPOINT,
    fetchPlayAssistStats: (options) => ipcRenderer.invoke('fetch_player_assist_stats', options),
    fetchLineups: (options) => ipcRenderer.invoke('fetch_lineups', options),
    fetchProps: () => ipcRenderer.invoke('fetch_props'),
})