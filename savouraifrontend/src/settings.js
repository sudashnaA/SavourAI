const slider = document.getElementById('checkbox');

if (sessionStorage.getItem('theme') !== 'light'){
    slider.checked = true;
}

slider.addEventListener('click', (e) => {
    const theme = document.getElementById('theme');
    if (slider.checked){
        theme.setAttribute('href', 'dark.css');
        sessionStorage.setItem('theme','dark');
    }
    else{
        theme.removeAttribute('href', 'dark.css');
        sessionStorage.setItem('theme','light');
    }
})