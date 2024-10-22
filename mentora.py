import os
import json
import random

# Nome do arquivo JSON que será utilizado
FILENAME = 'mentora_data.json'

class Usuario:
    def __init__(self, nome, email, senha, time=None):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.time = time

    def to_dict(self):
        return {
            "nome": self.nome,
            "email": self.email,
            "senha": self.senha,
            "time": self.time
        }

class Time:
    def __init__(self, nome, vagas, jogadores=None):
        self.nome = nome
        self.vagas = vagas
        self.jogadores = jogadores if jogadores is not None else []

    def adicionar_jogador(self, usuario):
        if self.vagas > 0:
            self.jogadores.append(usuario.nome)
            self.vagas -= 1
            usuario.time = self.nome
            print(f"Usuário '{usuario.nome}' entrou no time '{self.nome}' com sucesso!")
        else:
            print(f"O time '{self.nome}' não possui vagas disponíveis.")

    def to_dict(self):
        return {
            "nome": self.nome,
            "vagas": self.vagas,
            "jogadores": self.jogadores
        }

class Mentora:
    def __init__(self):
        self.jogos = {
            "League of Legends": ["18:00", "20:00"],
            "Dota 2": ["19:00", "21:00"],
            "Counter-Strike: Global Offensive": ["17:00", "19:30"]
        }
        self.usuarios = []
        self.times = {}

        # Carrega dados do arquivo JSON ao iniciar
        self.carregar_dados()

    def cadastrar_usuario(self, nome, email, senha):
        usuario = Usuario(nome, email, senha)
        self.usuarios.append(usuario)
        self.salvar_dados()
        print(f"Usuário '{nome}' cadastrado com sucesso!")

    def login_usuario(self, email, senha):
        for usuario in self.usuarios:
            if usuario.email == email and usuario.senha == senha:
                print(f"Login bem-sucedido! Bem-vindo, {usuario.nome}!")
                return usuario
        print("Email ou senha incorretos.")
        return None

    def mostrar_jogos(self):
        print("\nJogos disponíveis:")
        for jogo, horarios in self.jogos.items():
            print(f"{jogo} - Horários: {', '.join(horarios)}")

    def mostrar_times_disponiveis(self):
        print("\nTimes disponíveis para cadastro:")
        for time in self.times.values():
            if time.vagas > 0:
                print(f"{time.nome} - Vagas: {time.vagas}")

    def cadastrar_time(self, nome_time, vagas):
        if nome_time in self.times:
            print(f"O time '{nome_time}' já existe.")
        else:
            self.times[nome_time] = Time(nome_time, vagas)
            self.salvar_dados()
            print(f"Time '{nome_time}' cadastrado com sucesso!")

    def entrar_time(self, usuario):
        print("\nTimes disponíveis para entrada:")
        times_disponiveis = [time.nome for time in self.times.values() if time.vagas > 0]

        if not times_disponiveis:
            print("Não há times com vagas disponíveis.")
            return

        for index, nome_time in enumerate(times_disponiveis, start=1):
            print(f"{index}. {nome_time} - Vagas: {self.times[nome_time].vagas}")

        escolha = int(input("Escolha o número do time que deseja entrar: ")) - 1

        if 0 <= escolha < len(times_disponiveis):
            nome_time_escolhido = times_disponiveis[escolha]
            self.times[nome_time_escolhido].adicionar_jogador(usuario)
            self.salvar_dados()
        else:
            print("Opção inválida!")

    def mostrar_times(self):
        print("\nTimes cadastrados:")
        for time in self.times.values():
            print(f"{time.nome} - Vagas restantes: {time.vagas} - Jogadores: {', '.join(time.jogadores)}")

    def mostrar_time_atual(self, usuario):
        if usuario.time:
            time = self.times[usuario.time]
            print(f"\nSeu time atual: {time.nome}")
            print(f"Número de jogadores: {len(time.jogadores)}")
            print(f"Jogadores: {', '.join(time.jogadores)}")
        else:
            print("Você não está em nenhum time.")

    # Funções para salvar e carregar dados do arquivo JSON
    def salvar_dados(self):
        data = {
            "usuarios": [usuario.to_dict() for usuario in self.usuarios],
            "times": {nome: time.to_dict() for nome, time in self.times.items()}
        }
        with open(FILENAME, 'w') as file:
            json.dump(data, file, indent=4)
        print("Dados salvos no arquivo JSON.")

    def carregar_dados(self):
        if os.path.exists(FILENAME):
            with open(FILENAME, 'r') as file:
                data = json.load(file)
                # Carregar usuários
                self.usuarios = [Usuario(**usuario) for usuario in data.get("usuarios", [])]
                # Carregar times
                self.times = {nome: Time(**time) for nome, time in data.get("times", {}).items()}
            print("Dados carregados do arquivo JSON.")

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')


def main():
    mentora = Mentora()

    usuario_logado = None

    while True:
        mentora.clear_screen()
        print("\nMenu Inicial:")
        print("1. Cadastrar usuário")
        print("2. Fazer login")
        print("3. Sair")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == "1":
            nome = input("Nome: ")
            email = input("Email: ")
            senha = input("Senha: ")
            mentora.cadastrar_usuario(nome, email, senha)
            input("Pressione Enter para continuar...")
        elif opcao == "2":
            email = input("Email: ")
            senha = input("Senha: ")
            usuario_logado = mentora.login_usuario(email, senha)
            if usuario_logado:
                input("Pressione Enter para continuar...")
                while True:
                    mentora.clear_screen()
                    print("\nMenu:")
                    print("1. Mostrar jogos disponíveis")
                    print("2. Mostrar times disponíveis para cadastro")
                    print("3. Cadastrar novo time")
                    print("4. Entrar em um time existente")
                    print("5. Mostrar seu time atual")
                    print("6. Mostrar times cadastrados")
                    print("7. Sair da conta")
                    print("8. Sair do sistema")
                    
                    opcao_menu = input("Escolha uma opção: ")
                    
                    if opcao_menu == "1":
                        mentora.mostrar_jogos()
                    elif opcao_menu == "2":
                        mentora.mostrar_times_disponiveis()
                    elif opcao_menu == "3":
                        nome_time = input("Digite o nome do novo time: ")
                        vagas = int(input("Digite o número de vagas para o time: "))
                        mentora.cadastrar_time(nome_time, vagas)
                    elif opcao_menu == "4":
                        mentora.entrar_time(usuario_logado)
                    elif opcao_menu == "5":
                        mentora.mostrar_time_atual(usuario_logado)
                    elif opcao_menu == "6":
                        mentora.mostrar_times()
                    elif opcao_menu == "7":
                        print(f"Você saiu da conta, {usuario_logado.nome}.")
                        usuario_logado = None
                        input("Pressione Enter para voltar ao menu inicial...")
                        break
                    elif opcao_menu == "8":
                        print("Saindo do sistema...")
                        return
                    else:
                        print("Opção inválida! Tente novamente.")
                    
                    input("Pressione Enter para continuar...")
            else:
                input("Pressione Enter para tentar novamente...")
        elif opcao == "3":
            print("Saindo do sistema...")
            break
        else:
            print("Opção inválida! Tente novamente.")

if __name__ == "__main__":
    main()
