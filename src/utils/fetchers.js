const axios = require('axios')
const jsdom = require('jsdom').JSDOM
const {header, LINEUP_URL, GAME_ID_URL, ODDS_URL, PLAYTYPE_URL} = require("./urls.js")
const {normalize_name} = require('./utils.js')

async function fetch_lineups() {
    const lineups = []

    try {
        const dom = await jsdom.fromURL(LINEUP_URL)
        const tables = dom.window.document.querySelectorAll(".datatable");

        for (let i = 0; i < tables.length; i++) {
            const headers = tables[i].getElementsByTagName("th");

            const teams = []
            for (let j = 0; j < headers.length; j++) {
                if (headers[j].textContent.includes(" @ ")) {
                    // 32 34
                    let s = headers[j].textContent.split(" ");
                    teams.push(s[32])
                    teams.push([34].trim())
                }
            }

            const names = tables[i].querySelectorAll("a");
            const home = []
            const away = []
            let flag = true

            for (let j = 0; j < names.length; j++) {
                const name = normalize_name(names[j].textContent);
                if (flag) {
                    home.push(name)
                } else {
                    away.push(name)
                }
                flag = !flag
            }
            lineups.push([...home, teams, ...away])
        }
    } catch (error) {
        console.error(error);
    }
    return lineups
}

async function fetch_stats(url) {
    try {
        const response = await axios.get(url, {headers: header})
        const data = await response.data

        return data['resultSets'][0]['rowSet']
    } catch (error) {
        console.log(error)
    }
}

async function fetch_game_ids() {
    try {
        const response = await axios.get(GAME_ID_URL())
        const games = await response.data

        const ids = []
        for (const n of games) { ids.push(n['id']) }

        return ids
    } catch (error) {
        console.log(error)
    }
}

async function fetch_props(ids, prop) {
    const player_list = []
    const prop_lines = []

    for (const id of ids) {
        try {
            const response = await axios.get(ODDS_URL(id, prop))
            const data = await response.data

            const lines = data['bookmakers'][0]['markets'][0]['outcomes']

            for (const n of lines) {
                // data comes with lines for OVER and UNDER for each player. Only one is needed
                const found = prop_lines.some(element => element.description === normalize_name(n.description))
                if (!found) {
                    n.description = normalize_name(n.description)
                    prop_lines.push(n)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    return prop_lines
}

async function fetch_play_types(p_t, o_d) {
    const play_types = ['Isolation', 'Transition', 'PRBallHandler', 'PRRollMan', 'Postup', 'Spotup', 'Handoff', 'Cut', 'OffScreen', 'OffRebound', 'Misc']
    const res = {}

    for (const playType of play_types) {
        try {
            const response = await axios.get(PLAYTYPE_URL(playType, p_t, o_d), {headers: header})
            const data = await response.data

            res[playType] = data["resultSets"][0]['rowSet']
        } catch (error){
            console.log(error)
        }
    }

    return res
}

module.exports = {fetch_lineups, fetch_stats, fetch_game_ids, fetch_props, fetch_play_types}