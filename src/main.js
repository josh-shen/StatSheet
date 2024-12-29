const {app, BrowserWindow} = require('electron')
const {join} = require('path')
const {fetch_lineups, fetch_stats, fetch_game_ids, fetch_props, fetch_play_types} = require('./utils/fetchers.js')
const {PTS_ENDPOINT, ADV_ENDPOINT, REB_ENDPOINT, AST_ENDPOINT, USG_ENDPOINT} = require('./utils/endpoints.js')
const {create_table} = require('./utils/utils.js')

async function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, './preload.js'),
            nodeIntegration: true
        }
    })

    //const ids = await fetch_game_ids()

    const database = {
        lineups: await fetch_lineups(),
        stats: {
            points: await fetch_stats(PTS_ENDPOINT()),
            adv: await fetch_stats(ADV_ENDPOINT()),
            usg: await fetch_stats(USG_ENDPOINT()),
            rebounds: await fetch_stats(REB_ENDPOINT()),
            assists: await fetch_stats(AST_ENDPOINT()),
        },
        props: {
            //pts: await fetch_props(ids, 'player_points'),
            //reb: await fetch_props(ids, 'player_rebounds'),
            //ast: await fetch_props(ids, 'player_assists'),
        },
        play_types: await fetch_play_types('P', 'offensive'),
        play_types_defense: await fetch_play_types('T', 'defensive')
    }

    const table = create_table(database)

    win.loadFile(join(__dirname, './index.html'))
        .then(() => {
            win.webContents.send('load', table, database)
        })
        .then(() => {
            win.show()
        })
}

app.whenReady().then(() =>{
    createWindow()
})