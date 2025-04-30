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
        alwaysOnTop: true
    });
    load_window.loadFile(join(__dirname, './loading.html'))
        .then(() => {
            load_window.center()
        })

    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        //resizable: false,
        webPreferences: {
            preload: join(__dirname, './preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    const ids = await fetch_game_ids()

    let database = {
        lineups: await fetch_lineups(),
        stats: {
            points: await fetch_stats(PTS_ENDPOINT('', config.SEASON)),
            adv: await fetch_stats(ADV_ENDPOINT('', config.SEASON)),
            usg: await fetch_stats(USG_ENDPOINT('', config.SEASON)),
            rebounds: await fetch_stats(REB_ENDPOINT('', config.SEASON)),
            assists: await fetch_stats(AST_ENDPOINT('', config.SEASON)),
        },
        stats_after_deadline: {
            points: await fetch_stats(PTS_ENDPOINT(config.TRADE_DEADLINE, config.SEASON)),
            adv: await fetch_stats(ADV_ENDPOINT(config.TRADE_DEADLINE, config.SEASON)),
            usg: await fetch_stats(USG_ENDPOINT(config.TRADE_DEADLINE, config.SEASON)),
            rebounds: await fetch_stats(REB_ENDPOINT(config.TRADE_DEADLINE, config.SEASON)),
            assists: await fetch_stats(AST_ENDPOINT(config.TRADE_DEADLINE, config.SEASON)),
        },
        props: {
            pts: await fetch_props(ids, 'player_points'),
            reb: await fetch_props(ids, 'player_rebounds'),
            ast: await fetch_props(ids, 'player_assists'),
        },
        play_types: await fetch_play_types('P', 'offensive', 'Regular%20Season'),
        play_types_playoffs: await fetch_play_types('P', 'offensive', 'Playoffs'),
        play_types_defense: await fetch_play_types('T', 'defensive', 'Regular%20Season')
    }

    const raw_table_data = create_table(database.lineups, database.stats, database.props)
    const raw_deadline_table_data = create_table(database.lineups, database.stats_after_deadline, database.props)

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
            const tables = dom.window.document.querySelectorAll('.datatable');

            return parse_lineups(tables)
        } catch (error) {
            const error_info = {
                errno: error.errno,
                code: error.code,
            }
            console.log(error_info)
        }
    })

    win.loadFile(join(__dirname, './index.html'))
        .then(() => {
            win.webContents.send('load', raw_table_data, raw_deadline_table_data, database)
        })
        .then(() => {
            load_window.close()
            win.show()
        })
}

app.whenReady().then(() =>{
    createWindow().then()
})