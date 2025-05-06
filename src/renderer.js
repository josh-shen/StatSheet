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

let data_cache = {}

function create_schedule_bar(lineups) {
    const container = document.getElementById('top_bar')

    lineups.forEach((game) => {
        const matchup_card = document.createElement('div')
        matchup_card.classList.add('matchup-card')

        if (game[5]['favorite'] === 'LIVE') {
            const time = document.createElement('div')
            time.classList.add('time')
            time.textContent = 'Started'

            const teams = document.createElement('div')
            teams.classList.add('teams')
            teams.textContent = `${game[5]['away']} @ ${game[5]['home']}`

            matchup_card.appendChild(time)
            matchup_card.appendChild(teams)
        } else {
            const time = document.createElement('div')
            time.classList.add('time')
            time.textContent = game[5]['start_time']

            const teams = document.createElement('div')
            teams.classList.add('teams')
            teams.textContent = `${game[5]['away']} @ ${game[5]['home']}`

            const details = document.createElement('div')
            details.classList.add('details')
            details.textContent = `${game[5]['favorite']} -${game[5]['spread']} O/U${game[5]['total']}`

            matchup_card.appendChild(time)
            matchup_card.appendChild(teams)
            matchup_card.appendChild(details)
        }
        matchup_card.style.borderLeft = `5px solid var(--${game[5]['away'].toLowerCase()}-alternate)`
        matchup_card.style.borderRight = `5px solid var(--${game[5]['home'].toLowerCase()})`

        container.appendChild(matchup_card)
    })
}

function format_cells(table_index, data, database) {
    const r = data.getNumberOfRows()
    let color

    // team colors
    for (let j = 0; j < 11; j++) {
        const r = j
        let color
        if (j < 5) {
            color = `--${database.lineups[table_index][5]['away'].toLowerCase()}-alternate`
        } else if (j > 5) {
            color = `--${database.lineups[table_index][5]['home'].toLowerCase()}`
        }
        data.setProperty(r, 0, 'className', 'name_cell')
        data.setProperty(r, 0, 'style', `border-left: 4px solid var(${color}) !important`)
    }

    // injury indicator
    for (const obj of database.lineups[table_index][5]['injury']) {
        const key = Object.keys(obj)
        let val = obj[key[0]]
        const snip_start = val.indexOf("(") // remove (injury), (illness), etc. tags from description
        const snip_end = val.indexOf(")")
        if (snip_start !== -1 || snip_end !== -1) {
            val = val.slice(0, snip_start - 1) + val.slice(snip_end + 1);
        }
        const r = Number(key[0])
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
            const r = j

            if (!data.getValue(r, c)) continue

            min = Math.min(min, data.getValue(r, c))
            max = Math.max(max, data.getValue(r, c))
        }
        const mid = (max + min) / 2
        for (let j = 0; j < 11; j++) {
            const r = j
            const color = shade(data.getValue(r, c), mid, max, 1/(max-mid))
            data.setProperty(r, c, 'style', `background-color: ${color};`)
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

        // %ast 0.1 - 0.2 - 0.3
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
    for (let i = 0; i < data.length / 12; i++) {
        const data_slice = data.slice(i * 12, (i * 12) + 12)

        const datatable = new google.visualization.arrayToDataTable(data_slice);

        format_cells(i, datatable, database)

        const table_div = document.createElement('div')
        table_div.classList.add(`t-${i}`)

        const table = new google.visualization.Table(table_div);
        table.draw(datatable, options);

        const table_container = document.getElementById(table_id);
        table_container.appendChild(table_div);

        // allow cell editing
        table_div.addEventListener('click', e => edit_cells(e, i))
    }
}

function edit_cells(e, i) {
    const cell = e.target.closest('td')
    if (!cell) return

    const row = cell.parentElement;
    // allow cell editing only on player rows
    if (cell.cellIndex === 1 || cell.cellIndex === 15 || cell.cellIndex === 24) {
        if ((row.rowIndex - 6) % 6 !== 0) {
            cell.contentEditable = true
            // update projection values and formatting
            cell.addEventListener('blur', function(e) { update_table(e, i, row.rowIndex, cell.cellIndex) })
        }
    }
}

function update_cell(sender, tbody, r, c) {
    const table_rows = tbody.childNodes;
    const table_columns = table_rows[r - 1].childNodes;
    let color
    if (c === 1) {
        table_columns[1].innerHTML = sender.target.innerHTML;
        table_columns[2].innerHTML = (sender.target.innerHTML - table_columns[5].innerHTML).toFixed(1);
        table_columns[3].innerHTML = (sender.target.innerHTML - table_columns[6].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[1].style.backgroundColor = cover;
            table_columns[1].style.color = cover;

            table_columns[2].style.backgroundColor = cover;
            table_columns[2].style.color = cover;

            table_columns[3].style.backgroundColor = cover;
            table_columns[3].style.color = cover;
        } else {
            table_columns[1].style.backgroundColor = "rgb(255, 255, 255)";
            table_columns[1].style.color = "rgb(0, 0, 0)";

            color = shade(table_columns[2].innerHTML * -1, 0, 3, 0.33)
            table_columns[2].style.backgroundColor = color;
            table_columns[2].style.color = "rgb(0, 0, 0)";

            color = shade(table_columns[3].innerHTML * -1, 0, 3, 0.33)
            table_columns[3].style.backgroundColor = color;
            table_columns[3].style.color = "rgb(0, 0, 0)";
        }
    } else if (c === 15) {
        table_columns[15].innerHTML = sender.target.innerHTML;
        table_columns[16].innerHTML = (sender.target.innerHTML - table_columns[19].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[15].style.backgroundColor = cover;
            table_columns[15].style.color = cover;

            table_columns[16].style.backgroundColor = cover;
            table_columns[16].style.color = cover;
        } else {
            table_columns[15].style.backgroundColor = "rgb(255, 255, 255)";
            table_columns[15].style.color = "rgb(0, 0, 0)";

            color = shade(table_columns[16].innerHTML * -1, 0, 3, 0.33)
            table_columns[16].style.backgroundColor = color;
            table_columns[16].style.color = "rgb(0, 0, 0)";
        }
    } else if (c === 24) {
        table_columns[24].innerHTML = sender.target.innerHTML;
        table_columns[25].innerHTML = (sender.target.innerHTML - table_columns[26].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[24].style.backgroundColor = cover;
            table_columns[24].style.color = cover;

            table_columns[25].style.backgroundColor = cover;
            table_columns[25].style.color = cover;
        } else {
            table_columns[24].style.backgroundColor = "rgb(255, 255, 255)";
            table_columns[24].style.color = "rgb(0, 0, 0)";

            color = shade(table_columns[25].innerHTML * -1, 0, 3, 0.33)
            table_columns[25].style.backgroundColor = color;
            table_columns[25].style.color = "rgb(0, 0, 0)";
        }
    }
}

function update_table(sender, i, r, c){
    const tbody1 = document.querySelector(`#table1 .t-${i} tbody`);
    const tbody2 = document.querySelector(`#table2 .t-${i} tbody`);

    // update cells in both tables
    update_cell(sender, tbody1, r, c)
    update_cell(sender, tbody2, r, c)
}

async function handleNameClick(e, database) {
    const target = e.target
    if (target.classList.contains('name_cell')) {
        const table_container = document.getElementById('table_container')
        const charts_container = document.getElementById('charts_container')
        table_container.classList.add('expanded')
        charts_container.classList.add('expanded')

        let text = target.textContent
        if (text.includes('GTD')) {
            text = text.substring(0, text.indexOf('GTD') - 1)
        }

        const player_div = document.getElementById('player_info');
        player_div.innerHTML = text;

        // determine which set of stats to fetch for column chart
        const table = document.getElementById('table1');
        let date_from
        if (table.style.display === 'none') {
            date_from = '2/6/2025'
        } else {
            date_from = ''
        }

        drawPieChart(text, database, 'piechart1')
        drawPieChart(text, database, 'piechart2')
        await drawColumnChart(text, date_from, database)
    }
}

function drawPieChart(name, database, pie_id) {
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
    let data
    if (pie_id === 'piechart1') {
        data = database.play_types
    } else {
        data = database.play_types_playoffs
    }
    for (const [key, value] of Object.entries(data)) {
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
        width: '100%',
        height: '100%',
        chartArea: {width: '90%', height: '90%'},
    }

    const chart = new google.visualization.PieChart(document.getElementById(pie_id));
    chart.draw(datatable, options);
}

async function drawColumnChart(name, date_from, database) {
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

    // check cache if data already exists before fetching
    if (name in data_cache && date_from in data_cache[name]) {
        dataset = data_cache[name][date_from]
    } else {
        const response = await window.loaderAPI.makeRequest({
            url: window.loaderAPI.player_ast_endpoint(date_from, '2024-25', id),
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

        // get only top 9 results
        dataset = dataset.slice(-9)

        // change names from last, first to first last
        dataset.forEach((player) => {
            let name = player[0].split(',')
            player[0] = `${name[1]} ${name[0]}`
        })

        // add dataset for player to cache
        if (!data_cache[name]) {
            data_cache[name] = {[date_from]: dataset};
        } else {
            data_cache[name][date_from] = dataset;
        }
    }

    const datatable = google.visualization.arrayToDataTable(dataset, true)
    const options = {
        width: '100%',
        height: '100%',
        chartArea: {width: '80%', height: '70%'},
        legend: 'none',
        colors: [color]
    };

    const chart_container = document.getElementById('columnchart');
    const chart = new google.visualization.ColumnChart(chart_container);
    chart.draw(datatable, options)

    chart_container.className = 'drawn';
}

window.loaderAPI.load((e, raw_table_data, raw_deadline_table_data, database) => {
    // create schedule bar
    create_schedule_bar(database['lineups'])

    // chart container toggle button
    const toggle_button = document.getElementById('toggle_charts')
    const table_container = document.getElementById('table_container')
    const charts_container = document.getElementById('charts_container')
    toggle_button.addEventListener('click', function () {
        table_container.classList.toggle('expanded')
        charts_container.classList.toggle('expanded')
    })

    google.charts.load('current', {'packages':['table']});
    google.charts.load('current', {'packages':['corechart']});

    // create data grids
    const options = {
        showRowNumber: false,
        allowHtml: true,
        cssClassNames: {tableCell: 'tableCell', /*headerCell: 'headerCell'*/},
        sort: 'disable',
        width: '100%',
        //height: '100%'
    }
    google.charts.setOnLoadCallback(function() { drawTable(raw_table_data, database, options, 'table1') });
    google.charts.setOnLoadCallback(function() { drawTable(raw_deadline_table_data, database, options, 'table2') });

    // add click event listener to table cells
    const table1 = document.getElementById('table1');
    const table2 = document.getElementById('table2');
    table1.addEventListener('click', async function(e) { await handleNameClick(e, database) })
    table2.addEventListener('click', async function(e) { await handleNameClick(e, database) })

    // button to switch tables and column chart
    const switch_table = document.getElementById('switch_table');
    switch_table.innerHTML = "Full Season stats" // season stats are displayed by default
    switch_table.addEventListener('click', function() {
        const table1 = document.getElementById('table1');
        const table2 = document.getElementById('table2');
        const player_name = document.getElementById('player_info');

        if (table1.style.display === 'none') {
            const container = document.querySelector('#table2 .google-visualization-table > div');
            const scrollState = container.scrollTop

            table1.style.setProperty('display', 'block');
            table2.style.setProperty('display', 'none');
            switch_table.innerHTML = "Season stats"

            const newContainer = document.querySelector('#table1 .google-visualization-table > div')
            newContainer.scrollTop = scrollState

            const chart_container = document.getElementById('columnchart');
            if (chart_container.classList.contains('drawn')) {
                drawColumnChart(player_name.innerHTML, '', database).then()
            }

        } else {
            const container = document.querySelector('#table1 .google-visualization-table > div');
            const scrollState = container.scrollTop

            table1.style.setProperty('display', 'none');
            table2.style.setProperty('display', 'block');
            switch_table.innerHTML = "Post trade deadline stats"

            const newContainer = document.querySelector('#table2 .google-visualization-table > div')
            newContainer.scrollTop = scrollState

            const chart_container = document.getElementById('columnchart');
            if (chart_container.classList.contains('drawn')) {
                drawColumnChart(player_name.innerHTML, '2/6/2025', database).then()
            }
        }
    })

    // button to refresh tables
    const refresh_button = document.getElementById('refresh_button');
    refresh_button.addEventListener('click', async function() {
        database['lineups'] = await window.loaderAPI.makeRequestAndParse({
            url: window.loaderAPI.lineups_endpoint,
            method: 'GET'
        })

        // remove existing tables
        const elements = document.querySelectorAll('[class*="t-"]');
        elements.forEach(element => {
            element.remove()
        })

        // draw new, refreshed tables
        drawTable(raw_table_data, database, options, 'table1')
        drawTable(raw_deadline_table_data, database, options, 'table2')
    })

    // button to switch pie chart
    const switch_pie = document.getElementById('switch_pie');
    switch_pie.innerHTML = "Regular Season"
    switch_pie.addEventListener('click', function() {
        const piechart1 = document.getElementById('piechart1');
        const piechart2 = document.getElementById('piechart2');

        if (piechart1.style.visibility === 'hidden') {
            piechart1.style.setProperty('visibility', 'visible');
            piechart2.style.setProperty('visibility', 'hidden');
            switch_pie.innerHTML = "Regular Season"
        } else {
            piechart1.style.setProperty('visibility', 'hidden');
            piechart2.style.setProperty('visibility', 'visible');
            switch_pie.innerHTML = "Playoffs"
        }
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