const axios = require('axios')
const jsdom = require('jsdom').JSDOM
const {header, LINEUP_ENDPOINT, GAME_ID_ENDPOINT, ODDS_ENDPOINT, PLAYTYPE_ENDPOINT} = require("./endpoints.js")
const {normalize_name, normalize_team} = require('./utils.js')

async function fetch_lineups() {
    const lineups = []

    try {
        const dom = await jsdom.fromURL(LINEUP_ENDPOINT)
        const tables = dom.window.document.querySelectorAll(".datatable");

        for (let i = 0; i < tables.length; i++) {
            const headers = tables[i].getElementsByTagName("th");

            const teams = {}
            teams['injury'] = []
            for (let j = 0; j < headers.length; j++) {
                if (headers[j].textContent.includes(" @ ")) {
                    let s = headers[j].textContent.split(" ");
                    teams['away'] = normalize_team(s[32])
                    teams['home'] = normalize_team(s[34].trim())

                    let lines = headers[j].querySelector("small")
                    if (!lines) {
                        teams['favorite'] = 'LIVE'
                        teams['spread'] = 0
                        teams['total'] = 'LIVE'
                    } else {
                        lines = lines.textContent.split(" ");

                        if (lines[0] === 'EVEN') {
                            teams['favorite'] = lines[0]
                            teams['spread'] = 0
                            teams['total'] = lines[2]
                        } else {
                            teams['favorite'] = lines[0]
                            teams['spread'] = lines[2]
                            teams['total'] = lines[4]
                        }
                    }
                }
            }

            const names = tables[i].querySelectorAll("td[class=''], td[class='verified']");
            const home = []
            const away = []
            let flag = true
            let empty = false

            for (let j = 0; j < names.length; j++) {
                let name = names[j].querySelector("a")
                if (name === null) {
                    empty = true
                    break
                }
                const injury = names[j].querySelectorAll("span")
                const ignore = ['Playing', 'Starting', 'Off Injury Report', 'Ejected']
                if (injury[0] && !ignore.some(keyword => injury[0].title.includes(keyword))) {
                    const index = j % 2 === 0 ? j / 2 : Math.ceil(j/2) + 5
                    teams['injury'].push({[index]: injury[0].title})
                }

                name = (name) ? normalize_name(name.textContent) : ''

                if (flag) {
                    home.push(name)
                } else {
                    away.push(name)
                }
                flag = !flag
            }
            if (!empty) lineups.push([...home, teams, ...away])

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

async function fetch_play_types(p_t, o_d) {
    const play_types = ['Isolation', 'Transition', 'PRBallHandler', 'PRRollMan', 'Postup', 'Spotup', 'Handoff', 'Cut', 'OffScreen', 'OffRebound', 'Misc']
    const res = {}

    for (const playType of play_types) {
        try {
            const response = await axios.get(PLAYTYPE_ENDPOINT(playType, p_t, o_d), {headers: header})
            const data = await response.data

            res[playType] = data["resultSets"][0]['rowSet']
        } catch (error) {
            console.log(error)
        }
    }

    return res
}

async function fetch_game_ids() {
    try {
        const response = await axios.get(GAME_ID_ENDPOINT())
        const games = await response.data

        const ids = []
        for (const n of games) { ids.push(n['id']) }

        return ids
    } catch (error) {
        console.log(error)
    }
}

async function fetch_props(ids, prop) {
    const prop_lines = []

    for (const id of ids) {
        try {
            const response = await axios.get(ODDS_ENDPOINT(id, prop))
            const data = await response.data
            if (data['bookmakers'] === []) continue // bookmakers have not created lines for this prop yet
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

module.exports = {fetch_lineups, fetch_stats, fetch_play_types, fetch_game_ids, fetch_props}