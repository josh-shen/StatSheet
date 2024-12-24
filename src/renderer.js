//https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
const RGB_Linear_Shade=(p,c)=>{
    var i=parseInt,r=Math.round,[a,b,c,d]=c.split(","),P=p<0,t=P?0:255*p,P=P?1+p:1-p;
    return"rgb"+(d?"a(":"(")+r(i(a[3]==="a"?a.slice(5):a.slice(4))*P+t)+","+r(i(b)*P+t)+","+r(i(c)*P+t)+(d?","+d:")");
}

window.loaderAPI.load((event, table, database) => {
    // create data grid
    const options = {
        rowData: table,
        columnDefs: [
            {field: 'name'},
            {field: 'points'},
            {field: 'min/game'},
            {field: 'pts/game'},
            {field: 'projected'},
            {field: 'fga'},
            {field: 'fg%'},
            {field: '3pa'},
            {field: '3p%'},
            {field: 'fta'},
            {field: 'ft%'},
            {field: '%usg'},
            {field: '%pts'},
            {field: 'rebounds'},
            {field: 'oreb'},
            {field: 'dreb'},
            {field: 'reb/game'},
            {field: 'chances'},
            {field: '%chances'},
            {field: '%contested'},
            {field: '%reb'},
            {field: 'assists'},
            {field: 'ast/game'},
            {field: 'potentials'},
            {field: 'passes'},
            {field: 'ast/pass'},
            {field: '%ast'}
        ]
    }

    const grid = document.getElementById('grid')
    agGrid.createGrid(grid, options)

    // select player to visualize on pie chart
    const select = document.getElementById('select_player');

    for (const group of database.lineups) {
        for (const name of group) {
            if (Array.isArray(name)) continue

            const element = document.createElement('option');
            element.textContent = name;
            element.value = name;
            select.appendChild(element);
        }
    }

    // create pie chart
    select.addEventListener('change', (event) => {
        const dataset = [
            ['Isolation', 0],
            ['Transition', 0],
            ['PRBallHandler', 0],
            ['PRRollMan', 0],
            ['Postup', 0],
            ['Spotup', 0],
            ['Handoff', 0],
            ['Cut', 0],
            ['OffScreen', 0],
            ['OffRebound', 0],
            ['Misc', 0]
        ]
        let player_team

        // set slice values
        for (const [key, value] of Object.entries(database.play_types)) {
            for (const player of value) {
                if (player.includes(event.target.value)) {
                    player_team = player[4]
                    switch (key) {
                        case 'Isolation': dataset[0][1] = player[10]
                            break
                        case 'Transition': dataset[1][1] = player[10]
                            break
                        case 'PRBallHandler': dataset[2][1] = player[10]
                            break
                        case 'PRRollMan': dataset[3][1] = player[10]
                            break
                        case 'Postup': dataset[4][1] = player[10]
                            break
                        case 'Spotup': dataset[5][1] = player[10]
                            break
                        case 'Handoff': dataset[6][1] = player[10]
                            break
                        case 'Cut': dataset[7][1] = player[10]
                            break
                        case 'OffScreen': dataset[8][1] = player[10]
                            break
                        case 'OffRebound': dataset[9][1] = player[10]
                            break
                        case 'Misc': dataset[10][1] = player[10]
                            break
                    }
                    break
                }
            }
        }

        // find defending team
        let opponent
        for (const match of database.lineups) {
            const player_index = match.indexOf(event.target.value)
            if (player_index < 5) {
                opponent = match[5][0]
            } else if (player_index > 5) {
                opponent = match[5][1]
            } else {
                continue
            }
            break
        }

        // set variable slice colors
        const percentile = {}
        for (const [key, value] of Object.entries(database.play_types_defense)) {
            for (const team of value) {
                if (team[2] === opponent) {
                    if (team[6] > 0.5) {
                        const p = 1 - (team[6] - 0.5) * 2
                        percentile[key] = RGB_Linear_Shade(p, 'rgb(234, 67, 53)')
                    } else {
                        const p = 1 - (team[6] * 2)
                        percentile[key] = RGB_Linear_Shade(p, 'rgb(52, 168, 83)')
                    }
                }
            }
        }

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            const data = google.visualization.arrayToDataTable(dataset, true);
            const options = {
                slices: {
                    0: {color: percentile[dataset[0][0]]},
                    1: {color: percentile[dataset[1][0]]},
                    2: {color: percentile[dataset[2][0]]},
                    3: {color: percentile[dataset[3][0]]},
                    4: {color: percentile[dataset[4][0]]},
                    5: {color: percentile[dataset[5][0]]},
                    6: {color: percentile[dataset[6][0]]},
                    7: {color: percentile[dataset[7][0]]},
                    8: {color: percentile[dataset[8][0]]},
                    9: {color: percentile[dataset[9][0]]},
                    10: {color: percentile[dataset[10][0]]}
                }
            }

            const chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(data, options);
        }
    })
})