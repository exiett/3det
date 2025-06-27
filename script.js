// --- Estado Global ---
let periciasData = {};
let vantagensData = {};
let desvantagensData = {};
let tecnicasData = {};
let kitsData = [];
let playerData = [];
let bestiaryData = [];
let npcData = [];
let sessionData = {};
let campaignData = [];


// --- FUNÇÕES DE BUSCA DE DADOS (DATA FETCHING) ---

// Função genérica para buscar dados de arquivos JSON locais
async function fetchLocalData(fileName) {
  try {
    const response = await fetch(`data/${fileName}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Dados carregados de ${fileName}.json:`, data);
    return data;
  } catch (error) {
    console.error(`Erro ao carregar ${fileName}.json:`, error);
    return [];
  }
}

// Função para buscar personagens, npcs ou monstros
async function fetchCharacterData(characterType) {
  try {
    const data = await fetchLocalData(characterType);
    
    // Processa os dados para o formato esperado pela aplicação
    return data.map(char => {
      return {
        ...char,
        id: char.name, // Usa o nome como ID para compatibilidade
        pericias: char.pericias || [],
        vantagens: char.vantagens || [],
        desvantagens: char.desvantagens || [],
        tecnicas: char.tecnicas || [],
        stats: char.stats || {
          "Poder": 0,
          "Habilidade": 0,
          "Resistência": 0,
          "Pontos de Ação": 0,
          "Pontos de Mana": 0,
          "Pontos de Vida": 0
        }
      };
    });
  } catch (error) {
    console.error(`Erro ao processar dados de ${characterType}:`, error);
    return [];
  }
}

// Função para buscar os dados de sessão
async function fetchSessionDetails() {
  try {
    const data = await fetchLocalData('sessao');
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados da sessão:', error);
    return null;
  }
}

async function fetchAllData() {
  console.log("Iniciando busca de todos os dados locais...");

  const [
    periciasRes,
    vantagensRes,
    desvantagensRes,
    tecnicasRes,
    personagensRes,
    npcsRes,
    bestiarioRes,
    sessionRes
  ] = await Promise.all([
    fetchLocalData('pericias'),
    fetchLocalData('vantagens'),
    fetchLocalData('desvantagens'),
    fetchLocalData('tecnicas'),
    fetchCharacterData('personagens'),
    fetchCharacterData('npcs'),
    fetchCharacterData('bestiario'),
    fetchSessionDetails()
  ]);

  const arrayToObject = (arr) => arr.reduce((acc, item) => { acc[item.name] = item; return acc; }, {});

  if (periciasRes) periciasData = arrayToObject(periciasRes);
  if (vantagensRes) {
    vantagensData = arrayToObject(vantagensRes);
    kitsData = vantagensRes.filter(v => v.name.toLowerCase().startsWith('kit:'));
  }
  if (desvantagensRes) desvantagensData = arrayToObject(desvantagensRes);
  if (tecnicasRes) tecnicasData = arrayToObject(tecnicasRes);

  if (personagensRes) playerData = personagensRes;
  if (bestiarioRes) bestiaryData = bestiarioRes;
  if (npcsRes) npcData = npcsRes;
  if (sessionRes) sessionData = sessionRes;

  loadRules(periciasRes, vantagensRes, desvantagensRes, tecnicasRes, kitsData);
  populatePlayerList();
  populateNpcList();
  populateBestiaryList();
  displaySessionData();
}


// --- FUNÇÕES DE UI E RENDERIZAÇÃO ---

function showSection(targetId) {
  document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
  const sectionToShow = document.getElementById(targetId);
  if (sectionToShow) sectionToShow.classList.add('active');
  const buttonToActivate = document.querySelector(`[data-target="${targetId}"]`);
  if (buttonToActivate) buttonToActivate.classList.add('active');
}

function createAbilitySpan(abilityName, abilityDesc) {
  const desc = (abilityDesc || 'Sem descrição.').replace(/"/g, '&quot;');
  return `<span class="ability-tag" data-tooltip="${desc}">${abilityName}</span>`;
}

function displayCharacter(characterId, characterType) {
  let character;
  let detailsContainer;
  let listId;

  if (characterType === 'player') {
    character = playerData.find(p => p.id === characterId);
    detailsContainer = document.getElementById('player-details');
    listId = '#player-list';
  } else if (characterType === 'npc') {
    character = npcData.find(n => n.id === characterId);
    detailsContainer = document.getElementById('npc-details');
    listId = '#npc-list';
  } else { // bestiary
    character = bestiaryData.find(b => b.id === characterId);
    detailsContainer = document.getElementById('bestiary-details');
    listId = '#bestiary-list';
  }

  if (!character) {
    detailsContainer.innerHTML = `<p class="text-center text-error">Personagem não encontrado.</p>`;
    return;
  }

  // Helper to normalize arrays of strings or objects
  function normalizeAbilityList(items, dataDict) {
    if (!items || items.length === 0) return [];
    return items.map(item => {
      if (typeof item === 'string') {
        // Try to find the object in the dataDict by name
        const obj = dataDict && dataDict[item] ? dataDict[item] : (dataDict && dataDict[item.split(' (')[0]] ? dataDict[item.split(' (')[0]] : null);
        return obj ? { name: item, description: obj.desc || obj.description || '' } : { name: item, description: '' };
      } else if (item && typeof item === 'object') {
        return item;
      } else {
        return { name: String(item), description: '' };
      }
    });
  }

  let periciasList, vantagensList, desvantagensList, tecnicasList;
  if (characterType === 'bestiary' || characterType === 'player' || characterType === 'npc') {
    periciasList = normalizeAbilityList(character.pericias, periciasData);
    vantagensList = normalizeAbilityList(character.vantagens, vantagensData);
    desvantagensList = normalizeAbilityList(character.desvantagens, desvantagensData);
    tecnicasList = normalizeAbilityList(character.tecnicas, tecnicasData);
  } else {
    periciasList = character.pericias;
    vantagensList = character.vantagens;
    desvantagensList = character.desvantagens;
    tecnicasList = character.tecnicas;
  }

  const createListHtml = (items) => {
    if (!items || items.length === 0) return "Nenhuma";
    return items.map(item => createAbilitySpan(item.name, item.description || item.desc)).join(', ');
  };

  let periciasHtml = createListHtml(periciasList);
  let vantagensHtml = createListHtml(vantagensList);
  let tecnicasHtml = createListHtml(tecnicasList);
  let desvantagensHtml = createListHtml(desvantagensList);

  const iconMap = { "Poder": "fa-hand-fist", "Habilidade": "fa-brain", "Resistência": "fa-shield-halved", "Pontos de Vida": "fa-heart-pulse", "Pontos de Mana": "fa-wand-magic-sparkles", "Pontos de Ação": "fa-bolt" };
  const stats = character.stats;
  const statsCardsHtml = Object.entries(stats).map(([statName, statValue]) => {
    const iconClass = iconMap[statName] || 'fa-question-circle';
    return `<div class="info-card p-3 rounded-lg flex items-center gap-x-3 shadow-sm"><i class="fa-solid ${iconClass} fa-fw fa-2x text-accent"></i><div><span class="block text-sm text-secondary">${statName}</span><span class="block text-xl font-bold text-primary">${statValue || 0}</span></div></div>`;
  }).join('');

  detailsContainer.innerHTML = `<div class="flex flex-col sm:flex-row gap-6 items-start"><div class="flex-shrink-0 w-full sm:w-48"><img src="${character.image ? `img/${character.image}` : ''}" alt="Retrato de ${character.name}" class="placeholder-img w-full h-auto object-cover rounded-lg shadow-lg" onerror="this.onerror=null; this.src='https://placehold.co/400x400/e2e8f0/475569?text=${character.name.charAt(0)}';"></div><div class="flex-grow"><h3 class="text-2xl font-bold text-accent">${character.name}</h3><p class="text-md text-secondary italic mb-2">${character.concept}</p><p class="text-sm text-secondary mb-4">${character.archetype} • ${character.pontos} pontos</p><div class="mb-4"><h4 class="font-bold mb-1 flex items-center gap-x-2"><i class="fa-solid fa-list-ol fa-fw text-slate-500"></i><span>Atributos</span></h4><div class="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mt-2">${statsCardsHtml}</div></div><div class="mb-4"><h4 class="font-bold mb-1 flex items-center gap-x-2"><i class="fa-solid fa-graduation-cap fa-fw text-slate-500"></i><span>Perícias</span></h4><p>${periciasHtml}</p></div><div class="mb-4"><h4 class="font-bold mb-1 flex items-center gap-x-2"><i class="fa-solid fa-thumbs-up fa-fw text-green-600"></i><span>Vantagens</span></h4><p>${vantagensHtml}</p></div>${tecnicasHtml !== "Nenhuma" ? `<div class="mb-4"><h4 class="font-bold mb-1 flex items-center gap-x-2"><i class="fa-solid fa-wand-sparkles fa-fw text-blue-500"></i><span>Técnicas</span></h4><p>${tecnicasHtml}</p></div>` : ''}<div><h4 class="font-bold mb-1 flex items-center gap-x-2"><i class="fa-solid fa-thumbs-down fa-fw text-red-600"></i><span>Desvantagens</span></h4><p>${desvantagensHtml}</p></div></div></div>`;

  document.querySelectorAll(`${listId} .list-item`).forEach(item => item.classList.remove('active'));
  const activeListItem = document.querySelector(`${listId} .list-item[data-id="${character.id}"]`);
  if (activeListItem) activeListItem.classList.add('active');
}


function populateList(listId, data, icon, characterType, onClickHandler) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  data.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    li.className = 'list-item p-2 rounded-md cursor-pointer flex items-center gap-x-2';
    li.innerHTML = `<i class="fa-solid ${icon} fa-fw text-slate-500"></i><span>${item.name}</span>`;
    if (typeof onClickHandler === 'function') {
      li.onclick = () => onClickHandler(item.id, characterType);
    } else {
      console.error('Error: onClickHandler is not a function. Check populateList calls.');
    }
    list.appendChild(li);
  });
}

function populatePlayerList() {
  populateList('player-list', playerData, 'fa-user', 'player', displayCharacter);
}

function populateNpcList() {
  populateList('npc-list', npcData, 'fa-address-book', 'npc', displayCharacter);
}

function populateBestiaryList() {
  populateList('bestiary-list', bestiaryData, 'fa-dragon', 'bestiary', displayCharacter);
}

function loadRules(pericias, vantagens, desvantagens, tecnicas, kits) {
  console.log('loadRules called with:', { pericias, vantagens, desvantagens, tecnicas, kits });
  
  const regrasNav = document.getElementById('regras-nav');
  const regrasContent = document.getElementById('regras-content');
  const searchInput = document.getElementById('regras-search-input');
  const searchResultsContainer = document.getElementById('regras-search-results');

  if (!regrasNav) {
    console.error('regras-nav element not found');
    return;
  }

  const ruleCategories = {
    'Perícias': { data: pericias, icon: 'fa-graduation-cap', color: 'text-slate-500' },
    'Vantagens': { data: vantagens.filter(v => !v.name.toLowerCase().startsWith('kit:')), icon: 'fa-thumbs-up', color: 'text-green-600' },
    'Kits': { data: kits, icon: 'fa-box-archive', color: 'text-purple-600' },
    'Desvantagens': { data: desvantagens, icon: 'fa-thumbs-down', color: 'text-red-600' },
    'Técnicas': { data: tecnicas, icon: 'fa-wand-sparkles', color: 'text-blue-500' }
  };

  console.log('Rule categories:', ruleCategories);

  const allRules = [];
  for (const categoryName in ruleCategories) {
    const category = ruleCategories[categoryName];
    if (category.data) {
      category.data.forEach(item => {
        allRules.push({ ...item, categoryName: categoryName, icon: category.icon, color: category.color });
      });
    }
  }

  console.log('All rules:', allRules);

  const generateRuleListHtml = (items) => {
    if (!items || items.length === 0) return '<p class="text-secondary text-center mt-4">Nenhum resultado encontrado.</p>';
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items.map(item => {
      const description = (item.description || item.desc || '').replace(/\n/g, '<br>');
      let detailsHtml;
      if (item.categoryName === 'Técnicas') {
        detailsHtml = `<dd class="text-base text-secondary mt-1 pl-8 leading-relaxed">${description}</dd><dd class="text-sm text-secondary mt-3 pl-8 leading-relaxed space-y-2">${item.requirements ? `<p><i class="fa-solid fa-check-double fa-fw text-slate-500"></i> <strong>Requisitos:</strong> ${item.requirements}</p>` : ''}${item.cost ? `<p><i class="fa-solid fa-fire-flame-curved fa-fw text-blue-500"></i> <strong>Custo:</strong> ${item.cost}</p>` : ''}${item.duration ? `<p><i class="fa-solid fa-hourglass-half fa-fw text-slate-500"></i> <strong>Duração:</strong> ${item.duration}</p>` : ''}</dd>`;
      } else {
        detailsHtml = `<dd class="text-base text-secondary mt-1 pl-8 leading-relaxed">${description}</dd>`;
      }
      return `<div class="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0"><dt class="font-bold text-lg text-primary flex items-center gap-x-3"><i class="fa-solid ${item.icon} fa-fw ${item.color} text-xl"></i><span>${item.name} ${item.cost && item.categoryName !== 'Técnicas' ? `(${item.cost})` : ''}</span></dt>${detailsHtml}</div>`;
    }).join('');
  };

  regrasNav.innerHTML = '';
  regrasContent.innerHTML = '';
  for (const categoryName in ruleCategories) {
    const category = ruleCategories[categoryName];
    if (!category.data || category.data.length === 0) continue;

    const button = document.createElement('button');
    button.className = 'nav-btn px-4 py-2 rounded-lg text-sm flex items-center gap-x-2';
    button.dataset.target = `regras-${categoryName.toLowerCase().replace(/ /g, '-')}`;
    button.innerHTML = `<i class="fa-solid ${category.icon} fa-fw ${category.color}"></i> <span>${categoryName}</span>`;
    regrasNav.appendChild(button);

    const contentDiv = document.createElement('div');
    contentDiv.id = `regras-${categoryName.toLowerCase().replace(/ /g, '-')}`;
    contentDiv.className = 'rule-content hidden mt-6';

    const categoryItems = allRules.filter(rule => rule.categoryName === categoryName);
    contentDiv.innerHTML = `<dl>${generateRuleListHtml(categoryItems)}</dl>`;
    regrasContent.appendChild(contentDiv);
  }

  regrasNav.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
      regrasContent.querySelectorAll('.rule-content').forEach(div => div.classList.add('hidden'));
      regrasNav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      const targetId = button.dataset.target;
      const contentToShow = document.getElementById(targetId);
      if (contentToShow) {
        contentToShow.classList.remove('hidden');
        contentToShow.style.animation = 'fadeIn 0.5s ease-in-out';
      }
      button.classList.add('active');
    }
  });

  const firstButton = regrasNav.querySelector('button');
  if (firstButton) { firstButton.click(); }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query) {
      regrasNav.classList.add('hidden');
      regrasContent.classList.add('hidden');
      searchResultsContainer.classList.remove('hidden');
      const filteredRules = allRules.filter(rule => 
        rule.name.toLowerCase().includes(query) || 
        (rule.description && rule.description.toLowerCase().includes(query)) ||
        (rule.desc && rule.desc.toLowerCase().includes(query))
      );
      searchResultsContainer.innerHTML = generateRuleListHtml(filteredRules);
    } else {
      regrasNav.classList.remove('hidden');
      regrasContent.classList.remove('hidden');
      searchResultsContainer.classList.add('hidden');
      const activeButton = regrasNav.querySelector('button.active') || regrasNav.querySelector('button');
      if (activeButton) activeButton.click();
    }
  });
}

function displaySessionData() {
  const container = document.getElementById('session-content');
  if (!container) return;

  if (!sessionData) {
    container.innerHTML = '<p class="text-center text-error">Dados da sessão não encontrados.</p>';
    return;
  }

  const createCard = (title, icon, content) => {
    return `<div class="info-card p-6 rounded-lg shadow"><h2 class="text-xl font-bold mb-4 text-accent flex items-center gap-x-2"><i class="fa-solid ${icon} fa-fw"></i><span>${title}</span></h2>${content}</div>`;
  };

  const listFromArray = (items, key) => {
    if (!items || items.length === 0) return '<p class="text-secondary">Nenhum item encontrado.</p>';
    return `<ul class="list-disc list-inside space-y-1">${items.map(item => `<li>${item[key] || item}</li>`).join('')}</ul>`;
  };

  let html = '';

  // Começo Forte
  if (sessionData.comecoForte) {
    html += createCard('Começo Forte', 'fa-wand-sparkles', `<p class="text-secondary">${sessionData.comecoForte}</p>`);
  }

  // Ganchos dos Personagens
  if (sessionData.ganchosPersonagens && sessionData.ganchosPersonagens.length > 0) {
    html += createCard('Ganchos dos Personagens', 'fa-link', listFromArray(sessionData.ganchosPersonagens, 'description'));
  }

  // Objetivos da Sessão
  if (sessionData.objetivosSessao) {
    const objetivosHtml = `
      <div class="mb-4">
        <h4 class="font-bold mb-2">Objetivo Principal:</h4>
        <p class="text-secondary">${sessionData.objetivosSessao.principal}</p>
      </div>
      ${sessionData.objetivosSessao.secundarios && sessionData.objetivosSessao.secundarios.length > 0 ? `
        <div>
          <h4 class="font-bold mb-2">Objetivos Secundários:</h4>
          ${listFromArray(sessionData.objetivosSessao.secundarios, 'description')}
        </div>
      ` : ''}
    `;
    html += createCard('Objetivos da Sessão', 'fa-bullseye', objetivosHtml);
  }

  // Segredos e Rumores
  if (sessionData.segredosRumores && sessionData.segredosRumores.length > 0) {
    html += createCard('Segredos e Rumores', 'fa-mask', listFromArray(sessionData.segredosRumores, 'description'));
  }

  // Tesouros e Recompensas
  if (sessionData.tesourosRecompensas && sessionData.tesourosRecompensas.length > 0) {
    const tesourosHtml = sessionData.tesourosRecompensas.map(item => 
      `<div class="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h4 class="font-bold text-amber-800 dark:text-amber-200">${item.name || 'Tesouro'}</h4>
        <p class="text-sm text-amber-700 dark:text-amber-300">${item.description || item.desc || 'Sem descrição'}</p>
      </div>`
    ).join('');
    html += createCard('Tesouros e Recompensas', 'fa-gem', tesourosHtml);
  }

  // Locais Interessantes
  if (sessionData.locaisInteressantes && sessionData.locaisInteressantes.length > 0) {
    const locaisHtml = sessionData.locaisInteressantes.map(local => {
      const caracteristicas = local.caracteristicas && local.caracteristicas.length > 0 
        ? `<ul class="list-disc list-inside mt-2 text-sm text-secondary">${local.caracteristicas.map(c => `<li>${c}</li>`).join('')}</ul>`
        : '';
      return `<div class="mb-3"><h4 class="font-bold">${local.nome}</h4>${caracteristicas}</div>`;
    }).join('');
    html += createCard('Locais Interessantes', 'fa-map-location-dot', locaisHtml);
  }

  // Encontros e Desafios
  if (sessionData.encontrosDesafios && sessionData.encontrosDesafios.length > 0) {
    const encontrosHtml = sessionData.encontrosDesafios.map(encounter => 
      `<div class="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h4 class="font-bold text-red-800 dark:text-red-200">${encounter.name || 'Encontro'}</h4>
        <p class="text-sm text-red-700 dark:text-red-300">${encounter.description || encounter.desc || 'Sem descrição'}</p>
        ${encounter.mecanica ? `<p class="text-xs text-red-600 dark:text-red-400 mt-1"><strong>Mecânica:</strong> ${encounter.mecanica}</p>` : ''}
      </div>`
    ).join('');
    html += createCard('Encontros e Desafios', 'fa-swords', encontrosHtml);
  }

  container.innerHTML = html;
}

// --- FUNÇÕES DE UTILIDADE ---

function rollDice(numDice) {
  const results = [];
  let total = 0;
  
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * 6) + 1;
    results.push(roll);
    total += roll;
  }
  
  const resultDiv = document.getElementById('dice-result');
  const diceSpans = results.map(roll => `<span class="dice-span inline-block w-8 h-8 bg-white text-center leading-8 rounded text-sm font-bold mx-1">${roll}</span>`).join('');
  
  resultDiv.innerHTML = `
    <div class="mb-2">
      <p class="text-sm text-secondary">Rolagem de ${numDice}D6:</p>
    </div>
    <div class="mb-2">
      ${diceSpans}
    </div>
    <div class="text-lg font-bold text-primary">
      Total: ${total}
    </div>
  `;
}

function generateNPC() {
  if (!npcData || npcData.length === 0) {
    document.getElementById('npc-result').innerHTML = '<p class="text-error">Nenhum NPC disponível.</p>';
    return;
  }
  const randomIndex = Math.floor(Math.random() * npcData.length);
  const npc = npcData[randomIndex];
  const stats = npc.stats || {};
  const iconMap = { "Poder": "fa-hand-fist", "Habilidade": "fa-brain", "Resistência": "fa-shield-halved", "Pontos de Vida": "fa-heart-pulse", "Pontos de Mana": "fa-wand-magic-sparkles", "Pontos de Ação": "fa-bolt" };
  const statsHtml = Object.entries(stats).map(([statName, statValue]) => {
    const iconClass = iconMap[statName] || 'fa-question-circle';
    return `<span class="inline-flex items-center gap-x-1 mr-3"><i class="fa-solid ${iconClass} fa-fw text-accent"></i> <span class="font-bold">${statValue}</span> <span class="text-xs text-secondary">${statName}</span></span>`;
  }).join('');
  const imgHtml = npc.image ? `<img src="img/${npc.image}" alt="${npc.name}" class="w-24 h-24 object-cover rounded-full shadow mb-2">` : '';
  document.getElementById('npc-result').innerHTML = `
    <div class="flex flex-col items-center">
      ${imgHtml}
      <h3 class="text-lg font-bold text-accent mb-1">${npc.name}</h3>
      <p class="text-sm text-secondary mb-2">${npc.archetype} &bull; ${npc.pontos || ''}</p>
      <p class="text-sm text-secondary mb-2 italic">${npc.concept || ''}</p>
      <div class="mb-2">${statsHtml}</div>
      <div class="text-xs text-slate-500">Dica: clique novamente para outro NPC!</div>
    </div>
  `;
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', function() {
  // Configuração da navegação
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      showSection(targetId);
    });
  });

  // Configuração do tooltip
  document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('ability-tag')) {
      const tooltip = document.getElementById('tooltip');
      const desc = e.target.getAttribute('data-tooltip');
      tooltip.textContent = desc;
      tooltip.style.display = 'block';
      
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.bottom + 5) + 'px';
    }
  });

  document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('ability-tag')) {
      document.getElementById('tooltip').style.display = 'none';
    }
  });

  // Carrega os dados iniciais
  fetchAllData();

  // Ativa a seção 'Testes' (basico) por padrão ao carregar a página
  const basicoBtn = document.querySelector('.nav-btn[data-target="basico"]');
  if (basicoBtn) {
    basicoBtn.click();
  }
});