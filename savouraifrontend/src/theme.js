if (sessionStorage.getItem('theme') === 'dark'){
    const theme = document.getElementById('theme');
    theme.setAttribute('href', 'dark.css');
}