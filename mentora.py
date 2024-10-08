import os
import random

class Mentora:
    def __init__(self):
        self.jogos = {
            "League of Legends": ["18:00", "20:00"],
            "Dota 2": ["19:00", "21:00"],
            "Counter-Strike: Global Offensive": ["17:00", "19:30"]
        }
        self.times = {
            "Nexus LOL": {"vagas": random.randint(0, 3), "jogadores": []},
            "Sentinels Valorant": {"vagas": random.randint(0, 3), "jogadores": []},
            "Loud Valorant": {"vagas": random.randint(0, 3), "jogadores": []},
            "Furia CS": {"vagas": random.randint(0, 3), "jogadores": []}
        }
        self.usuarios = []

    def cadastrar_usuario(self, nome, email, senha):
        usuario = {
            "nome": nome,
            "email": email,
            "senha": senha,
            "time": None
        }
        self.usuarios.append(usuario)
        print(f"Usuário '{nome}' cadastrado com sucesso!")

    def login_usuario(self, email, senha):
        for usuario in self.usuarios:
            if usuario["email"] == email and usuario["senha"] == senha:
                print(f"Login bem-sucedido! Bem-vindo, {usuario['nome']}!")
                return usuario
        print("Email ou senha incorretos.")
        return None

    def mostrar_jogos(self):
        print("\nJogos disponíveis:")
        for jogo, horarios in self.jogos.items():
            print(f"{jogo} - Horários: {', '.join(horarios)}")

    def mostrar_times_disponiveis(self):
        print("\nTimes disponíveis para cadastro:")
        for time, info in self.times.items():
            if info["vagas"] > 0:
                print(f"{time} - Vagas: {info['vagas']}")

    def cadastrar_time(self, nome_time, vagas):
        if nome_time in self.times:
            print(f"O time '{nome_time}' já existe.")
        else:
            self.times[nome_time] = {"vagas": vagas, "jogadores": []}  # Vagas definidas pelo usuário
            print(f"Time '{nome_time}' cadastrado com sucesso!")

    def entrar_time(self, usuario, nome_time):
        if nome_time in self.times:
            if self.times[nome_time]["vagas"] > 0:
                self.times[nome_time]["jogadores"].append(usuario["nome"])
                self.times[nome_time]["vagas"] -= 1
                usuario["time"] = nome_time
                print(f"Usuário '{usuario['nome']}' entrou no time '{nome_time}' com sucesso!")
            else:
                print(f"O time '{nome_time}' não possui vagas disponíveis.")
        else:
            print(f"O time '{nome_time}' não existe.")

    def mostrar_times(self):
        print("\nTimes cadastrados:")
        for time, info in self.times.items():
            print(f"{time} - Vagas restantes: {info['vagas']} - Jogadores: {', '.join(info['jogadores'])}")

    def mostrar_time_atual(self, usuario):
        if usuario["time"]:
            time = usuario["time"]
            jogadores = self.times[time]["jogadores"]
            print(f"\nSeu time atual: {time}")
            print(f"Número de jogadores: {len(jogadores)}")
            print(f"Jogadores: {', '.join(jogadores)}")
        else:
            print("Você não está em nenhum time.")

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
            input("Pressione Enter para continuar...")  # Aguarda o usuário
        elif opcao == "2":
            email = input("Email: ")
            senha = input("Senha: ")
            usuario_logado = mentora.login_usuario(email, senha)
            if usuario_logado:
                input("Pressione Enter para continuar...")  # Aguarda o usuário antes de limpar a tela
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
                        mentora.cadastrar_time(nome_time, vagas)  # Passa o número de vagas definido pelo usuário
                    elif opcao_menu == "4":
                        nome_time = input("Digite o nome do time que deseja entrar: ")
                        mentora.entrar_time(usuario_logado, nome_time)
                    elif opcao_menu == "5":
                        mentora.mostrar_time_atual(usuario_logado)
                    elif opcao_menu == "6":
                        mentora.mostrar_times()
                    elif opcao_menu == "7":
                        print(f"Você saiu da conta, {usuario_logado['nome']}.")
                        usuario_logado = None  # Limpa o usuário logado
                        input("Pressione Enter para voltar ao menu inicial...")
                        break  # Volta ao menu inicial
                    elif opcao_menu == "8":
                        print("Saindo do sistema...")
                        return  # Saindo do loop
                    else:
                        print("Opção inválida! Tente novamente.")
                    
                    input("Pressione Enter para continuar...")  # Espera o usuário antes de limpar a tela
            else:
                input("Pressione Enter para tentar novamente...")  # Aguarda o usuário após erro no login
        elif opcao == "3":
            print("Saindo do sistema...")
            break
        else:
            print("Opção inválida! Tente novamente.")

if __name__ == "__main__":
    main()
