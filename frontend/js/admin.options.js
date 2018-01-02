const GROUP_CLOSED_CLASS = 'closed';

function enableTogglers() {
  document.querySelectorAll('h4[data-toggle]').forEach((button) => {
    const contents = document.getElementById(button.dataset.toggle);
    button.addEventListener('click', () => {
      if (contents.style.display === 'none') {
        contents.style.display = 'block';
        button.classList.add(GROUP_CLOSED_CLASS);
      } else {
        contents.style.display = 'none';
        button.classList.remove(GROUP_CLOSED_CLASS);
      }
    });
  });
}

window.run = () => {
  enableTogglers();
};
