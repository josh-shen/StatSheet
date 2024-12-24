const header = {
    'Dnt': '1',
    'Host': 'stats.nba.com',
    'Origin': 'https://www.stats.nba.com',
    'Referer': 'https://www.stats.nba.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
}

const LINEUP_URL = 'https://basketballmonster.com/nbalineups.aspx'

function PTS_URL(date_from='', season='2024-25', type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=${date_from}&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=${season}&SeasonSegment=&SeasonType=${type}&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=`
}
function ADV_URL(date_from='', season='2024-25', type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=${date_from}&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Advanced&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=${season}&SeasonSegment=&SeasonType=${type}&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=`

}
function REB_URL(date_from='', season='2024-25', type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashptstats?College=&Conference=&Country=&DateFrom=${date_from}&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PerMode=PerGame&PlayerExperience=&PlayerOrTeam=Player&PlayerPosition=&PtMeasureType=Rebounding&Season=${season}&SeasonSegment=&SeasonType=${type}&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=`
}
function AST_URL(date_from='', season='2024-25', type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashptstats?College=&Conference=&Country=&DateFrom=${date_from}&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PerMode=PerGame&PlayerExperience=&PlayerOrTeam=Player&PlayerPosition=&PtMeasureType=Passing&Season=${season}&SeasonSegment=&SeasonType=${type}&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=`
}
function USG_URL(date_from='', season='2024-25', type='Regular%20Season') {
    return `https://stats.nba.com/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=${date_from}&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Usage&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=${season}&SeasonSegment=&SeasonType=${type}&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=`
}
function PLAYTYPE_URL(playType, p_t, o_d) {
    return `https://stats.nba.com/stats/synergyplaytypes?LeagueID=00&PerMode=PerGame&PlayType=${playType}&PlayerOrTeam=${p_t}&SeasonType=Regular%20Season&SeasonYear=2024-25&TypeGrouping=${o_d}`
}

function GAME_ID_URL() {
    const time = new Date()
    time.setHours(24, 0, 0, 0);

    return `https://api.the-odds-api.com/v4/sports/basketball_nba/events?apiKey=${API_KEY}&commenceTimeTo=${time.toISOString().split('.')[0]+'Z'}`
}
function ODDS_URL(id, prop) {
    return `https://api.the-odds-api.com/v4/sports/basketball_nba/events/${id}/odds?apiKey=${API_KEY}&bookmakers=draftkings&markets=${prop}&oddsFormat=american`
}

module.exports = {header, LINEUP_URL, PTS_URL, ADV_URL, REB_URL, AST_URL, USG_URL, GAME_ID_URL, ODDS_URL, PLAYTYPE_URL}