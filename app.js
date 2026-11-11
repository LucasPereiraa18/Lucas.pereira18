'use strict';

const filters = document.querySelector('.filters');
const projects = Array.from(document.querySelectorAll('.project[data-category]'));
const count = document.getElementById('project-count');

if (filters && count && projects.length) {
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    const selected = button.dataset.filter;
    for (const item of filters.querySelectorAll('button')) {
      item.setAttribute('aria-pressed', String(item === button));
    }
    let visible = 0;
    for (const project of projects) {
      project.hidden = selected !== 'todos' && project.dataset.category !== selected;
      if (!project.hidden) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'projeto' : 'projetos'}`;
  });
}
