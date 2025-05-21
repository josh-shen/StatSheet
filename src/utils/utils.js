function parse_lineups(dom) {
    const lineups = []

    const tables = dom.window.document.querySelectorAll(".datatable");

    for (let i = 0; i < tables.length; i++) {
        const headers = tables[i].getElementsByTagName("th");

        const teams = {}
        teams['injury'] = []

        const header = dom.window.document.querySelector("h1")
        const header_string = header.textContent.split(" ")
        teams['date'] = header_string[4]

        for (let j = 0; j < headers.length; j++) {
            if (headers[j].textContent.includes(" @ ")) {
                let s = headers[j].textContent.split(" ");

                // s[66] time, s[67] AM/PM
                const time_string = s[66].split(":")
                const UTCTime = new Date()

                if (s[67] !== 'PM') {
                    UTCTime.setUTCHours(Number(time_string[0]) + 4) // original time is in eastern time, +4 to UTC
                } else {
                    UTCTime.setUTCHours(Number(time_string[0]) + 16) // +4 to UTC, +12 for 24hr format
                }
                UTCTime.setUTCMinutes(Number(time_string[1]))

                // double zeros
                let hours, minutes
                if (UTCTime.getHours() < 10) {
                    hours = `0${UTCTime.getHours()}`
                } else {
                    hours = UTCTime.getHours()
                }
                if (UTCTime.getMinutes() === 0) {
                    minutes = `0${UTCTime.getMinutes()}`
                } else {
                    minutes = UTCTime.getMinutes()
                }
                teams['start_time'] = `${hours}:${minutes}`

                teams['away'] = normalize_team(s[32])
                teams['home'] = normalize_team(s[34].trim())

                let lines = headers[j].querySelector("small")
                if (headers[j].textContent.includes("Final")) {
                    teams['favorite'] = 'FINAL'
                    teams['spread'] = 0
                    teams['total'] = 'FINAL'
                } else if (!lines) {
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
    return lineups
}

function normalize_name(n) {
    const names = {
        'Alex Sarr': 'Alexandre Sarr',
        'Cam Johnson': 'Cameron Johnson',
        'C.J. McCollum': 'CJ McCollum',
        'Dennis Schroder': 'Dennis Schröder',
        'Derrick Jones': 'Derrick Jones Jr.',
        'Herb Jones': 'Herbert Jones',
        'Jimmy Butler': 'Jimmy Butler III',
        'Jonas Valanciunas': 'Jonas Valančiūnas',
        'Jusuf Nurkic': 'Jusuf Nurkić',
        'Kelly Oubre': 'Kelly Oubre Jr.',
        'Kristaps Porzingis': 'Kristaps Porziņģis',
        'Luka Doncic': 'Luka Dončić',
        'Nicolas Claxton': 'Nic Claxton',
        'Nikola Jokic': 'Nikola Jokić',
        'Nikola Jovic': 'Nikola Jović',
        'Nikola Vucevic': 'Nikola Vučević',
        'O.G. Anunoby': 'OG Anunoby',
        'PJ Washington': 'P.J. Washington',
        'R.J. Barrett': 'RJ Barrett',
        'Trey Murphy': 'Trey Murphy III',
        'Vasilije Micic': 'Vasilije Micić'
    }

    if (n.slice(-2) === "Jr") return n.slice(0, -2) + 'Jr.'

    return (n in names) ? names[n] : n
}

function normalize_team(n) {
    const teams = {
        'NOR' : 'NOP',
        'PHO' : 'PHX'
    }

    return (n in teams) ? teams[n] : n
}

function filter(stats, name) {
    for (let i = 0; i < stats.length; i++) {
        if (stats[i][1] === null) continue
        const n = normalize_name(stats[i][1])
        if (n === name) {
            stats[i][1] = n
            return stats[i]
        }
    }
    return stats[0]
}

function find_index(n, name) {
    const index = n.findIndex(element => element.description === name)

    if (index) return index
    return -1
}

function projection(pts_stats) {
    const projected_fg = (pts_stats[12] - pts_stats[15] * pts_stats[13] * 2)
    const projected_tp = (pts_stats[15] * pts_stats[16] * 3)
    const projected_ft = (pts_stats[18] * pts_stats[19])
    return (projected_fg + projected_tp + projected_ft).toFixed(1)
}

function create_table(lineups, stats, props){
    const table = []
    const header = [
        {type: 'string'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {type: 'number'}
    ]
    table.push(header)

    for (const group of lineups) {
        for (const name of group) {
            const player_row = []

            if (typeof name !== 'string') {
                table.push(['',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])
                continue
            }
            
            const pts_stats = filter(stats.points, name)
            const adv_stats = filter(stats.adv, name)
            const reb_stats = filter(stats.rebounds, name)
            const ast_stats = filter(stats.assists, name)
            const usg_stats = filter(stats.usg, name)
            let index = -1

            player_row.push(name)
            index = find_index(props.pts, name)
            const pts = index === -1 ? -1 : props.pts[index]['point']
            player_row.push(pts)
            player_row.push(pts - pts_stats[30])
            const proj = projection(pts_stats)
            player_row.push(pts - proj)
            player_row.push(pts_stats[10])
            player_row.push(pts_stats[30])
            player_row.push(proj)
            player_row.push((pts_stats[12] - pts_stats[15]).toFixed(1))
            player_row.push(pts_stats[13].toFixed(2))
            player_row.push(pts_stats[15])
            player_row.push(pts_stats[16].toFixed(2))
            player_row.push(pts_stats[18])
            player_row.push(pts_stats[19].toFixed(2))
            player_row.push(adv_stats[30])
            player_row.push(usg_stats[28])
            index = find_index(props.reb, name)
            const reb = index === -1 ? -1 : props.reb[index]['point']
            player_row.push(reb)
            player_row.push(reb - (reb_stats[8] + reb_stats[17]).toFixed(2))
            player_row.push(reb_stats[8])
            player_row.push(reb_stats[17])
            player_row.push((reb_stats[8] + reb_stats[17]).toFixed(2))
            player_row.push(reb_stats[30].toFixed(2))
            player_row.push(((reb_stats[8] + reb_stats[17]) / reb_stats[30]).toFixed(2))
            player_row.push(reb_stats[29])
            player_row.push(usg_stats[20])
            index = find_index(props.ast, name)
            const ast = index === -1 ? -1 : props.ast[index]['point']
            player_row.push(ast)
            player_row.push(ast - ast_stats[10])
            player_row.push(ast_stats[10])
            player_row.push(ast_stats[13])
            player_row.push(ast_stats[8])
            player_row.push(ast_stats[16])
            player_row.push(usg_stats[21])

            table.push(player_row)
        }
        table.push(header)
    }
    table.pop() // remove last empty row
    return table
}

module.exports = {parse_lineups, normalize_name, create_table}