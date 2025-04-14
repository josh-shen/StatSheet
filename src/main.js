const {app, ipcMain, BrowserWindow} = require('electron')
const {join} = require('path')
const axios = require('axios')
const {fetch_lineups, fetch_stats, fetch_play_types, fetch_game_ids, fetch_props} = require('./utils/fetchers.js')
const {PTS_ENDPOINT, ADV_ENDPOINT, REB_ENDPOINT, AST_ENDPOINT, USG_ENDPOINT} = require('./utils/endpoints.js')
const {create_table} = require('./utils/utils.js')

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
    const season = '2024-25'
    const deadline = '2/6/2025'

    let database = {
        lineups: await fetch_lineups(),
        stats: {
            points: await fetch_stats(PTS_ENDPOINT('', season)),
            adv: await fetch_stats(ADV_ENDPOINT('', season)),
            usg: await fetch_stats(USG_ENDPOINT('', season)),
            rebounds: await fetch_stats(REB_ENDPOINT('', season)),
            assists: await fetch_stats(AST_ENDPOINT('', season)),
        },
        stats_after_deadline: {
            points: await fetch_stats(PTS_ENDPOINT(deadline, season)),
            adv: await fetch_stats(ADV_ENDPOINT(deadline, season)),
            usg: await fetch_stats(USG_ENDPOINT(deadline, season)),
            rebounds: await fetch_stats(REB_ENDPOINT(deadline, season)),
            assists: await fetch_stats(AST_ENDPOINT(deadline, season)),
        },
        props: {
            pts: await fetch_props(ids, 'player_points'),
            reb: await fetch_props(ids, 'player_rebounds'),
            ast: await fetch_props(ids, 'player_assists'),
        },
        play_types: await fetch_play_types('P', 'offensive'),
        play_types_defense: await fetch_play_types('T', 'defensive')
    }

    const raw_table_data = create_table(database.lineups, database.stats, database.props)
    const raw_deadline_table_data = create_table(database.lineups, database.stats_after_deadline, database.props)

    ipcMain.handle('make-http-request', async (event, config) => {
        try {
            const response = await axios(config);
            return response.data
        } catch (error) {
            console.log(error)
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