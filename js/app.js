let selectedPersonaId = null;

window.showCharacterCard = (id) => {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    selectedPersonaId = id;
    
    document.getElementById('modal-name').textContent = character.name;
    document.getElementById('modal-era').textContent = character.era;
    document.getElementById('modal-expertise').textContent = character.expertise.main.join(', ');
    document.getElementById('modal-bio').textContent = character.coreIdentity;
    document.getElementById('modal-img').src = character.image;

    document.getElementById('character-modal').style.display = 'flex';
};

window.closePersonaModal = () => {
    document.getElementById('character-modal').style.display = 'none';
};

window.startChat = () => {
    if (!selectedPersonaId) return;
    
    localStorage.setItem('selectedPersonaId', selectedPersonaId);
    
    closePersonaModal();
    navigateTo('/chat');
};

window.onclick = function(event) {
    const modal = document.getElementById('character-modal');
    if (event.target == modal) {
        closePersonaModal();
    }
}
