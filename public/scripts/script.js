if(document.querySelector('.back')) {
    const buttonBack = document.querySelector('.back');
    buttonBack.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });
}
