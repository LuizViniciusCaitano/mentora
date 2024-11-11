// Recuperar as informações do usuário
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const teamListElement = document.getElementById("team-list");
    const teamButton = document.getElementById("team-button");

    if (user) {
        document.getElementById("user-id").textContent = user.id;
        document.getElementById("user-name").textContent = user.nome;
    } else {
        alert("Usuário não logado.");
        window.location.href = "login.html";
    }

    // Atribuir ações aos botões
    document.getElementById("logout-button").addEventListener("click", logout);
    teamButton.addEventListener("click", toggleTeams);

    // Função de logout
    function logout() {
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }

    // Carregar e exibir times
    async function toggleTeams() {
        if (!teamListElement.classList.contains("open")) {
            try {
                const response = await fetch('http://localhost:3000/times');
                if (!response.ok) throw new Error('Erro ao carregar times');

                const teams = await response.json();
                const teamList = document.getElementById("teams");

                // Limpar lista de times
                teamList.innerHTML = "";

                // Adicionar times à lista
                teams.forEach(team => {
                    const li = document.createElement("li");
                    li.textContent = `${team.nome} - Técnico: ${team.tecnico}`;
                    teamList.appendChild(li);
                });
            } catch (error) {
                console.error('Erro ao buscar os times:', error);
                alert('Erro ao carregar os times.');
            }
        }

        // Alternar a exibição da lista de times e o deslocamento do botão
        teamListElement.classList.toggle("open");
        teamButton.classList.toggle("shifted");
    }
});
