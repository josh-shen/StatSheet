const red = 'rgb(222, 101, 96)'
const orange = 'rgb(242, 163, 88)'
const yellow = 'rgb(253, 207, 84)'
const green = 'rgb(72, 176, 120)'
const cover = 'rgb(83, 83, 83)'
//https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
const RGB_Linear_Shade=(p,c)=>{
    var i=parseInt,r=Math.round,[a,b,c,d]=c.split(","),P=p<0,t=P?0:255*p,P=P?1+p:1-p;
    return"rgb"+(d?"a(":"(")+r(i(a[3]==="a"?a.slice(5):a.slice(4))*P+t)+","+r(i(b)*P+t)+","+r(i(c)*P+t)+(d?","+d:")");
}
const RGB_Log_Blend=(p,c0,c1)=>{
    var i=parseInt,r=Math.round,P=1-p,[a,b,c,d]=c0.split(","),[e,f,g,h]=c1.split(","),x=d||h,j=x?","+(!d?h:!h?d:r((parseFloat(d)*P+parseFloat(h)*p)*1000)/1000+")"):")";
    return"rgb"+(x?"a(":"(")+r((P*i(a[3]=="a"?a.slice(5):a.slice(4))**2+p*i(e[3]=="a"?e.slice(5):e.slice(4))**2)**0.5)+","+r((P*i(b)**2+p*i(f)**2)**0.5)+","+r((P*i(c)**2+p*i(g)**2)**0.5)+j;
}
function shade(value, mid, high, scale) {
    if (!value) {
        return 'rgba(0,0,0,0)'
    }

    if (value > mid) {
        const p = 1 - Math.min(high, (value - mid)) * scale
        return RGB_Linear_Shade(p, green)
    } else {
        const p = 1 - Math.min(high, (mid - value)) * scale
        return RGB_Linear_Shade(p, red)
    }
}
function blend(value, low, mid, floor, scale) {
    if (!value) {
        return 'rgba(0,0,0,0)'
    }

    if (value < mid) {
        const p = Math.max(0, value - low) * scale
        return RGB_Log_Blend(p, red, yellow)
    } else {
        const p = Math.min(floor, value - mid) * scale
        return RGB_Log_Blend(p, yellow, green)
    }
}

window.loaderAPI.load((event, table, database) => {
    // create data grid
    const t = table
    google.charts.load('current', {'packages':['table']});
    google.charts.setOnLoadCallback(drawTable);

    function drawTable() {
        const data = new google.visualization.arrayToDataTable(t, false);

        // create formatting styles
        const r = data.getNumberOfRows()
        let color

        for (let i = 0; i < r / 12; i++) {
            // points total
            data.setValue(5 + (i * 12), 0, database.lineups[i][5]['total'])

            // spread
            if (database.lineups[i][5]['spread'] <= 3) {
                color = green
            } else if (database.lineups[i][5]['spread'] >= 3.5 && database.lineups[i][5]['spread'] <= 6) {
                color = yellow
            } else if (database.lineups[i][5]['spread'] >= 6.5 && database.lineups[i][5]['spread'] <= 9) {
                color = orange
            } else {
                color = red
            }
            if (database.lineups[i][5]['favorite'] === database.lineups[i][5]['home']) {
                for (let j = 0; j < 5; j++) {
                    const r = j + (i * 12)
                    data.setProperty(r, 0, 'style', `background-color: ${color}`)
                }
                for (let j = 5; j < 11; j++) {
                    const r = j + (i * 12)
                    const light_color = RGB_Linear_Shade(0.5, color)
                    data.setProperty(r, 0, 'style', `background-color: ${light_color}`)
                }
            } else {
                for (let j = 0; j < 6; j++) {
                    const r = j + (i * 12)
                    const light_color = RGB_Linear_Shade(0.5, color)
                    data.setProperty(r, 0, 'style', `background-color: ${light_color}`)
                }
                for (let j = 6; j < 11; j++) {
                    const r = j + (i * 12)
                    data.setProperty(r, 0, 'style', `background-color: ${color}`)
                }
            }

            // injury indicator
            for (const index of database.lineups[i][5]['injury']) {
                const r = index + (i * 12)
                let cell = data.getValue(r, 0)
                data.setValue(r, 0, cell + ' 🩼')
            }

            // rebounding colors
            for (const c of [20, 21, 22]) {
                let min = 100
                let max = 0
                for (let j = 0; j < 11; j++) {
                    const r = j + (i * 12)

                    if (!data.getValue(r, c)) continue

                    min = Math.min(min, data.getValue(r, c))
                    max = Math.max(max, data.getValue(r, c))
                }
                const mid = (max + min) / 2
                for (let j = 0; j < 11; j++) {
                    const r = j + (i * 12)
                    const color = shade(data.getValue(r, c), mid, max, 1/(max-mid))
                    data.setProperty(r, c, 'style', `background-color: ${color};`)
                }
            }
        }

        // stats colors
        for (let i = 0; i < r - 1; ++i) {
            // min/game 18 - 28 - 38
            color = blend(data.getValue(i, 4), 18, 28, 10, 0.1)
            data.setProperty(i, 4, 'style', `background-color: ${color};`)

            // fg% 0.34 - 0.44 - 0.54
            color = blend(data.getValue(i, 8), 0.34, 0.44, 0.1, 10)
            data.setProperty(i, 8, 'style', `background-color: ${color};`)

            // 3p% 0.23 - 0.33 - 0.43
            color = blend(data.getValue(i, 10), 0.23, 0.33, 0.1, 10)
            data.setProperty(i, 10, 'style', `background-color: ${color};`)

            // ft% 0.71 - 0.81 - 0.91
            color = blend(data.getValue(i, 12), 0.71, 0.81, 0.1, 10)
            data.setProperty(i, 12, 'style', `background-color: ${color};`)

            // usg% 0.1 - 0.2 - 0.3
            color = blend(data.getValue(i, 13) , 0.1, 0.2, 0.1, 10)
            data.setProperty(i, 13, 'style', `background-color: ${color};`)

            // %pts 0.1 - 0.2 - 0.3
            color = blend(data.getValue(i, 14) , 0.1, 0.2, 0.1, 10)
            data.setProperty(i, 14, 'style', `background-color: ${color};`)

            // %reb 0.1 - 0.2 - 0.3
            color = blend(data.getValue(i, 23) , 0.1, 0.2, 0.1, 10)
            data.setProperty(i, 23, 'style', `background-color: ${color};`)

            // passes 20 - 40 - 60 (r, c=24)
            color = blend(data.getValue(i, 28), 20, 40, 20, 0.05)
            data.setProperty(i, 28, 'style', `background-color: ${color};`)

            // ast/pass 0.03 - 0.11 - 0.19
            color = blend(data.getValue(i, 29), 0.03, 0.11, 0.08, 12.5)
            data.setProperty(i, 29, 'style', `background-color: ${color};`)

            // %pts 0.1 - 0.2 - 0.3
            color = blend(data.getValue(i, 30) , 0.1, 0.2, 0.1, 10)
            data.setProperty(i, 30, 'style', `background-color: ${color};`)

            // cover -1
            if (data.getValue(i, 1) === -1) {
                data.setProperty(i, 1, 'style', `background-color: ${cover}; color: ${cover}`)
                data.setProperty(i, 2, 'style', `background-color: ${cover}; color: ${cover}`)
                data.setProperty(i, 3, 'style', `background-color: ${cover}; color: ${cover}`)
            } else {
                // line points average difference
                color = shade(data.getValue(i, 2) * -1, 0, 3, 0.33)
                data.setProperty(i, 2, 'style', `background-color: ${color};`)

                // line projected difference
                color = shade(data.getValue(i, 3) * -1, 0, 3, 0.33)
                data.setProperty(i, 3, 'style', `background-color: ${color};`)
            }
            // cover -1
            if (data.getValue(i, 15) === -1) {
                data.setProperty(i, 15, 'style', `background-color: ${cover}; color: ${cover}`)
                data.setProperty(i, 16, 'style', `background-color: ${cover}; color: ${cover}`)
            } else {
                // line rebounds average difference
                color = shade(data.getValue(i, 16) * -1, 0, 3, 0.33)
                data.setProperty(i, 16, 'style', `background-color: ${color};`)
            }
            // cover -1
            if (data.getValue(i, 24) === -1) {
                data.setProperty(i, 24, 'style', `background-color: ${cover}; color: ${cover}`)
                data.setProperty(i, 25, 'style', `background-color: ${cover}; color: ${cover}`)
            } else {
                // line assists average difference
                color = shade(data.getValue(i, 25) * -1, 0, 3, 0.33)
                data.setProperty(i, 25, 'style', `background-color: ${color};`)
            }
        }

        const table = new google.visualization.Table(document.getElementById('table'));
        const options = {
            showRowNumber: false,
            allowHtml: true,
            sort: 'disable',
            frozenColumns: 1,
            width: '100%',
            height: '100%'
        }
        table.draw(data, options);
    }

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
                        percentile[key] = RGB_Linear_Shade(p, red)
                    } else {
                        const p = 1 - (team[6] * 2)
                        percentile[key] = RGB_Linear_Shade(p, green)
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
                },
                legend: 'none',
                chartArea: {width: '100%', height: '100%'},
            }

            const chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(data, options);
        }
    })
})