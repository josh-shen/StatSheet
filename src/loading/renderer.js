document.addEventListener('DOMContentLoaded', function() {
    const progress_counter = document.getElementById('progress')
    const progress_bar = document.getElementById('progress_bar')

    window.lloaderAPI.on_update_progress((value) => {
        const old_value = Number(progress_counter.textContent)
        const new_value = old_value + value
        progress_counter.textContent = new_value.toString()
        progress_bar.style.width = new_value / 53 * 100 + '%' // total of 53 fetches will be made
    })
})
