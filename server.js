const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Porta do servidor
const porta = 3000;

// Função para ler usuários do arquivo JSON
const readUsers = () => {
    const filePath = path.join(__dirname, 'usuarios.json');

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
    }

    const data = fs.readFileSync(filePath, 'utf-8');

    try {
        const users = JSON.parse(data);
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error("Erro ao ler o arquivo JSON:", error);
        return [];
    }
};

// Função para salvar usuários no arquivo JSON
const saveUsers = (users) => {
    fs.writeFileSync(path.join(__dirname, 'usuarios.json'), JSON.stringify(users, null, 2));
};

// Função para ler times do arquivo JSON
const readTeams = () => {
    const filePath = path.join(__dirname, 'times.json');

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
    }

    const data = fs.readFileSync(filePath, 'utf-8');

    try {
        const teams = JSON.parse(data);
        return Array.isArray(teams) ? teams : [];
    } catch (error) {
        console.error("Erro ao ler o arquivo JSON de times:", error);
        return [];
    }
};

// Função para salvar times no arquivo JSON
const saveTeams = (teams) => {
    fs.writeFileSync(path.join(__dirname, 'times.json'), JSON.stringify(teams, null, 2));
};

// Função para gerar um token de sessão
const generateSessionToken = () => crypto.randomBytes(16).toString('hex');

// Dicionário para armazenar sessões ativas
const sessions = {};

// Criação do servidor
const server = http.createServer((req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log(`Recebido: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Carregar a página HTML para entrar em um time
    if (req.method === 'GET' && req.url === '/entrar-time') {
        const filePath = path.join(__dirname, 'entrar_time.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Página não encontrada' }));
                console.error('Erro ao carregar a página:', err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });

    // Cadastro de usuário
    } else if (req.method === 'POST' && req.url === '/cadastrar') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Dados recebidos para cadastro:', body);
            try {
                const userData = JSON.parse(body);
                const users = readUsers();

                if (users.some(user => user.email === userData.email)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Email já cadastrado' }));
                    console.log('Email já cadastrado:', userData.email);
                    return;
                }

                users.push({
                    id: users.length + 1,
                    nome: userData.nome,
                    email: userData.email,
                    senha: userData.senha
                });
                saveUsers(users);

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Usuário cadastrado com sucesso' }));
                console.log('Usuário cadastrado com sucesso:', userData.nome);
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Dados inválidos' }));
            }
        });

    // Cadastro de time
    } else if (req.method === 'POST' && req.url === '/cadastrar-time') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Dados recebidos para cadastro de time:', body);
            try {
                const teamData = JSON.parse(body);
                const teams = readTeams();

                // Aqui você pode adicionar validações se necessário

                teams.push({
                    id: teams.length + 1,
                    nome: teamData.nome,
                    tecnico: teamData.tecnico,
                    membros: [] // Adiciona um array para armazenar os membros do time
                });
                saveTeams(teams);

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Time cadastrado com sucesso' }));
                console.log('Time cadastrado com sucesso:', teamData.nome);
            } catch (error) {
                console.error('Erro ao cadastrar o time:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Dados inválidos' }));
            }
        });

    // Login de usuário
    } else if (req.method === 'POST' && req.url === '/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Dados recebidos para login:', body);
            try {
                const loginData = JSON.parse(body);
                const users = readUsers();

                const user = users.find(user => user.email === loginData.email && user.senha === loginData.senha);

                if (user) {
                    const sessionToken = generateSessionToken();
                    sessions[sessionToken] = user;

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login bem-sucedido', user, sessionToken }));
                    console.log('Login bem-sucedido para:', loginData.email);
                } else {
                    res.writeHead(401);
                    res.end(JSON.stringify({ message: 'Credenciais inválidas' }));
                    console.log('Falha no login para:', loginData.email);
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Dados inválidos' }));
            }
        });

    // Entrar em um time
    } else if (req.method === 'POST' && req.url === '/entrar-time') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Dados recebidos para entrar em um time:', body);
            try {
                const { userId, teamId } = JSON.parse(body);
                const users = readUsers();
                const teams = readTeams();

                // Verifica se o usuário e o time existem
                const user = users.find(user => user.id === userId);
                const team = teams.find(team => team.id === teamId);

                if (!user || !team) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Usuário ou time não encontrado' }));
                    return;
                }

                // Adiciona o usuário à lista de membros do time
                team.membros.push(userId);
                saveTeams(teams); // Salva as alterações no arquivo de times

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Entrou no time com sucesso', teamName: team.nome }));
                console.log('Usuário entrou no time com sucesso:', team.nome);
            } catch (error) {
                console.error('Erro ao entrar no time:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Dados inválidos' }));
            }
        });

    // Verificação de sessão (validação no dashboard)
    } else if (req.method === 'GET' && req.url.startsWith('/dashboard')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const sessionToken = urlParams.get('sessionToken');

        if (sessionToken && sessions[sessionToken]) {
            const user = sessions[sessionToken];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuário autenticado', user }));
            console.log('Usuário autenticado:', user.email);
        } else {
            res.writeHead(401);
            res.end(JSON.stringify({ message: 'Usuário não logado' }));
            console.log('Acesso negado: Usuário não logado.');
        }

    // Obter lista de times
    } else if (req.method === 'GET' && req.url === '/times') {
        const teams = readTeams();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(teams));
        console.log('Lista de times retornada com sucesso.');

    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Rota não encontrada' }));
        console.log('Rota não encontrada:', req.url);
    }
});

// Inicia o servidor
server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/`);
});
