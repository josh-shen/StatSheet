const config = require('../../config.js')

const header = {
    'Dnt': '1',
    'Host': 'stats.nba.com',
    'Origin': 'https://www.stats.nba.com',
    'Referer': 'https://www.stats.nba.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
}

const LINEUP_ENDPOINT = 'https://basketballmonster.com/nbalineups.aspx'

function PTS_ENDPOINT(date_from='', season, type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&MeasureType=Base&Month=0&OpponentTeamID=0&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlusMinus=N&Rank=N&Season=${season}&SeasonType=${type}&TeamID=0`
}
function ADV_ENDPOINT(date_from='', season, type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&MeasureType=Advanced&Month=0&OpponentTeamID=0&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlusMinus=N&Rank=N&Season=${season}&SeasonType=${type}&TeamID=0`
}
function REB_ENDPOINT(date_from='', season, type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashptstats?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&Month=0&OpponentTeamID=0&PORound=0&PerMode=PerGame&PlayerOrTeam=Player&PtMeasureType=Rebounding&Season=${season}&SeasonType=${type}&TeamID=0`
}
function AST_ENDPOINT(date_from='', season, type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashptstats?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&Month=0&OpponentTeamID=0&PORound=0&PerMode=PerGame&PlayerOrTeam=Player&PtMeasureType=Passing&Season=${season}&SeasonType=${type}&TeamID=0`
}
function USG_ENDPOINT(date_from='', season, type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&MeasureType=Usage&Month=0&OpponentTeamID=0&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlusMinus=N&Rank=N&Season=${season}&SeasonType=${type}&TeamID=0`
}
function PLAYTYPE_ENDPOINT(playType, p_t, o_d, season_type) {
    return `https://stats.nba.com/stats/synergyplaytypes?LeagueID=00&PerMode=PerGame&PlayType=${playType}&PlayerOrTeam=${p_t}&SeasonType=${season_type}&SeasonYear=2024-25&TypeGrouping=${o_d}`
}
function PLAYER_AST_ENDPOINT(date_from='', season, type='Regular%20Season', playerID) {
    return `https://stats.nba.com/stats/playerdashptpass?DateFrom=${date_from}&DateTo=&LastNGames=0&LeagueID=00&Month=0&OpponentTeamID=0&PORound=0&PerMode=PerGame&Period=0&PlayerID=${playerID}&Season=${season}&SeasonType=${type}&TeamID=0`
}

let key_index = Math.floor(Math.random() * config.API_KEYS.length)

function GAME_ID_ENDPOINT() {
    const time = new Date()
    time.setHours(24, 0, 0, 0);

    key_index = (key_index + 1) % config.API_KEYS.length;

    return `https://api.the-odds-api.com/v4/sports/basketball_nba/events?apiKey=${config.API_KEYS[key_index]}&commenceTimeTo=${time.toISOString().split('.')[0]+'Z'}`
}
function ODDS_ENDPOINT(id, prop) {
    key_index = (key_index + 1)  % config.API_KEYS.length;

    return `https://api.the-odds-api.com/v4/sports/basketball_nba/events/${id}/odds?apiKey=${config.API_KEYS[key_index]}&bookmakers=draftkings&markets=${prop}&oddsFormat=american`
}

module.exports = {
    header,
    LINEUP_ENDPOINT,
    PTS_ENDPOINT,
    ADV_ENDPOINT,
    REB_ENDPOINT,
    AST_ENDPOINT,
    USG_ENDPOINT,
    PLAYER_AST_ENDPOINT,
    GAME_ID_ENDPOINT,
    ODDS_ENDPOINT,
    PLAYTYPE_ENDPOINT
}