const API_URL = 'https://jsonplaceholder.typicode.com/users';

const catalogEl = document.getElementById('catalog');
const summaryEl = document.getElementById('summary');
const searchEl = document.getElementById('search');
const statusEl = document.getElementById('status');

let stores = [];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('Service Worker registrado. Alcance:', reg.scope))
      .catch((err) => console.error('No se pudo registrar el Service Worker:', err));
  });
}

function updateStatus() {
  const online = navigator.onLine;
  statusEl.dataset.state = online ? 'online' : 'offline';
  statusEl.textContent = online ? 'En línea' : 'Sin conexión';
}

window.addEventListener('online', () => {
  updateStatus();
  loadStores(); 
});
window.addEventListener('offline', updateStatus);

async function loadStores() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Respuesta HTTP ' + response.status);

    const users = await response.json();

    stores = users.map((user) => ({
      id: user.id,
      name: user.company.name,
      slogan: user.company.catchPhrase,
      owner: user.name,
      city: user.address.city,
      email: user.email,
      website: user.website,
    }));

    searchEl.disabled = false;
    renderStores(stores);
  } catch (error) {
    console.error('Error al cargar el catálogo:', error);
    if (stores.length === 0) showError();
  }
}

function initials(text) {
  return text
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function createCard(store) {
  const card = document.createElement('article');
  card.className = 'card';

  const head = document.createElement('div');
  head.className = 'card-head';

  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = initials(store.name);

  const title = document.createElement('h3');
  title.textContent = store.name;

  head.append(avatar, title);

  const slogan = document.createElement('p');
  slogan.className = 'slogan';
  slogan.textContent = store.slogan;

  const owner = document.createElement('p');
  owner.className = 'meta';
  owner.innerHTML = '<strong>Dueño:</strong> ';
  owner.append(store.owner);

  const city = document.createElement('p');
  city.className = 'meta';
  city.innerHTML = '<strong>Ciudad:</strong> ';
  city.append(store.city);

  const mail = document.createElement('p');
  mail.className = 'meta';
  const link = document.createElement('a');
  link.href = 'mailto:' + store.email;
  link.textContent = store.email;
  mail.append(link);

  card.append(head, slogan, owner, city, mail);
  return card;
}

function renderStores(list) {
  catalogEl.replaceChildren();
  catalogEl.setAttribute('aria-busy', 'false');

  if (list.length === 0) {
    showMessage('Sin resultados', 'Prueba con otro nombre o ciudad.');
    summaryEl.textContent = '0 tiendas encontradas';
    return;
  }

  list.forEach((store) => catalogEl.appendChild(createCard(store)));
  summaryEl.textContent =
    list.length + (list.length === 1 ? ' tienda disponible' : ' tiendas disponibles');
}

function showMessage(title, text, withRetry = false) {
  catalogEl.replaceChildren();
  catalogEl.setAttribute('aria-busy', 'false');

  const box = document.createElement('div');
  box.className = 'message';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  const p = document.createElement('p');
  p.textContent = text;
  box.append(h3, p);

  if (withRetry) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.textContent = 'Reintentar';
    btn.addEventListener('click', () => {
      catalogEl.setAttribute('aria-busy', 'true');
      loadStores();
    });
    box.append(btn);
  }

  catalogEl.appendChild(box);
}

function showError() {
  summaryEl.textContent = 'No se pudo cargar el catálogo';
  showMessage(
    'Catálogo no disponible',
    'Aún no hay datos guardados. Conéctate a internet una vez para guardarlos.',
    true
  );
}

searchEl.addEventListener('input', () => {
  const term = searchEl.value.trim().toLowerCase();
  const filtered = stores.filter((s) =>
    [s.name, s.owner, s.city].some((field) => field.toLowerCase().includes(term))
  );
  renderStores(filtered);
});

updateStatus();
loadStores();
