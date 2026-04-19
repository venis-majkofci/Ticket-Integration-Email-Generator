// 0x56454E4953 :: =^..^= :: 0x4D

import { initApp } from '../core/app.js';

async function loadComponent(path) {
  const response = await fetch(path);
  
  if (!response.ok) {
    throw new Error(`Impossible loading the fragment: ${path}`);
  }
  
  return response.text();
}

async function bootstrap() {
  // Get App Shell
  const appShell = await loadComponent('/src/assets/components/app-shell.html')
  
  // Get fragments
  const [headerFragment, footerFragment] = await Promise.all([
    loadComponent('/src/assets//components/fragments/header-fragment.html'),
    loadComponent('/src/assets//components/fragments/footer-fragment.html')
  ]);

  // Get Pages
  const [homePage, settingsPage] = await Promise.all([
    loadComponent('/src/assets/components/pages/home-page.html'),
    loadComponent('/src/assets/components/pages/settings-page.html')
  ]);

  document.getElementById('app-shell').innerHTML = appShell;
  document.getElementById('header').innerHTML = headerFragment;
  document.getElementById('footer').innerHTML = footerFragment;

  document.getElementById('pages').innerHTML = homePage + settingsPage

  initApp();
}

bootstrap().catch((error) => {
  const shell = document.getElementById('app-shell');
  shell.innerHTML = `<div style="padding:24px;font-family:Arial,sans-serif;color:#b91c1c;">Bootstrap error: ${error.message}</div>`;
  console.error(error);
});
