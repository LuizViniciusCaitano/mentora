const user = JSON.parse(localStorage.getItem('user'));

if (user) {
    document.getElementById("user-id").textContent = user.id;
    document.getElementById("user-name").textContent = user.nome;
} else {
    alert("Usuário não logado.");
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = "login.html";
}

async function toggleTimes() {
    const teamListElement = document.getElementById("team-list");
    const teamButton = document.getElementById("team-button");
    const teamList = document.getElementById("teams");

    if (!teamListElement.classList.contains("open")) {
        // Limpar a lista antes de popular
        teamList.innerHTML = "";

        try {
            const response = await fetch('http://localhost:3000/times'); // Altere para a rota correta
            const times = await response.json();

            times.forEach(time => {
                const li = document.createElement("li");
                li.textContent = `${time.nome} - Técnico: ${time.tecnico}`; // Modifique conforme necessário
                teamList.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar os times:', error);
            alert('Erro ao carregar os times.');
        }
    }

    // Alterna a classe para mostrar ou esconder a lista de times
    teamListElement.classList.toggle("open");
    teamButton.classList.toggle("shift-up");
    shiftButtons(); // Chama a função para os outros botões
}

function shiftButtons() {
    const buttons = document.querySelectorAll('.button-container .button');
    buttons.forEach(button => {
        button.classList.toggle("shift-up");
    });
}
