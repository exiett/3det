document.addEventListener('DOMContentLoaded', async () => {
    const characterSheetContainer = document.getElementById('character-sheet');
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    const characterType = urlParams.get('type');

    if (!characterId || !characterType) {
        characterSheetContainer.innerHTML = '<p class="text-center text-red-500">ID do personagem ou tipo não fornecido.</p>';
        return;
    }

    try {
        // Carrega dados do arquivo JSON local
        const response = await fetch(`data/${characterType}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Encontra o personagem pelo ID (nome)
        const character = data.find(char => char.name === characterId);
        
        if (!character) {
            characterSheetContainer.innerHTML = '<p class="text-center text-red-500">Personagem não encontrado.</p>';
            return;
        }

        // Processa os dados para o formato esperado
        const processedCharacter = {
            ...character,
            id: character.name,
            pericias: character.pericias || [],
            vantagens: character.vantagens || [],
            desvantagens: character.desvantagens || [],
            tecnicas: character.tecnicas || [],
            stats: character.stats || {
                "Poder": 0,
                "Habilidade": 0,
                "Resistência": 0,
                "Pontos de Ação": 0,
                "Pontos de Mana": 0,
                "Pontos de Vida": 0
            }
        };

        const createListHtml = (items) => {
            if (!items || items.length === 0) return "Nenhuma";
            return items.map(item => `<span class="ability-tag">${item.name || item}</span>`).join(', ');
        };

        const periciasHtml = createListHtml(processedCharacter.pericias);
        const vantagensHtml = createListHtml(processedCharacter.vantagens);
        const tecnicasHtml = createListHtml(processedCharacter.tecnicas);
        const desvantagensHtml = createListHtml(processedCharacter.desvantagens);

        const iconMap = { "Poder": "fa-hand-fist", "Habilidade": "fa-brain", "Resistência": "fa-shield-halved", "Pontos de Vida": "fa-heart-pulse", "Pontos de Mana": "fa-wand-magic-sparkles", "Pontos de Ação": "fa-bolt" };
        const stats = processedCharacter.stats;
        const statsCardsHtml = Object.entries(stats).map(([statName, statValue]) => {
            const iconClass = iconMap[statName] || 'fa-question-circle';
            return `<div class="info-card p-3 rounded-lg flex items-center gap-x-3 shadow-sm"><i class="fa-solid ${iconClass} fa-fw fa-2x text-accent"></i><div><span class="block text-sm text-secondary">${statName}</span><span class="block text-xl font-bold text-primary">${statValue || 0}</span></div></div>`;
        }).join('');

        characterSheetContainer.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="flex-shrink-0 w-full sm:w-48">
                    <img src="${processedCharacter.image ? `img/${processedCharacter.image}` : ''}" alt="Retrato de ${processedCharacter.name}" 
                         class="placeholder-img w-full h-auto object-cover rounded-lg shadow-lg" 
                         onerror="this.onerror=null; this.src='https://placehold.co/400x400/e2e8f0/475569?text=${processedCharacter.name.charAt(0)}';">
                </div>
                <div class="flex-grow">
                    <h3 class="text-2xl font-bold text-accent">${processedCharacter.name}</h3>
                    <p class="text-md text-secondary italic mb-2">${processedCharacter.concept}</p>
                    <p class="text-sm text-secondary mb-4">${processedCharacter.archetype} • ${processedCharacter.pontos} pontos</p>
                    
                    <div class="mb-4">
                        <h4 class="font-bold mb-1 flex items-center gap-x-2">
                            <i class="fa-solid fa-list-ol fa-fw text-slate-500"></i>
                            <span>Atributos</span>
                        </h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mt-2">
                            ${statsCardsHtml}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-bold mb-1 flex items-center gap-x-2">
                            <i class="fa-solid fa-graduation-cap fa-fw text-slate-500"></i>
                            <span>Perícias</span>
                        </h4>
                        <p>${periciasHtml}</p>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-bold mb-1 flex items-center gap-x-2">
                            <i class="fa-solid fa-thumbs-up fa-fw text-green-600"></i>
                            <span>Vantagens</span>
                        </h4>
                        <p>${vantagensHtml}</p>
                    </div>
                    
                    ${tecnicasHtml !== "Nenhuma" ? `
                        <div class="mb-4">
                            <h4 class="font-bold mb-1 flex items-center gap-x-2">
                                <i class="fa-solid fa-wand-sparkles fa-fw text-blue-500"></i>
                                <span>Técnicas</span>
                            </h4>
                            <p>${tecnicasHtml}</p>
                        </div>
                    ` : ''}
                    
                    <div>
                        <h4 class="font-bold mb-1 flex items-center gap-x-2">
                            <i class="fa-solid fa-thumbs-down fa-fw text-red-600"></i>
                            <span>Desvantagens</span>
                        </h4>
                        <p>${desvantagensHtml}</p>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar personagem:', error);
        characterSheetContainer.innerHTML = '<p class="text-center text-red-500">Erro ao carregar dados do personagem.</p>';
    }
});