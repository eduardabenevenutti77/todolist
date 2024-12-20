# Todo List (Com técnicas de segurança) 👩‍💻🚀

Uma aplicação de gerenciamento de tarefas desenvolvida com **Node.js** no backend, utilizando **Express** e **MySQL**. Aplicando conhecimentos para segurança em aplicações web, testando vulnerabilidades como **SQL Injection** e **ataques XSS**.

## Técnicas de segurança usadas

1. **Configuração do Servidor:**
   Implementação de configurações adequadas de CORS (Cross-Origin Resource Sharing) para permitir solicitações apenas de origens específicas e confiáveis, garantindo que o acesso à API seja restrito a domínios autorizados.

2. **Sanitização de Dados:**
   Todos os dados recebidos via API são validados assim que chegam à camada de controle. Isso inclui:
   Verificação de e-mails através de expressões regulares (Regex) para garantir que o formato esteja correto, por exemplo, email@gmail.com.
   Validação de senhas que devem conter símbolos, letras maiúsculas e minúsculas, além de números, assegurando um nível adequado de complexidade e segurança. (Para Cross-Site Scripting (XSS))

3. **Middleware de Autenticação:**
   Um middleware especializado é implementado para verificar tokens JWT (JSON Web Tokens) em todas as rotas protegidas juntamente com os cookies setados no backend após o login. Isso garante que apenas usuários autenticados com tokens válidos possam acessar essas rotas, reforçando a segurança no acesso a dados sensíveis. (Para Cross-Site Request Forgery (CSRF))

4. **Uso de Prepared Statements:**
   Para prevenir ataques de SQL Injection, são utilizados prepared statements nas interações com o banco de dados. Com isso, os dados são tratados separadamente das consultas SQL, evitando a execução de comandos maliciosos inseridos por usuários. (Para SQL Injection)

5. **Autenticação em 2 Fatores (2FA):**  
Para garantir a segurança da aplicação e evitar o uso por usuários mal-intencionados, implementamos a funcionalidade de autenticação em dois fatores. Nesse processo, o usuário deve confirmar sua legitimidade ao realizar o login. Um código é enviado para o e-mail cadastrado, e somente após a validação desse código o acesso à aplicação será permitido.

## Tecnologias Usadas

- **Backend:** Node.js, Express, MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Banco de Dados:** MySQL

## Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
