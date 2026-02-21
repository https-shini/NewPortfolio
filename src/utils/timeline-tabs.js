// Função para gerenciar as abas da timeline
function timelineTabs() {
    const tabs = document.querySelectorAll('.timeline-tab');
    const contentContainers = document.querySelectorAll('.timeline-content-container');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as abas
            tabs.forEach(t => {
                t.classList.remove('active');
            });
            
            // Adicionar classe active à aba clicada
            tab.classList.add('active');
            
            // Obter o id do conteúdo a ser mostrado
            const targetId = tab.getAttribute('data-target');
            
            // Esconder todos os conteúdos
            contentContainers.forEach(container => {
                container.classList.remove('active');
            });
            
            // Mostrar o conteúdo correspondente à aba clicada
            document.getElementById(targetId).classList.add('active');
        });
    });
}

export default timelineTabs;
