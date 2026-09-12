document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-stage]').forEach((section) => {
      section.hidden = filter !== 'all' && section.dataset.stage !== filter;
    });
  });
});
