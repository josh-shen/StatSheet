const {app, BrowserWindow} = require('electron')
const {join} = require('path')
const {fetch_lineups, fetch_stats, fetch_game_ids, fetch_props, fetch_play_types} = require('./utils/fetchers.js')
const {PTS_URL, ADV_URL, REB_URL, AST_URL, USG_URL} = require('./utils/urls.js')
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
        lineups: [
            [
                'Jalen Brunson', ' Mikal Bridges', 'Josh Hart', 'OG Anunoby', 'Karl-Anthony Towns',
                ['NYK', 'SAS'],
                'Chris Paul', 'Devin Vassell', 'Jeremy Sochan', 'Harrison Barnes', 'Victor Wembanyama'
            ]
        ],//await fetch_lineups(),
        stats: {
            points: await fetch_stats(PTS_URL()),
            adv: await fetch_stats(ADV_URL()),
            usg: await fetch_stats(USG_URL()),
            rebounds: await fetch_stats(REB_URL()),
            assists: await fetch_stats(AST_URL()),
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