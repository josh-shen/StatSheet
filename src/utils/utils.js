function normalize_name(n) {
    const names = {
        'Alex Sarr': 'Alexandre Sarr',
        'Cam Johnson': 'Cameron Johnson',
        'C.J. McCollum': 'CJ McCollum',
        'Dennis Schroder': 'Dennis Schröder',
        'Derrick Jones': 'Derrick Jones Jr.',
        'Herb Jones': 'Herbert Jones',
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

    if (n.slice(-2) === "Jr") { return n.slice(0, -2) + 'Jr.' }

    if (n in names) {
        return names[n]
    } else {
        return n
    }
}

function filter(data, name) {
    for (let i = 0; i < data.length; i++) {
        const n = normalize_name(data[i][1])
        if (n === name) {
            data[i][1] = n
            return data[i]
        }
    }
    return data[0]
}

function find_index(n, name) {
    const index = n.findIndex(element => element.name === name)

    if (index) {return index}
    return -1
}

function create_table(database){
    const table = []

    for (const group of database.lineups) {
        for (const name of group) {
            const player_row = {}

            if (Array.isArray(name)) {
                //table.push([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1])
                continue
            }

            const pts_s = filter(database.stats.points, name)
            const adv_s = filter(database.stats.adv, name)
            const reb_s = filter(database.stats.rebounds, name)
            const ast_s = filter(database.stats.assists, name)
            const usg_s = filter(database.stats.usg, name)
            let index

            player_row['name'] = name
            //index = find_index(database.props.pts, name)
            index=-1
            const pts = (index === -1 ?
                -1 : database.props.pts[1][index]['point'])
            player_row['points'] = pts
            player_row['min/game'] = pts_s[10]
            player_row['pts/game'] = pts_s[30]
            const proj =
                (pts_s[12] - pts_s[15] * pts_s[13] * 2) +
                (pts_s[15] * pts_s[16] * 3) +
                (pts_s[18] * pts_s[19])
            player_row['projected'] = proj.toFixed(1)
            player_row['fga'] = (pts_s[12] - pts_s[15]).toFixed(1)
            player_row['fg%'] = pts_s[13].toFixed(2)
            player_row['3pa'] = pts_s[15]
            player_row['3p%'] = pts_s[16].toFixed(2)
            player_row['fta'] = pts_s[18]
            player_row['ft%'] = pts_s[19].toFixed(2)
            player_row['%usg'] = adv_s[30]
            player_row['%pts'] = usg_s[28]
            //index = find_index(database.props.reb, name)
            const reb = (index === -1 ?
                -1 : database.props.reb[1][index]['point'])
            player_row['rebounds'] = reb
            player_row['oreb'] = reb_s[8]
            player_row['dreb'] = reb_s[17]
            player_row['reb/game'] = (reb_s[8] + reb_s[17]).toFixed(2)
            player_row['chances'] = reb_s[30].toFixed(2)
            player_row['%chances'] = ((reb_s[8] + reb_s[17]) / reb_s[30]).toFixed(2)
            player_row['%contested'] = reb_s[29]
            player_row['%reb'] = usg_s[20]
            //index = find_index(database.props.ast, name)
            const ast = (index === -1 ?
                -1 : database.props.ast[1][index]['point'])
            player_row['assists'] = ast
            player_row['ast/game'] = ast_s[10]
            player_row['potentials'] = ast_s[13]
            player_row['passes'] = ast_s[8]
            player_row['ast/pass'] = ast_s[16]
            player_row['%ast'] = usg_s[21]

            table.push(player_row)
        }
        //table.push([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1])
    }
    return table
}

module.exports = {normalize_name, create_table}