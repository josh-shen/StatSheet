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
    return"rgb"+(x?"a(":"(")+r((P*i(a[3]==="a"?a.slice(5):a.slice(4))**2+p*i(e[3]==="a"?e.slice(5):e.slice(4))**2)**0.5)+","+r((P*i(b)**2+p*i(f)**2)**0.5)+","+r((P*i(c)**2+p*i(g)**2)**0.5)+j;
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

function format_cells(data, database) {
    const r = data.getNumberOfRows()
    let color

    // individual game colors
    for (let i = 0; i < r / 12; i++) {
        // team colors
        for (let j = 0; j < 11; j++) {
            const r = j + (i * 12)
            let color
            if (j < 5) {
                color = `--${database.lineups[i][5]['away'].toLowerCase()}-alternate`
            } else {
                color = `--${database.lineups[i][5]['home'].toLowerCase()}`
            }
            data.setProperty(r, 0, 'className', 'name_cell')
            data.setProperty(r, 0, 'style', `border-left: 4px solid var(${color}) !important`)
        }
        // spread, points total
        const row = 5 + (i * 12)
        const favorite = database.lineups[i][5]['favorite']
        const spread = database.lineups[i][5]['spread']
        const total = database.lineups[i][5]['total']

        data.setValue(row, 0, `<span>${favorite} -${spread}</span><span class="total">+/-${total}</span>`)
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
        data.setProperty(row, 0, 'style', `background-color: ${color}; display: flex; justify-content: space-between;`)

        // injury indicator
        for (const obj of database.lineups[i][5]['injury']) {
            const key = Object.keys(obj)
            let val = obj[key[0]]
            const snip_start = val.indexOf("(") // remove (injury), (illness), etc. tags from description
            const snip_end = val.indexOf(")")
            if (snip_start !== -1 || snip_end !== -1) {
                val = val.slice(0, snip_start - 1) + val.slice(snip_end + 1);
            }
            const r = Number(key[0]) + (i * 12)
            let cell = data.getValue(r, 0)
            if (val.includes('Will not return') || val.includes('Out')) {
                data.setValue(r, 0, cell + `<span class="outAlert" injury-tooltip="${val}"> OUT</span>`)
            } else {
                data.setValue(r, 0, cell + `<span class="injuryAlert" injury-tooltip="${val}"> GTD</span>`)
            }
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

    // full stats colors
    for (let i = 0; i < r; ++i) {
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

        // cover -1 points
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
        // cover -1 rebounds
        if (data.getValue(i, 15) === -1) {
            data.setProperty(i, 15, 'style', `background-color: ${cover}; color: ${cover}`)
            data.setProperty(i, 16, 'style', `background-color: ${cover}; color: ${cover}`)
        } else {
            // line rebounds average difference
            color = shade(data.getValue(i, 16) * -1, 0, 3, 0.33)
            data.setProperty(i, 16, 'style', `background-color: ${color};`)
        }
        // cover -1 assists
        if (data.getValue(i, 24) === -1) {
            data.setProperty(i, 24, 'style', `background-color: ${cover}; color: ${cover}`)
            data.setProperty(i, 25, 'style', `background-color: ${cover}; color: ${cover}`)
        } else {
            // line assists average difference
            color = shade(data.getValue(i, 25) * -1, 0, 3, 0.33)
            data.setProperty(i, 25, 'style', `background-color: ${color};`)
        }
    }
}

function drawTable(data, database, options, table_id) {
    const datatable = new google.visualization.arrayToDataTable(data);

    format_cells(datatable, database)

    const table = new google.visualization.Table(document.getElementById(table_id));

    table.draw(datatable, options);

    // allow cell editing
    const tbody1 = document.querySelector(`#${table_id} tbody`);
    tbody1.addEventListener('click', e => edit_cells(e, datatable, table, options, table_id))
}

function edit_cells(e, datatable, table, options, table_id) {
    const cell = e.target.closest('td')
    if (!cell) return

    const row = cell.parentElement;

    // allow cell editing only on player rows
    if (cell.cellIndex === 1 || cell.cellIndex === 15 || cell.cellIndex === 24) {
        if ((row.rowIndex - 6) % 6 !== 0) {
            cell.contentEditable = true
            // update projection values and formatting
            cell.addEventListener('blur', function(e) { update_cell(e, datatable, table, options, table_id) })
        }
    }
}

function update_cell(sender, datatable, table, options, table_id){
    // store current scroll state
    const container = document.querySelector(`#${table_id} .google-visualization-table > div`);
    const scrollState = container.scrollTop

    const row = sender.target.parentNode.rowIndex - 1
    let color
    if (sender.target.cellIndex === 1) {
        datatable.setValue(row, 1, sender.target.innerHTML)
        datatable.setValue(row, 2, sender.target.innerHTML - datatable.getValue(row, 5))
        datatable.setValue(row, 3, sender.target.innerHTML - datatable.getValue(row, 6))
        if (sender.target.innerHTML === '-1') {
            datatable.setProperty(row, 1, 'style', `background-color: ${cover}; color: ${cover};`)
            datatable.setProperty(row, 2, 'style', `background-color: ${cover}; color: ${cover};`)
            datatable.setProperty(row, 3, 'style', `background-color: ${cover}; color: ${cover};`)
        } else {
            datatable.setProperty(row, 1, 'style', 'background-color: rgb(255, 255, 255);')

            color = shade(datatable.getValue(row, 2) * -1, 0, 3, 0.33)
            datatable.setProperty(row, 2, 'style', `background-color: ${color};`)

            color = shade(datatable.getValue(row, 3) * -1, 0, 3, 0.33)
            datatable.setProperty(row, 3, 'style', `background-color: ${color};`)
        }
    } else if (sender.target.cellIndex === 15) {
        datatable.setValue(row, 15, sender.target.innerHTML)
        datatable.setValue(row, 16, sender.target.innerHTML - datatable.getValue(row, 19))

        if (sender.target.innerHTML === '-1') {
            datatable.setProperty(row, 15, 'style', `background-color: ${cover}; color: ${cover};`)
            datatable.setProperty(row, 16, 'style', `background-color: ${cover}; color: ${cover};`)
        } else {
            datatable.setProperty(row, 15, 'style', 'background-color: rgb(255, 255, 255);')

            color = shade(datatable.getValue(row, 16) * -1, 0, 3, 0.33)
            datatable.setProperty(row, 16, 'style', `background-color: ${color};`)
        }
    } else if (sender.target.cellIndex === 24) {
        datatable.setValue(row, 24, sender.target.innerHTML)
        datatable.setValue(row, 25, sender.target.innerHTML - datatable.getValue(row, 26))

        if (sender.target.innerHTML === '-1') {
            datatable.setProperty(row, 24, 'style', `background-color: ${cover}; color: ${cover};`)
            datatable.setProperty(row, 25, 'style', `background-color: ${cover}; color: ${cover};`)
        } else {
            datatable.setProperty(row, 24, 'style', 'background-color: rgb(255, 255, 255);')

            color = shade(datatable.getValue(row, 25) * -1, 0, 3, 0.33)
            datatable.setProperty(row, 25, 'style', `background-color: ${color};`)
        }
    }

    table.draw(datatable, options)

    // the table has been redrawn, so go back to the saved scrolled position
    const newContainer = document.querySelector(`#${table_id} .google-visualization-table > div`)
    newContainer.scrollTop = scrollState

    const tbody = document.querySelector(`#${table_id} tbody`);
    tbody.addEventListener('click', e => edit_cells(e, datatable, table, options))
}

async function handleNameClick(e, database) {
    const target = e.target
    if (target.classList.contains('name_cell')) {
        let text = target.textContent
        if (text.includes('GTD')) {
            text = text.substring(0, text.indexOf('GTD') - 1)
        }
        drawPieChart(text, database)
        await drawColumnChart(text, database)
    }
}

function drawPieChart(name, database) {
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
        for (const player of value) if (player.includes(name)) {
            player_team = player[4]
            switch (key) {
                case 'Isolation':
                    dataset[0][1] = player[10]
                    break
                case 'Transition':
                    dataset[1][1] = player[10]
                    break
                case 'PRBallHandler':
                    dataset[2][1] = player[10]
                    break
                case 'PRRollMan':
                    dataset[3][1] = player[10]
                    break
                case 'Postup':
                    dataset[4][1] = player[10]
                    break
                case 'Spotup':
                    dataset[5][1] = player[10]
                    break
                case 'Handoff':
                    dataset[6][1] = player[10]
                    break
                case 'Cut':
                    dataset[7][1] = player[10]
                    break
                case 'OffScreen':
                    dataset[8][1] = player[10]
                    break
                case 'OffRebound':
                    dataset[9][1] = player[10]
                    break
                case 'Misc':
                    dataset[10][1] = player[10]
                    break
            }
            break
        }
    }

    // find defending team
    let opponent
    for (const match of database.lineups) {
        const player_index = match.indexOf(name)
        if (player_index !== -1 && player_index < 5) {
            opponent = match[5]['home']
            break
        } else if (player_index !== -1 && player_index > 5) {
            opponent = match[5]['away']
            break
        }
    }

    // set variable slice colors
    const percentile = {}
    for (const [key, value] of Object.entries(database.play_types_defense)) {
        for (const team of value) if (team[2] === opponent) {
            if (team[6] > 0.5) {
                const p = 1 - (team[6] - 0.5) * 2
                percentile[key] = RGB_Linear_Shade(p, red)
            } else {
                const p = 1 - (team[6] * 2)
                percentile[key] = RGB_Linear_Shade(p, green)
            }
        }
    }

    const datatable = google.visualization.arrayToDataTable(dataset, true);
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
        chartArea: {width: '90%', height: '90%'},
    }

    const chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(datatable, options);
}

async function drawColumnChart(name, database) {
    let team
    for (const group of database['lineups']) {
        if (group.includes(name)) {
            const index = group.indexOf(name)
            if (index < 5) {
                team = group[5]['away']
            } else {
                team = group[5]['home']
            }
            break
        }
    }

    const styles = getComputedStyle(document.documentElement);
    const color = styles.getPropertyValue(`--${team.toLowerCase()}`);

    let dataset = []
    const index = database['stats']['assists'].findIndex(element => element.includes(name))
    const id = database['stats']['assists'][index][0]
    const response = await window.loaderAPI.makeRequest({
        url: window.loaderAPI.player_assists_endpoint('', '2024-25', id),
        method: 'GET',
        headers: window.loaderAPI.header,
    })
    for (const n of response['resultSets'][0]['rowSet']) {
        if (n[4] !== team || n[11] === 0) continue
        dataset.push([n[7], n[11]])
    }
    dataset.sort(function(a, b) {
        return a[1] - b[1];
    });

    const datatable = google.visualization.arrayToDataTable(dataset, true)
    const options = {
        chartArea: {width: '80%', height: '70%'},
        legend: 'none',
        colors: [color]
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('columnchart'));
    chart.draw(datatable, options)
}

window.loaderAPI.load((e, raw_table_data, raw_deadline_table_data, database) => {
    google.charts.load('current', {'packages':['table']});
    google.charts.load('current', {'packages':['corechart']});

    // create data grids
    const options = {
        showRowNumber: false,
        allowHtml: true,
        cssClassNames: {tableCell: 'tableCell', /*headerCell: 'headerCell'*/},
        sort: 'disable',
        width: '100%',
        height: '100%'
    }
    google.charts.setOnLoadCallback(function() { drawTable(raw_table_data, database, options, 'table1') });
    google.charts.setOnLoadCallback(function() { drawTable(raw_deadline_table_data, database, options, 'table2') });

    // show which table is currently displayed (season stats is displayed on default)
    const table_indicator = document.querySelector('#tableID')
    table_indicator.innerHTML = "Season stats"

    // add click event listener to table cells
    const table1 = document.getElementById('table1');
    const table2 = document.getElementById('table2');
    table1.addEventListener('click', async function(e) { await handleNameClick(e, database) })
    table2.addEventListener('click', async function(e) { await handleNameClick(e, database) })

    // button to switch tables
    const switch_button = document.getElementById('switch_button');
    switch_button.addEventListener('click', function(e) {
        const table1 = document.getElementById('table1');
        const table2 = document.getElementById('table2');
        const tableID = document.getElementById('tableID');

        if (table1.style.display === 'none') {
            const container = document.querySelector('#table2 .google-visualization-table > div');
            const scrollState = container.scrollTop

            table1.style.setProperty('display', 'block');
            table2.style.setProperty('display', 'none');
            tableID.innerHTML = "Season stats"

            const newContainer = document.querySelector('#table1 .google-visualization-table > div')
            newContainer.scrollTop = scrollState
        } else {
            const container = document.querySelector('#table1 .google-visualization-table > div');
            const scrollState = container.scrollTop

            table1.style.setProperty('display', 'none');
            table2.style.setProperty('display', 'block');
            tableID.innerHTML = "Post trade deadline stats"

            const newContainer = document.querySelector('#table2 .google-visualization-table > div')
            newContainer.scrollTop = scrollState
        }
    })

    //button to refresh tables
    const refresh_button = document.getElementById('refresh_button');
    refresh_button.addEventListener('click', async function(e) {
        database['lineups'] = await window.loaderAPI.fetch_lineups();
        drawTable(raw_table_data, database, options, 'table1')
        drawTable(raw_deadline_table_data, database, options, 'table2')
    })
})

/*
    // create custom header
    const thead = document.querySelector('.google-visualization-table-tr-head')
    const header_cells = thead.childNodes;
    const header = document.querySelector('#header');
    for (const node of header_cells) {
        const header_cell = document.createElement('div');
        if (!node.textContent.includes('-')) {
            header_cell.textContent = node.textContent;
        } else {
            const logo = document.createElement('img');
            logo.id = 'logo'
            logo.src = 'assets/nba.png'
            header_cell.id = 'logo_container';
            header_cell.appendChild(logo);
        }
        header_cell.style.width = node.getBoundingClientRect().width + 'px';
        header_cell.style.height = '20px';
        header.appendChild(header_cell);
    }
    */