const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Porta do servidor
const porta = 3000;

// Função genérica para ler JSON de um arquivo
const readJSONFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf-8');
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    try {
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : defaultData;
    } catch (error) {
        console.error(`Erro ao ler o arquivo JSON (${filePath}):`, error);
        return defaultData;
    }
};

// Função genérica para salvar JSON em um arquivo
const saveJSONFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Funções específicas para usuários e times
const readUsers = () => readJSONFile(path.join(__dirname, 'usuarios.json'));
const saveUsers = (users) => saveJSONFile(path.join(__dirname, 'usuarios.json'), users);
const readTeams = () => readJSONFile(path.join(__dirname, 'times.json'));
const saveTeams = (teams) => saveJSONFile(path.join(__dirname, 'times.json'), teams);

// Função para gerar um token de sessão
const generateSessionToken = () => crypto.randomBytes(16).toString('hex');

// Dicionário para armazenar sessões ativas
const sessions = {};

// Criação do servidor
const server = http.createServer((req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log(`Recebido: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const handleHTMLPage = (filePath, res) => {
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
    };

    const handleJSONRequest = (req, callback) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => callback(JSON.parse(body)));
    };

    // Rotas
    if (req.method === 'GET' && req.url === '/entrar-time') {
        handleHTMLPage(path.join(__dirname, 'entrar_time.html'), res);
        
    } else if (req.method === 'POST' && req.url === '/cadastrar') {
        handleJSONRequest(req, userData => {
            const users = readUsers();
            if (users.some(user => user.email === userData.email)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Email já cadastrado' }));
            } else {
                users.push({
                    id: users.length + 1,
                    nome: userData.nome,
                    email: userData.email,
                    senha: userData.senha
                });
                saveUsers(users);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuário cadastrado com sucesso' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/cadastrar-time') {
        handleJSONRequest(req, teamData => {
            const teams = readTeams();
            teams.push({
                id: teams.length + 1,
                nome: teamData.nome,
                tecnico: teamData.tecnico,
                membros: []
            });
            saveTeams(teams);
            // Definir o cabeçalho corretamente
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Time cadastrado com sucesso' }));
        });

    } else if (req.method === 'POST' && req.url === '/login') {
        handleJSONRequest(req, loginData => {
            const users = readUsers();
            const user = users.find(user => user.email === loginData.email && user.senha === loginData.senha);
            if (user) {
                const sessionToken = generateSessionToken();
                sessions[sessionToken] = user;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Login bem-sucedido', user, sessionToken }));
            } else {
                res.writeHead(401);
                res.end(JSON.stringify({ message: 'Credenciais inválidas' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/entrar-time') {
        handleJSONRequest(req, ({ userId, teamId }) => {
            const users = readUsers();
            const teams = readTeams();
            const user = users.find(user => user.id === userId);
            const team = teams.find(team => team.id === teamId);

            if (!user || !team) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Usuário ou time não encontrado' }));
            } else {
                // Verifica se o jogador já está no time
                if (team.membros && team.membros.some(jogador => jogador.id === userId)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Usuário já está no time' }));
                    return;
                }

                // Adiciona o usuário completo como "jogador" ao time
                if (!team.membros) {
                    team.membros = [];
                }

                team.membros.push({
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                });

                saveTeams(teams); // Salva as alterações no arquivo de times

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Entrou no time com sucesso', teamName: team.nome }));
                console.log('Usuário entrou no time com sucesso:', team.nome);
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/excluir-usuario')) {
        handleJSONRequest(req, ({ userId }) => {
            const users = readUsers();
            const updatedUsers = users.filter(user => user.id !== userId);
            if (updatedUsers.length === users.length) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Usuário não encontrado' }));
            } else {
                saveUsers(updatedUsers);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Usuário excluído com sucesso' }));
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/excluir-time')) {
        handleJSONRequest(req, ({ teamId }) => {
            const teams = readTeams();
            const updatedTeams = teams.filter(team => team.id !== teamId);
            if (updatedTeams.length === teams.length) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Time não encontrado' }));
            } else {
                saveTeams(updatedTeams);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Time excluído com sucesso' }));
            }
        });

    } else if (req.method === 'GET' && req.url.startsWith('/dashboard')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const sessionToken = urlParams.get('sessionToken');

        if (sessionToken && sessions[sessionToken]) {
            const user = sessions[sessionToken];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuário autenticado', user }));
        } else {
            res.writeHead(401);
            res.end(JSON.stringify({ message: 'Usuário não logado' }));
        }

    } else if (req.method === 'GET' && req.url === '/times') {
        const teams = readTeams();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(teams));

    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Rota não encontrada' }));
    }
});

// Inicia o servidor
server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/`);
});
