const apiBase = 'http://localhost:3000'; // URL do seu servidor

// Função para cadastrar usuário
document.getElementById('form-cadastro')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch(`${apiBase}/cadastrar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
    });

    const data = await response.json();
    alert(data.mensagem);
});

// Função para fazer login
document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    const response = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();
    
    if (data.mensagem) {
        alert(data.mensagem);
        if (data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'index.html'; // Redireciona para a página inicial
        }
    } else {
        alert('Email ou senha incorretos.');
    }
});

// Função para mostrar o nome do usuário na tela inicial
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        document.getElementById('usuario-nome').textContent = usuario.nome;
    } else {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
    }
});

// Função para logout
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}
