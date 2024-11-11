// Função para lidar com o envio do formulário
document.getElementById('formCadastrarTime').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio do formulário padrão

    const nome = document.getElementById('nome').value;
    const tecnico = document.getElementById('tecnico').value;

    const timeData = {
        nome: nome,
        tecnico: tecnico
    };

    // Envia os dados para o servidor usando fetch
    fetch('http://localhost:3000/cadastrar-time', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeData)
    })
    .then(response => response.json())
    .then(data => {
        // Exibe uma mensagem de sucesso ou erro
        const messageElement = document.getElementById('message');
        if (data.message) {
            messageElement.textContent = data.message;
            messageElement.style.color = 'green';
        } else {
            messageElement.textContent = 'Ocorreu um erro. Tente novamente.';
            messageElement.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar time:', error);
        const messageElement = document.getElementById('message');
        messageElement.textContent = 'Ocorreu um erro ao conectar ao servidor.';
        messageElement.style.color = 'red';
    });
});
