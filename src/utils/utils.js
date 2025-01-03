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

    if (n.slice(-2) === "Jr") return n.slice(0, -2) + 'Jr.'

    return (n in names) ? names[n] : n
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

    if (index) {return index}
    return -1
}

function projection(pts_stats) {
    const projected_fg = (pts_stats[12] - pts_stats[15] * pts_stats[13] * 2)
    const projected_tp = (pts_stats[15] * pts_stats[16] * 3)
    const projected_ft = (pts_stats[18] * pts_stats[19])
    return (projected_fg + projected_tp + projected_ft).toFixed(1)
}

function create_table(database){
    const table = []

    table.push([
        {label: '----------------------------------------', type: 'string'},
        {label: 'points', type: 'number'},
        {type: 'number'},
        {type: 'number'},
        {label: 'min', type: 'number'},
        {label: 'pts', type: 'number'},
        {label: 'proj', type: 'number'},
        {label: 'fga', type: 'number'},
        {label: 'fg%', type: 'number'},
        {label: '3pa', type: 'number'},
        {label: '3p%', type: 'number'},
        {label: 'fta', type: 'number'},
        {label: 'ft%', type: 'number'},
        {label: 'usg%', type: 'number'},
        {label: '%pts', type: 'number'},
        {label: 'rebounds', type: 'number'},
        {type: 'number'},
        {label: 'oreb', type: 'number'},
        {label: 'dreb', type: 'number'},
        {label: 'reb', type: 'number'},
        {label: 'chances', type: 'number'},
        {label: '%chances', type: 'number'},
        {label: '%contested', type: 'number'},
        {label: '%reb', type: 'number'},
        {label: 'assists', type: 'number'},
        {type: 'number'},
        {label: 'ast', type: 'number'},
        {label: 'potentials', type: 'number'},
        {label: 'passes', type: 'number'},
        {label: 'ast/pass', type: 'number'},
        {label: '%ast', type: 'number'}
    ])

    for (const group of database.lineups) {
        for (const name of group) {
            const player_row = []

            if (typeof name !== 'string') {
                table.push(['',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])
                continue
            }
            
            const pts_stats = filter(database.stats.points, name)
            const adv_stats = filter(database.stats.adv, name)
            const reb_stats = filter(database.stats.rebounds, name)
            const ast_stats = filter(database.stats.assists, name)
            const usg_stats = filter(database.stats.usg, name)
            let index = -1

            player_row.push(name)
            index = find_index(database.props.pts, name)
            const pts = index === -1 ? -1 : database.props.pts[index]['point']
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
            index = find_index(database.props.reb, name)
            const reb = index === -1 ? -1 : database.props.reb[index]['point']
            player_row.push(reb)
            player_row.push(reb - (reb_stats[8] + reb_stats[17]).toFixed(2))
            player_row.push(reb_stats[8])
            player_row.push(reb_stats[17])
            player_row.push((reb_stats[8] + reb_stats[17]).toFixed(2))
            player_row.push(reb_stats[30].toFixed(2))
            player_row.push(((reb_stats[8] + reb_stats[17]) / reb_stats[30]).toFixed(2))
            player_row.push(reb_stats[29])
            player_row.push(usg_stats[20])
            index = find_index(database.props.ast, name)
            const ast = index === -1 ? -1 : database.props.ast[index]['point']
            player_row.push(ast)
            player_row.push(ast - ast_stats[10])
            player_row.push(ast_stats[10])
            player_row.push(ast_stats[13])
            player_row.push(ast_stats[8])
            player_row.push(ast_stats[16])
            player_row.push(usg_stats[21])

            table.push(player_row)
        }
        table.push(['',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])
    }
    return table
}

module.exports = {normalize_name, create_table}