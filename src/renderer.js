const red = 'rgb(222, 101, 96)'
const yellow = 'rgb(253, 207, 84)'
const green = 'rgb(72, 176, 120)'
const cover = 'rgb(83, 83, 83)'
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
const RGB_Linear_Shade=(value, mid, high, scale)=>{
    // do not shade empty cells
    if (!value && value !== 0) return 'rgba(0,0,0,0)'

    let p, c0

    if (value > mid) {
        p = 1 - Math.min(high, (value - mid)) * scale
        c0 = green
    } else {
        p = 1 - Math.min(high, (mid - value)) * scale
        c0 = red
    }

    let i=parseInt,r=Math.round,[a,b,c,d]=c0.split(","),n=p<0,t=n?0:255*p,P=n?1+p:1-p;
    return"rgb"+(d?"a(":"(")+r(i(a[3]==="a"?a.slice(5):a.slice(4))*P+t)+","+r(i(b)*P+t)+","+r(i(c)*P+t)+(d?","+d:")");
}
const RGB_Log_Blend=(value, low, mid, floor, scale)=>{
    if (!value) {
        return 'rgba(0,0,0,0)'
    }
    let p, c0, c1
    if (value < mid) {
        p = Math.max(0, value - low) * scale
        c0 = red; c1 = yellow
    } else {
        p = Math.min(floor, value - mid) * scale
        c0 = yellow; c1 = green
    }

    let i=parseInt,r=Math.round,P=1-p,[a,b,c,d]=c0.split(","),[e,f,g,h]=c1.split(","),x=d||h,j=x?","+(!d?h:!h?d:r((parseFloat(d)*P+parseFloat(h)*p)*1000)/1000+")"):")";
    return"rgb"+(x?"a(":"(")+r((P*i(a[3]==="a"?a.slice(5):a.slice(4))**2+p*i(e[3]==="a"?e.slice(5):e.slice(4))**2)**0.5)+","+r((P*i(b)**2+p*i(f)**2)**0.5)+","+r((P*i(c)**2+p*i(g)**2)**0.5)+j;
}

let data_cache = {}

/* top bar */
function createScheduleBar(lineups) {
    const top_bar = document.getElementById('top_bar')

    lineups.forEach((game) => {
        let matchup_card

        if (game[5]['favorite'] === 'FINAL') {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], game[5]['date'], 'FINAL', '', '')
        } else if (game[5]['favorite'] === 'LIVE') {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], game[5]['date'], 'LIVE', '', '')
        } else {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], game[5]['date'], game[5]['start_time'], `${game[5]['favorite']} -${game[5]['spread']}`, `O/U${game[5]['total']}`)
        }

        //matchup_card.setAttribute('style', `border-left: 5px solid var(--${game[5]['away'].toLowerCase()}-alternate); border-right: 5px solid var(--${game[5]['home'].toLowerCase()})`)

        top_bar.appendChild(matchup_card)
    })
}

function createMatchupCard(away, home, date, time, spread, total) {
    const matchup_card = document.createElement('div')
    matchup_card.classList.add('matchup_card')

    // top row (betting lines, date)
    const spread_div = document.createElement('div')
    spread_div.classList.add('spread')
    spread_div.textContent = spread

    const spread_num = -Number(spread.split(" ")[1])
    if (spread_num <= 4) spread_div.style.color = green
    else if (spread_num > 4 && spread_num <= 7) spread_div.style.color = yellow
    else if (spread_num > 7 && spread_num <= 10) spread_div.style.color = RGB_Log_Blend(0.5, 0, 1, 0, 1)
    else if (spread_num > 10) spread_div.style.color = red

    const total_div = document.createElement('div')
    total_div.classList.add('total')
    total_div.textContent = total

    const date_div = document.createElement('div')
    date_div.classList.add('date')
    date_div.textContent = date

    const top_row = document.createElement('div')
    top_row.classList.add('top_row')
    top_row.appendChild(spread_div)
    top_row.appendChild(date_div)
    top_row.appendChild(total_div)

    // bottom row (teams, time)
    const away_div = document.createElement('div')
    away_div.classList.add('away')
    away_div.textContent = away

    const home_div = document.createElement('div')
    home_div.classList.add('home')
    home_div.textContent = home

    const time_div = document.createElement('div')
    time_div.classList.add('time')
    time_div.textContent = time

    const bottom_row = document.createElement('div')
    bottom_row.classList.add('bottom_row')
    bottom_row.appendChild(away_div)
    bottom_row.appendChild(time_div)
    bottom_row.appendChild(home_div)

    matchup_card.appendChild(top_row)
    matchup_card.appendChild(bottom_row)

    return matchup_card
}

/* table header */
function addHeader(table_container){
    const header = document.getElementById('header')

    header.appendChild(createHeaderCell('header_xl', 'NAME', null));
    header.appendChild(createHeaderCell('', 'POINTS LINE', 'min-width: 10%; max-width: 10%; width: 10%;'));
    header.appendChild(createHeaderCell('header_m', 'MIN', null));
    header.appendChild(createHeaderCell('header_s', 'PTS', null));
    header.appendChild(createHeaderCell('header_s', '', null));
    header.appendChild(createHeaderCell('header_s', 'FGA', null));
    header.appendChild(createHeaderCell('header_m', 'FG%', null));
    header.appendChild(createHeaderCell('header_s', '3PA', null));
    header.appendChild(createHeaderCell('header_m', '3P%', null));
    header.appendChild(createHeaderCell('header_s', 'FTA', null));
    header.appendChild(createHeaderCell('header_m', 'FT%', null));
    header.appendChild(createHeaderCell('header_m', '%PTS', null));
    header.appendChild(createHeaderCell('header_m', 'USG%', null));
    header.appendChild(createHeaderCell('', 'REBOUNDS LINE', 'min-width: 7%; max-width: 7%; width: 7%'));
    header.appendChild(createHeaderCell('header_s', 'OREB', null));
    header.appendChild(createHeaderCell('header_s', 'DREB', null));
    header.appendChild(createHeaderCell('header_s', 'REB', null));
    header.appendChild(createHeaderCell('header_l', 'CHANCES', null));
    header.appendChild(createHeaderCell('header_l', 'CHANCES%', null));
    header.appendChild(createHeaderCell('header_l', 'CONTESTED%', null));
    header.appendChild(createHeaderCell('header_m', '%REB'), null);
    header.appendChild(createHeaderCell('', 'ASSISTS LINE', 'min-width: 7%; max-width: 7%; width: 7%'));
    header.appendChild(createHeaderCell('header_s', 'AST', null));
    header.appendChild(createHeaderCell('header_l', 'POTENTIALS', null));
    header.appendChild(createHeaderCell('header_m', 'PASSES', null));
    header.appendChild(createHeaderCell('header_m', 'AST/PASS', null));
    header.appendChild(createHeaderCell('header_m', '%AST', null));

    table_container.appendChild(header);
}

function createHeaderCell(size, content, attributes) {
    const cell = document.createElement('div');
    cell.classList.add('header_cell');
    if (attributes) {
        cell.setAttribute('style', attributes);
    } else {
        cell.classList.add(size);
    }
    cell.textContent = content;

    return cell;
}

/* table */
function drawTable(data, database, options, table_id) {
    for (let i = 0; i < data.length / 12; i++) { // split data into slices for each game
        const data_slice = data.slice(i * 12, (i * 12) + 12)

        const datatable = new google.visualization.arrayToDataTable(data_slice);

        formatCells(i, datatable, database)

        const table_div = document.createElement('div')
        table_div.classList.add(`t-${i}`)
        table_div.dataset.game = `${database.lineups[i][5]['away']} @ ${database.lineups[i][5]['home']}`

        const table = new google.visualization.Table(table_div);
        table.draw(datatable, options);

        const table_container = document.getElementById(table_id);
        table_container.appendChild(table_div);

        // allow cell editing
        table_div.addEventListener('click', e => editCells(e, i))
    }
}

function formatCells(table_index, data, database) {
    const rows = data.getNumberOfRows()
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
        data.setProperty(r, 0, 'className', 'name_cell') // name click event listener identifier
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
            if (!data.getValue(j, 0)) continue

            const r = j
            const color = RGB_Linear_Shade(data.getValue(r, c), mid, max, 1/(max-mid))
            data.setProperty(r, c, 'style', `background-color: ${color}; !important`)
        }
    }

    // full stats colors
    for (let i = 0; i < rows; ++i) {
        if (!data.getValue(i, 0)) continue

        // min/game 18 - 28 - 38
        color = RGB_Log_Blend(data.getValue(i, 4), 18, 28, 10, 0.1)
        data.setProperty(i, 4, 'style', `background-color: ${color}; !important`)

        // fg% 0.34 - 0.44 - 0.54
        color = RGB_Log_Blend(data.getValue(i, 8), 0.34, 0.44, 0.1, 10)
        data.setProperty(i, 8, 'style', `background-color: ${color}; !important`)

        // 3p% 0.23 - 0.33 - 0.43
        color = RGB_Log_Blend(data.getValue(i, 10), 0.23, 0.33, 0.1, 10)
        data.setProperty(i, 10, 'style', `background-color: ${color}; !important`)

        // ft% 0.71 - 0.81 - 0.91
        color = RGB_Log_Blend(data.getValue(i, 12), 0.71, 0.81, 0.1, 10)
        data.setProperty(i, 12, 'style', `background-color: ${color};  min-width: 3%; max-width: 3%; !important`)

        // usg% 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 13) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 13, 'style', `background-color: ${color}; !important`)

        // %pts 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 14) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 14, 'style', `background-color: ${color}; !important`)

        // %reb 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 23) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 23, 'style', `background-color: ${color}; !important`)

        // passes 20 - 40 - 60 (r, c=24)
        color = RGB_Log_Blend(data.getValue(i, 28), 20, 40, 20, 0.05)
        data.setProperty(i, 28, 'style', `background-color: ${color}; !important`)

        // ast/pass 0.03 - 0.11 - 0.19
        color = RGB_Log_Blend(data.getValue(i, 29), 0.03, 0.11, 0.08, 12.5)
        data.setProperty(i, 29, 'style', `background-color: ${color}; !important`)

        // %ast 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 30) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 30, 'style', `background-color: ${color}; !important`)

        // cover -1 points
        if (data.getValue(i, 1) === -1) {
            data.setProperty(i, 1, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 2, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 3, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 1)) {
            // line points average difference
            color = RGB_Linear_Shade(data.getValue(i, 2) * -1, 0, 3, 0.33)
            data.setProperty(i, 2, 'style', `background-color: ${color}; !important`)

            // line projected difference
            color = RGB_Linear_Shade(data.getValue(i, 3) * -1, 0, 3, 0.33)
            data.setProperty(i, 3, 'style', `background-color: ${color}; !important`)
        }
        // cover -1 rebounds
        if (data.getValue(i, 15) === -1) {
            data.setProperty(i, 15, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 16, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 15)) {
            // line rebounds average difference
            color = RGB_Linear_Shade(data.getValue(i, 16) * -1, 0, 3, 0.33)
            data.setProperty(i, 16, 'style', `background-color: ${color}; !important`)
        }
        // cover -1 assists
        if (data.getValue(i, 24) === -1) {
            data.setProperty(i, 24, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 25, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 24)) {
            // line assists average difference
            color = RGB_Linear_Shade(data.getValue(i, 25) * -1, 0, 3, 0.33)
            data.setProperty(i, 25, 'style', `background-color: ${color}; !important`)
        }
    }
}

function setWidths(table_id) {
    const header_cells = document.querySelectorAll(`#${table_id} .gtable_header`);

    header_cells[0].classList.add('header_xl');
    for (const c of [1, 15, 20, 21, 22, 24, 27]) {
        header_cells[c].classList.add('header_l')
    }
    for (const c of [2, 3, 4, 8, 10, 12, 13, 14, 16, 23, 25, 28, 29, 30]) {
        header_cells[c].classList.add('header_m')
    }
    for (const c of [5, 6, 7, 9, 11, 17, 18, 19, 26]) {
        header_cells[c].classList.add('header_s')
    }
}

/* table cell editing */
function editCells(e, i) {
    const cell = e.target.closest('td')
    if (!cell) return

    const row = cell.parentElement;
    // allow cell editing only on player rows
    if (cell.cellIndex === 1 || cell.cellIndex === 15 || cell.cellIndex === 24) {
        if ((row.rowIndex - 6) % 6 !== 0) {
            cell.contentEditable = true
            // update projection values and formatting
            cell.addEventListener('blur', function(e) { updateTable(e, i, row.rowIndex, cell.cellIndex) })
        }
    }
}

function updateCell(sender, tbody, r, c) {
    const table_rows = tbody.childNodes;
    const table_columns = table_rows[r - 1].childNodes;
    let color
    if (c === 1) {
        table_columns[1].innerHTML = sender.target.innerHTML;
        table_columns[2].innerHTML = (sender.target.innerHTML - table_columns[5].innerHTML).toFixed(1);
        table_columns[3].innerHTML = (sender.target.innerHTML - table_columns[6].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[1].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
            table_columns[2].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
            table_columns[3].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
        } else {
            table_columns[1].setAttribute('style', 'background-color: rgb(255, 255, 255); color: rgb(0, 0, 0)');

            color = RGB_Linear_Shade(table_columns[2].innerHTML * -1, 0, 3, 0.33)
            table_columns[2].setAttribute('style', `background-color: ${color}; color: rgb(0, 0, 0)`);

            color = RGB_Linear_Shade(table_columns[3].innerHTML * -1, 0, 3, 0.33)
            table_columns[3].setAttribute('style', `background-color: ${color}; color: rgb(0, 0, 0)`);
        }
    } else if (c === 15) {
        table_columns[15].innerHTML = sender.target.innerHTML;
        table_columns[16].innerHTML = (sender.target.innerHTML - table_columns[19].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[15].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
            table_columns[16].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
        } else {
            table_columns[15].setAttribute('style', 'background-color: rgb(255, 255, 255); color: rgb(0, 0, 0)');

            color = RGB_Linear_Shade(table_columns[16].innerHTML * -1, 0, 3, 0.33)
            table_columns[16].setAttribute('style', `background-color: ${color}; color: rgb(0, 0, 0)`);
        }
    } else if (c === 24) {
        table_columns[24].innerHTML = sender.target.innerHTML;
        table_columns[25].innerHTML = (sender.target.innerHTML - table_columns[26].innerHTML).toFixed(1);

        if (sender.target.innerHTML === '-1') {
            table_columns[24].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
            table_columns[25].setAttribute('style', `background-color: ${cover}; color: ${cover}`);
        } else {
            table_columns[24].setAttribute('style', 'background-color: rgb(255, 255, 255); color: rgb(0, 0, 0)');

            color = RGB_Linear_Shade(table_columns[25].innerHTML * -1, 0, 3, 0.33)
            table_columns[25].setAttribute('style', `background-color: ${color}; color: rgb(0, 0, 0)`);
        }
    }
}

function updateTable(sender, i, r, c){
    const tbody1 = document.querySelector(`#table1 .t-${i} tbody`);
    const tbody2 = document.querySelector(`#table2 .t-${i} tbody`);

    // update cells in both tables
    updateCell(sender, tbody1, r, c)
    updateCell(sender, tbody2, r, c)
}

/* pie chart and column chart */
async function handleNameClick(e, database) {
    const target = e.target
    if (target.classList.contains('name_cell') && target.textContent) {
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
            date_from = window.loaderAPI.trade_deadline_date
        } else {
            date_from = ''
        }

        drawPieChart(text, database, 'pie_chart1')
        drawPieChart(text, database, 'pie_chart2')
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
    if (pie_id === 'pie_chart1') {
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
            percentile[key] = RGB_Linear_Shade(1 - team[6], 0.5, 1, 2)
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
    for (const group of database.lineups) {
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
    const index = database.stats.assists.findIndex(element => element.includes(name))
    const id = database.stats.assists[index][0]

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
        hAxis: {slantedText: false},
        legend: 'none',
        colors: [color]
    };

    const chart_container = document.getElementById('column_chart');
    const chart = new google.visualization.ColumnChart(chart_container);
    chart.draw(datatable, options)

    chart_container.className = 'drawn';
}

window.loaderAPI.load((e, raw_table_data, raw_deadline_table_data, database) => {
    // create schedule bar
    createScheduleBar(database.lineups)

    google.charts.load('current', {'packages':['table']});
    google.charts.load('current', {'packages':['corechart']});

    // create tables
    const options = {
        showRowNumber: false,
        allowHtml: true,
        cssClassNames: {tableCell: 'table_cell', headerCell: 'gtable_header'},
        sort: 'disable',
        width: '100%'
    }
    google.charts.setOnLoadCallback(function() { 
        drawTable(raw_table_data, database, options, 'table1') 
        
        // set column widths
        setWidths('table1')
    });
    google.charts.setOnLoadCallback(function() {
        drawTable(raw_deadline_table_data, database, options, 'table2')

        // set column widths
        setWidths('table2')
        
        // dropdown checkbox list to select tables
        const table_options = document.getElementById('dropdown_menu');
        const tables = document.querySelectorAll('[class*="t-"]');
        const added_options = []

        tables.forEach(table => {
            const game = table.dataset.game

            if (!added_options.includes(game)) {
                const option = document.createElement('div');
                option.className = 'dropdown_item'

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                checkbox.id = game;
                checkbox.addEventListener('change', () => {
                    const matching_tables = document.querySelectorAll(`[data-game="${game}"]`);
                    matching_tables.forEach(table => {
                        table.style.display = table.style.display === 'none' ? 'block' : 'none';
                    })
                })

                const label = document.createElement('label');
                label.textContent = game;

                option.appendChild(checkbox);
                option.appendChild(label);
                table_options.appendChild(option);

                added_options.push(game);
            }
        })

        // button to show dropdown menu
        const dropdown_button = document.getElementById('dropdown_button');
        dropdown_button.addEventListener('click', function() {
            table_options.style.display = table_options.style.display === 'none' ? 'block' : 'none';
            dropdown_button.classList.toggle('selected')
        });
    });

    const table1 = document.getElementById('table1');
    const table2 = document.getElementById('table2');

    // add click event listener to table cells
    table1.addEventListener('click', async function(e) { await handleNameClick(e, database) })
    table2.addEventListener('click', async function(e) { await handleNameClick(e, database) })

    // buttons to switch tables and column chart
    const full_season_button = document.getElementById('full_season');
    const trade_deadline_button = document.getElementById('post_trade_deadline');
    full_season_button.addEventListener('click', function() {
        if (table1.style.display === 'none') {
            full_season_button.classList.toggle('selected');
            trade_deadline_button.classList.toggle('selected');

            const player_name = document.getElementById('player_info');

            const table = document.querySelector('#table2 .google-visualization-table > div');
            const scrollState = table.scrollTop

            table1.style.setProperty('display', 'block');
            table2.style.setProperty('display', 'none');

            const new_table = document.querySelector('#table1 .google-visualization-table > div')
            new_table.scrollTop = scrollState

            const chart_container = document.getElementById('column_chart');
            if (chart_container.classList.contains('drawn')) {
                drawColumnChart(player_name.innerHTML, '', database).then()
            }
        }
    })
    trade_deadline_button.addEventListener('click', function() {
        if (table2.style.display === 'none') {
            full_season_button.classList.toggle('selected');
            trade_deadline_button.classList.toggle('selected');

            const player_name = document.getElementById('player_info');

            const table = document.querySelector('#table1 .google-visualization-table > div');
            const scrollState = table.scrollTop

            table1.style.setProperty('display', 'none');
            table2.style.setProperty('display', 'block');

            const new_table = document.querySelector('#table2 .google-visualization-table > div')
            new_table.scrollTop = scrollState

            const chart_container = document.getElementById('column_chart');
            if (chart_container.classList.contains('drawn')) {
                drawColumnChart(player_name.innerHTML, window.loaderAPI.trade_deadline_date, database).then()
            }
        }
    })

    // button to refresh tables
    const refresh_button = document.getElementById('refresh_button');
    refresh_button.addEventListener('click', async function() {
        const old_lineups = database.lineups

        database.lineups = await window.loaderAPI.makeRequestAndParse({
            url: window.loaderAPI.lineups_endpoint,
            method: 'GET'
        })

        // remove matchup cards
        const matchup_cards = document.querySelectorAll('.matchup_card');
        matchup_cards.forEach(card => {
            card.remove()
        })

        // create new, refreshed schedule bar
        createScheduleBar(database.lineups)

        // remove existing tables
        const tables = document.querySelectorAll('[class*="t-"]');
        tables.forEach(table => {
            table.remove()
        })

        // create new raw table data if lineups changed
        outer: for (let i = 0; i < database.lineups.length; i++) {
            for (let j = 0; j < database.lineups[i].length; j++) {
                if (typeof database.lineups[i][j] === 'object') continue
                if (old_lineups[i][j] !== database.lineups[i][j]) {
                    raw_table_data = await window.loaderAPI.create_new_table(database.lineups, database.stats, database.props)
                    raw_deadline_table_data = await window.loaderAPI.create_new_table(database.lineups, database.stats_after_deadline, database.props)
                    break outer
                }
            }
        }

        // draw new, refreshed tables
        drawTable(raw_table_data, database, options, 'table1')
        setWidths('table1')

        drawTable(raw_deadline_table_data, database, options, 'table2')
        setWidths('table2')
    })

    // add custom header
    const table_container = document.getElementById('table_container')
    addHeader(table_container)

    // chart container toggle button
    const toggle_button = document.getElementById('toggle_charts')
    const charts_container = document.getElementById('charts_container')
    toggle_button.addEventListener('click', function () {
        table_container.classList.toggle('expanded')
        charts_container.classList.toggle('expanded')
    })

    // button to switch pie chart
    const switch_pie_button = document.getElementById('switch_pie');
    switch_pie_button.innerHTML = "Regular Season"
    switch_pie_button.addEventListener('click', function() {
        const piechart1 = document.getElementById('pie_chart1');
        const piechart2 = document.getElementById('pie_chart2');

        if (piechart1.style.visibility === 'hidden') {
            piechart1.style.setProperty('visibility', 'visible');
            piechart2.style.setProperty('visibility', 'hidden');
            switch_pie_button.innerHTML = "Regular Season"
        } else {
            piechart1.style.setProperty('visibility', 'hidden');
            piechart2.style.setProperty('visibility', 'visible');
            switch_pie_button.innerHTML = "Playoffs"
        }
    })

    // resize charts on window resize
    addEventListener("resize", function() {
        const player_name = document.getElementById('player_info');
        if (player_name.innerHTML) {
            let pie_id, date_from

            const pie_chart = document.getElementById('pie_chart1');
            if (pie_chart.style.visibility === 'hidden') {
                pie_id = 'pie_chart2';
            } else {
                pie_id = 'pie_chart1';
            }

            const table = document.getElementById('table1');
            if (table.style.display === 'none') {
                date_from = window.loaderAPI.trade_deadline_date
            } else {
                date_from = ''
            }

            drawPieChart(player_name.innerHTML, database, pie_id)
            drawColumnChart(player_name.innerHTML, date_from, database).then()
        }
    })
})