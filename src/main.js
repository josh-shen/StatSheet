const {app, BrowserWindow} = require('electron')
const {join} = require('path')
const {fetch_lineups, fetch_stats, fetch_game_ids, fetch_props, fetch_play_types} = require('./utils/fetchers.js')
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
        resizable: false,
        webPreferences: {
            preload: join(__dirname, './preload.js'),
            nodeIntegration: true
        }
    })

    const ids = await fetch_game_ids()
    const season = '2024-25'
    const post_deadline = '2/6/2025'

    const database = {
        lineups: await fetch_lineups(),
        stats: {
            points: await fetch_stats(PTS_ENDPOINT('', season)),
            adv: await fetch_stats(ADV_ENDPOINT('', season)),
            usg: await fetch_stats(USG_ENDPOINT('', season)),
            rebounds: await fetch_stats(REB_ENDPOINT('', season)),
            assists: await fetch_stats(AST_ENDPOINT('', season)),
        },
        stats_post_deadline: {
            points: await fetch_stats(PTS_ENDPOINT(post_deadline, season)),
            adv: await fetch_stats(ADV_ENDPOINT(post_deadline, season)),
            usg: await fetch_stats(USG_ENDPOINT(post_deadline, season)),
            rebounds: await fetch_stats(REB_ENDPOINT(post_deadline, season)),
            assists: await fetch_stats(AST_ENDPOINT(post_deadline, season)),
        },
        props: {
            //pts: await fetch_props(ids, 'player_points'),
            //reb: await fetch_props(ids, 'player_rebounds'),
            //ast: await fetch_props(ids, 'player_assists'),
        },
        play_types: await fetch_play_types('P', 'offensive'),
        play_types_defense: await fetch_play_types('T', 'defensive')
    }

    const datatable = create_table(database)

    win.loadFile(join(__dirname, './index.html'))
        .then(() => {
            win.webContents.send('load', datatable, database)
        })
        .then(() => {
            load_window.close()
            win.show()
        })
}

app.whenReady().then(() =>{
    createWindow().then()
})