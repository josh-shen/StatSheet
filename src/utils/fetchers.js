const axios = require('axios')
const jsdom = require('jsdom').JSDOM
const {header, LINEUP_ENDPOINT, GAME_ID_ENDPOINT, ODDS_ENDPOINT, PLAYTYPE_ENDPOINT} = require("./endpoints.js")
const {parse_lineups, normalize_name} = require('./utils.js')

async function fetch_lineups() {
    try {
        const dom = await jsdom.fromURL(LINEUP_ENDPOINT)
        const tables = dom.window.document.querySelectorAll(".datatable");

        return parse_lineups(tables)
    } catch (error) {
        const error_info = {
            errno: error.errno,
            code: error.code,
        }
        console.log(error_info)
    }
}

async function fetch_stats(url) {
    try {
        const response = await axios.get(url, {headers: header})
        const data = await response.data

        return data['resultSets'][0]['rowSet']
    } catch (error) {
        const error_info = {
            errno: error.errno,
            code: error.code,
        }
        console.log(error_info)
    }
}

async function fetch_play_types(p_t, o_d, season_type) {
    const play_types = ['Isolation', 'Transition', 'PRBallHandler', 'PRRollMan', 'Postup', 'Spotup', 'Handoff', 'Cut', 'OffScreen', 'OffRebound', 'Misc']
    const res = {}

    for (const playType of play_types) {
        try {
            const response = await axios.get(PLAYTYPE_ENDPOINT(playType, p_t, o_d, season_type), {headers: header})
            const data = await response.data

            // set a small timeout to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            res[playType] = data["resultSets"][0]['rowSet']
        } catch (error) {
            const error_info = {
                errno: error.errno,
                code: error.code,
            }
            console.log(error_info)
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
        const error_info = {
            errno: error.errno,
            code: error.code,
        }
        console.log(error_info)
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
            const error_info = {
                errno: error.errno,
                code: error.code,
            }
            console.log(error_info)
        }
    }
    return prop_lines
}

module.exports = {fetch_lineups, fetch_stats, fetch_play_types, fetch_game_ids, fetch_props}