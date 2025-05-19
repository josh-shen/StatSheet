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

function createScheduleBar(lineups) {
    const top_bar = document.getElementById('top_bar')

    lineups.forEach((game) => {
        let matchup_card

        if (game[5]['favorite'] === 'FINAL') {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], 'FINAL', '', '')
        } else if (game[5]['favorite'] === 'LIVE') {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], 'LIVE', '', '')
        } else {
            matchup_card = createMatchupCard(game[5]['away'], game[5]['home'], game[5]['start_time'], `${game[5]['favorite']} -${game[5]['spread']}`, `O/U${game[5]['total']}`)
        }

        matchup_card.setAttribute('style', `border-left: 5px solid var(--${game[5]['away'].toLowerCase()}-alternate); border-right: 5px solid var(--${game[5]['home'].toLowerCase()})`)

        top_bar.appendChild(matchup_card)
    })
}

function createMatchupCard(away, home, time, spread, total) {
    const matchup_card = document.createElement('div')
    matchup_card.classList.add('matchup_card')

    const away_div = document.createElement('div')
    away_div.classList.add('away')
    away_div.textContent = away

    const home_div = document.createElement('div')
    home_div.classList.add('home')
    home_div.textContent = home

    const time_div = document.createElement('div')
    time_div.classList.add('time')
    time_div.textContent = time

    const spread_div = document.createElement('div')
    spread_div.classList.add('spread')
    spread_div.textContent = spread

    const total_div = document.createElement('div')
    total_div.classList.add('total')
    total_div.textContent = total

    const col1 = document.createElement('div')
    col1.classList.add('col1')
    col1.appendChild(away_div)
    col1.appendChild(spread_div)

    const col2 = document.createElement('div')
    col2.classList.add('col2')
    col2.appendChild(home_div)
    col2.appendChild(total_div)

    matchup_card.appendChild(col1)
    matchup_card.appendChild(time_div)
    matchup_card.appendChild(col2)

    return matchup_card
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
            const r = j
            const color = RGB_Linear_Shade(data.getValue(r, c), mid, max, 1/(max-mid))
            data.setProperty(r, c, 'style', `background-color: ${color};`)
        }
    }

    // full stats colors
    for (let i = 0; i < rows; ++i) {
        // min/game 18 - 28 - 38
        color = RGB_Log_Blend(data.getValue(i, 4), 18, 28, 10, 0.1)
        data.setProperty(i, 4, 'style', `background-color: ${color};`)

        // fg% 0.34 - 0.44 - 0.54
        color = RGB_Log_Blend(data.getValue(i, 8), 0.34, 0.44, 0.1, 10)
        data.setProperty(i, 8, 'style', `background-color: ${color};`)

        // 3p% 0.23 - 0.33 - 0.43
        color = RGB_Log_Blend(data.getValue(i, 10), 0.23, 0.33, 0.1, 10)
        data.setProperty(i, 10, 'style', `background-color: ${color};`)

        // ft% 0.71 - 0.81 - 0.91
        color = RGB_Log_Blend(data.getValue(i, 12), 0.71, 0.81, 0.1, 10)
        data.setProperty(i, 12, 'style', `background-color: ${color};  min-width: 3%; max-width: 3%;`)

        // usg% 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 13) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 13, 'style', `background-color: ${color};`)

        // %pts 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 14) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 14, 'style', `background-color: ${color};`)

        // %reb 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 23) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 23, 'style', `background-color: ${color};`)

        // passes 20 - 40 - 60 (r, c=24)
        color = RGB_Log_Blend(data.getValue(i, 28), 20, 40, 20, 0.05)
        data.setProperty(i, 28, 'style', `background-color: ${color};`)

        // ast/pass 0.03 - 0.11 - 0.19
        color = RGB_Log_Blend(data.getValue(i, 29), 0.03, 0.11, 0.08, 12.5)
        data.setProperty(i, 29, 'style', `background-color: ${color};`)

        // %ast 0.1 - 0.2 - 0.3
        color = RGB_Log_Blend(data.getValue(i, 30) , 0.1, 0.2, 0.1, 10)
        data.setProperty(i, 30, 'style', `background-color: ${color};`)

        // cover -1 points
        if (data.getValue(i, 1) === -1) {
            data.setProperty(i, 1, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 2, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 3, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 1)) {
            // line points average difference
            color = RGB_Linear_Shade(data.getValue(i, 2) * -1, 0, 3, 0.33)
            data.setProperty(i, 2, 'style', `background-color: ${color};`)

            // line projected difference
            color = RGB_Linear_Shade(data.getValue(i, 3) * -1, 0, 3, 0.33)
            data.setProperty(i, 3, 'style', `background-color: ${color};`)
        }
        // cover -1 rebounds
        if (data.getValue(i, 15) === -1) {
            data.setProperty(i, 15, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 16, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 15)) {
            // line rebounds average difference
            color = RGB_Linear_Shade(data.getValue(i, 16) * -1, 0, 3, 0.33)
            data.setProperty(i, 16, 'style', `background-color: ${color};`)
        }
        // cover -1 assists
        if (data.getValue(i, 24) === -1) {
            data.setProperty(i, 24, 'style', `background-color: ${cover}; color: ${cover};`)
            data.setProperty(i, 25, 'style', `background-color: ${cover}; color: ${cover};`)
        } else if (data.getValue(i, 24)) {
            // line assists average difference
            color = RGB_Linear_Shade(data.getValue(i, 25) * -1, 0, 3, 0.33)
            data.setProperty(i, 25, 'style', `background-color: ${color};`)
        }
    }
}

function setWidths(data) {
    data.setProperty(0, 0, 'className', `name_cell header_xl`)
    for (const c of [1, 15, 20, 21, 22, 24, 27]) {
        data.setProperty(0, c, 'className', `header_l`)
    }
    for (const c of [2, 3, 4, 8, 10, 12, 13, 14, 16, 23, 25, 28, 29, 30]) {
        data.setProperty(0, c, 'className', `header_m`)
    }
    for (const c of [5, 6, 7, 9, 11, 17, 18, 19, 26]) {
        data.setProperty(0, c, 'className', `header_s`)
    }
}

function drawTable(data, database, options, table_id) {
    for (let i = 0; i < data.length / 12; i++) { // split data into slices for each game
        const data_slice = data.slice(i * 12, (i * 12) + 12)

        const datatable = new google.visualization.arrayToDataTable(data_slice);

        formatCells(i, datatable, database)
        setWidths(datatable)

        const table_div = document.createElement('div')
        table_div.classList.add(`t-${i}`)

        const table = new google.visualization.Table(table_div);
        table.draw(datatable, options);

        const table_container = document.getElementById(table_id);
        table_container.appendChild(table_div);

        // allow cell editing
        table_div.addEventListener('click', e => editCells(e, i))
    }
}

function addHeader(table_container){
    const header = document.getElementById('header')

    const name = document.createElement('div');
    name.classList.add('header_cell')
    name.classList.add('header_xl');
    name.textContent = 'NAME';
    header.appendChild(name);

    const points_line = document.createElement('div');
    points_line.classList.add('header_cell')
    points_line.setAttribute('style', 'min-width: 10%; max-width: 10%; width: 10%;');
    points_line.textContent = 'POINTS LINE';
    header.appendChild(points_line);

    const minutes = document.createElement('div');
    minutes.classList.add('header_cell')
    minutes.classList.add('header_m');
    minutes.textContent = 'MIN';
    header.appendChild(minutes);

    const points = document.createElement('div');
    points.classList.add('header_cell')
    points.classList.add('header_s');
    points.textContent = 'PTS';
    header.appendChild(points);

    const projected = document.createElement('div');
    projected.classList.add('header_cell')
    projected.classList.add('header_s');
    header.appendChild(projected);

    const fga = document.createElement('div');
    fga.classList.add('header_cell')
    fga.classList.add('header_s');
    fga.textContent = 'FGA';
    header.appendChild(fga);

    const fgp = document.createElement('div');
    fgp.classList.add('header_cell')
    fgp.classList.add('header_m');
    fgp.textContent = 'FG%';
    header.appendChild(fgp);

    const tpa = document.createElement('div');
    tpa.classList.add('header_cell')
    tpa.classList.add('header_s');
    tpa.textContent = '3PA';
    header.appendChild(tpa);

    const tpp = document.createElement('div');
    tpp.classList.add('header_cell')
    tpp.classList.add('header_m');
    tpp.textContent = '3P%';
    header.appendChild(tpp);

    const fta = document.createElement('div');
    fta.classList.add('header_cell')
    fta.classList.add('header_s');
    fta.textContent = 'FTA';
    header.appendChild(fta);

    const ftp = document.createElement('div');
    ftp.classList.add('header_cell')
    ftp.classList.add('header_m');
    ftp.textContent = 'FT%';
    header.appendChild(ftp);

    const team_points = document.createElement('div');
    team_points.classList.add('header_cell')
    team_points.classList.add('header_m');
    team_points.textContent = '%PTS';
    header.appendChild(team_points);

    const usage = document.createElement('div');
    usage.classList.add('header_cell')
    usage.classList.add('header_m');
    usage.textContent = 'USG%';
    header.appendChild(usage);

    const rebounds_line = document.createElement('div');
    rebounds_line.classList.add('header_cell')
    rebounds_line.setAttribute('style', 'min-width: 7%; max-width: 7%; width: 7%;');
    rebounds_line.textContent = 'REBOUNDS LINE';
    header.appendChild(rebounds_line);

    const o_reb = document.createElement('div');
    o_reb.classList.add('header_cell')
    o_reb.classList.add('header_s');
    o_reb.textContent = 'OREB';
    header.appendChild(o_reb);

    const d_reb = document.createElement('div');
    d_reb.classList.add('header_cell')
    d_reb.classList.add('header_s');
    d_reb.textContent = 'DREB';
    header.appendChild(d_reb);

    const rebounds = document.createElement('div');
    rebounds.classList.add('header_cell')
    rebounds.classList.add('header_s');
    rebounds.textContent = 'REB';
    header.appendChild(rebounds);

    const rebound_chances = document.createElement('div');
    rebound_chances.classList.add('header_cell')
    rebound_chances.classList.add('header_l');
    rebound_chances.textContent = 'CHANCES';
    header.appendChild(rebound_chances);

    const percent_reb_chances = document.createElement('div');
    percent_reb_chances.classList.add('header_cell')
    percent_reb_chances.classList.add('header_l');
    percent_reb_chances.textContent = 'CHANCES%';
    header.appendChild(percent_reb_chances);

    const contested = document.createElement('div');
    contested.classList.add('header_cell')
    contested.classList.add('header_l');
    contested.textContent = 'CONTESTED%';
    header.appendChild(contested);

    const team_rebounds = document.createElement('div');
    team_rebounds.classList.add('header_cell')
    team_rebounds.classList.add('header_m');
    team_rebounds.textContent = '%REB';
    header.appendChild(team_rebounds);

    const assists_line = document.createElement('div');
    assists_line.classList.add('header_cell')
    assists_line.setAttribute('style', 'min-width: 7%; max-width: 7%; width: 7%;');
    assists_line.textContent = 'ASSISTS LINE';
    header.appendChild(assists_line);

    const assists = document.createElement('div');
    assists.classList.add('header_cell')
    assists.classList.add('header_s');
    assists.textContent = 'AST';
    header.appendChild(assists);

    const potential_assists = document.createElement('div');
    potential_assists.classList.add('header_cell');
    potential_assists.classList.add('header_l');
    potential_assists.textContent = 'POTENTIALS';
    header.appendChild(potential_assists);

    const passes = document.createElement('div');
    passes.classList.add('header_cell');
    passes.classList.add('header_m');
    passes.textContent = 'PASSES';
    header.appendChild(passes);

    const assist_pass_ratio = document.createElement('div');
    assist_pass_ratio.classList.add('header_cell');
    assist_pass_ratio.classList.add('header_m');
    assist_pass_ratio.textContent = 'AST/PASS';
    header.appendChild(assist_pass_ratio);

    const team_assists = document.createElement('div');
    team_assists.classList.add('header_cell');
    team_assists.classList.add('header_m');
    team_assists.textContent = '%AST';
    header.appendChild(team_assists);

    table_container.appendChild(header);
}

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
    createScheduleBar(database['lineups'])

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
        cssClassNames: {tableCell: 'table_cell', headerCell: 'gtable_header'},
        sort: 'disable',
        width: '100%'
    }
    google.charts.setOnLoadCallback(function() { drawTable(raw_table_data, database, options, 'table1') });
    google.charts.setOnLoadCallback(function() { drawTable(raw_deadline_table_data, database, options, 'table2') });

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
        database['lineups'] = await window.loaderAPI.makeRequestAndParse({
            url: window.loaderAPI.lineups_endpoint,
            method: 'GET'
        })

        // remove matchup cards
        const matchup_cards = document.querySelectorAll('.matchup_card');
        matchup_cards.forEach(card => {
            card.remove()
        })

        // create new, refreshed schedule bar
        createScheduleBar(database['lineups'])

        // remove existing tables
        const tables = document.querySelectorAll('[class*="t-"]');
        tables.forEach(table => {
            table.remove()
        })

        // draw new, refreshed tables
        drawTable(raw_table_data, database, options, 'table1')
        drawTable(raw_deadline_table_data, database, options, 'table2')
    })

    // add custom header
    addHeader(table_container)

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