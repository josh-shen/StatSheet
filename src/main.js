const {app, ipcMain, BrowserWindow} = require('electron')
const {join} = require('path')
const axios = require('axios')
const config = require('../config.js')
const {fetch_lineups, fetch_stats, fetch_play_types, fetch_game_ids, fetch_props} = require('./utils/fetchers.js')
const {PTS_ENDPOINT, ADV_ENDPOINT, REB_ENDPOINT, AST_ENDPOINT, USG_ENDPOINT} = require('./utils/endpoints.js')
const {parse_lineups, create_table} = require('./utils/utils.js')

async function createWindow() {
    const load_window = new BrowserWindow({
        width: 500,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: join(__dirname, './loading/preload.js')
        }
    });
    load_window.loadFile(join(__dirname, './loading/loading.html'))
        .then(() => {
            load_window.center()
        })

    // send "ping" to loading screen on every fetch to indicate progress
    async function fetch_and_ping(fetch_fn, progress) {
        return fetch_fn().then(function(res) {
            load_window.webContents.send('progress', progress)
            return res
        })
    }

    load_window.webContents.once('did-finish-load', async function(){
        const ids = await fetch_and_ping(function() {return fetch_game_ids()}, 1)
        const database = {
            lineups: await fetch_and_ping(function() {return fetch_lineups()}, 1),
            stats: {
                points: await fetch_and_ping(function() {return fetch_stats(PTS_ENDPOINT('', config.SEASON))}, 1),
                adv: await fetch_and_ping(function() {return fetch_stats(ADV_ENDPOINT('', config.SEASON))}, 1),
                usg: await fetch_and_ping(function() {return fetch_stats(USG_ENDPOINT('', config.SEASON))}, 1),
                rebounds: await fetch_and_ping(function() {return fetch_stats(REB_ENDPOINT('', config.SEASON))}, 1),
                assists: await fetch_and_ping(function() {return fetch_stats(AST_ENDPOINT('', config.SEASON))}, 1),
            },
            stats_after_deadline: {
                points: await fetch_and_ping(function() {return fetch_stats(PTS_ENDPOINT(config.TRADE_DEADLINE, config.SEASON))}, 1),
                adv: await fetch_and_ping(function() {return fetch_stats(ADV_ENDPOINT(config.TRADE_DEADLINE, config.SEASON))}, 1),
                usg: await fetch_and_ping(function() {return fetch_stats(USG_ENDPOINT(config.TRADE_DEADLINE, config.SEASON))}, 1),
                rebounds: await fetch_and_ping(function() {return fetch_stats(REB_ENDPOINT(config.TRADE_DEADLINE, config.SEASON))}, 1),
                assists: await fetch_and_ping(function() {return fetch_stats(AST_ENDPOINT(config.TRADE_DEADLINE, config.SEASON))}, 1),
            },
            props: {
                pts: await fetch_and_ping(function() {return fetch_props(ids, 'player_points')}, 1),
                reb: await fetch_and_ping(function() {return fetch_props(ids, 'player_rebounds')}, 1),
                ast: await fetch_and_ping(function() {return fetch_props(ids, 'player_assists')}, 1)
            },
            play_types: await fetch_and_ping(function() {return fetch_play_types('P', 'offensive', 'Regular%20Season')}, 11),
            play_types_playoffs: await fetch_and_ping(function() {return fetch_play_types('P', 'offensive', 'Playoffs')}, 11),
            play_types_defense: await fetch_and_ping(function() {return fetch_play_types('T', 'defensive', 'Regular%20Season')}, 11)
        }

        const raw_table_data = create_table(database.lineups, database.stats, database.props)
        const raw_deadline_table_data = database.stats_after_deadline.points.length > 0 ? create_table(database.lineups, database.stats_after_deadline, database.props) : []

        ipcMain.handle('create_new_table', (event, lineups, stats, props) => {
            return create_table(lineups, stats, props)
        })

        ipcMain.handle('make-http-request', async (event, options) => {
            try {
                const response = await axios(options);
                return response.data
            } catch (error) {
                const error_info = {
                    errno: error.errno,
                    code: error.code,
                }
                console.log(error_info)
            }
        })

        ipcMain.handle('request-and-parse', async (event, options) => {
            try {
                const response = await axios(options);
                const { JSDOM } = require('jsdom');
                const dom = new JSDOM(response.data);

                return parse_lineups(dom)
            } catch (error) {
                const error_info = {
                    errno: error.errno,
                    code: error.code,
                }
                console.log(error_info)
            }
        })

        const win = new BrowserWindow({
            width: 1600,
            height: 900,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: join(__dirname, './preload.js'),
                contextIsolation: true,
                nodeIntegration: true
            }
        })
        win.loadFile(join(__dirname, './index.html'))
            .then(() => {
                win.webContents.send('load', raw_table_data, raw_deadline_table_data, database)
            })
            .then(() => {
                load_window.close()
                win.maximize()
                win.show()
            })

    });
}

app.whenReady().then(() =>{
    createWindow().then()
})