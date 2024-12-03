const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const todoContainer = document.getElementById("todo-container");
const authContainer = document.getElementById("auth-container");
const todoList = document.getElementById("todo-list");
const newTodoForm = document.getElementById("new-todo-form");
const toggleFormLink = document.getElementById("toggle-form");
const formTitle = document.getElementById("form-title");
const errorNessage = document.getElementById("error-message");

toggleFormLink.addEventListener("click", (e) => {
  e.preventDefault();
  if (loginForm.style.display === "none") {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    formTitle.textContent = "Login";
    toggleFormLink.textContent = "Não tem uma conta? Registrar-se";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    formTitle.textContent = "Registrar-se";
    toggleFormLink.textContent = "Já tem uma conta? Fazer login";
  }
});

// Função para exibir erro
function showError(inputId, message) {
  const errorSpan = document.getElementById(inputId + "-error");
  errorSpan.textContent = message;
  errorSpan.style.color = "red"; // Estilo para o erro, pode ajustar conforme necessário
}

// Limpar mensagens de erro
function clearErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((span) => {
    span.textContent = "";
  });
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors(); // Limpa os erros anteriores

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch("http://localhost:3000/api/v1/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (response.ok) {
    const authResponse = await fetch(
      "http://localhost:3000/api/v1/users/auth",
      {
        credentials: "include",
      }
    );

    if (authResponse.ok) {
      authContainer.style.display = "none";
      todoContainer.style.display = "block";
      loadTodos();
    } else {
      showError("login-username", "Erro de autenticação após login");
    }
  } else {
    const errorData = await response.json();
    showError("login-username", errorData.error || "Falha no login");
  }
});

// Registro
const errorMessage = document.getElementById("error-message");
const togglePasswordButton = document.getElementById("toggle-password");

// Validação do formulário de registro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "register-confirm-password"
  ).value;

  // Verifica se as senhas coincidem
  if (password !== confirmPassword) {
    errorMessage.textContent = "As senhas não coincidem.";
    errorMessage.style.display = "block";
    return;
  }

  // Limpa a mensagem de erro se as senhas coincidem
  errorMessage.style.display = "none";

  // Realiza a requisição de registro
  const response = await fetch("http://localhost:3000/api/v1/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    document.getElementById("success-modal").style.display = "flex";
    registerForm.reset();
    registerForm.style.display = "none";
    loginForm.style.display = "flex";
    formTitle.textContent = "Login";
    toggleFormLink.textContent = "Não tem uma conta? Registrar-se";
  } else {
    const errorData = await response.json();
    errorMessage.textContent = errorData.error || "Erro desconhecido";
    errorMessage.style.display = "block";
  }
});

// Mostrar/ocultar senha
togglePasswordButton.addEventListener("click", () => {
  const passwordField = document.getElementById("register-password");
  const confirmPasswordField = document.getElementById(
    "register-confirm-password"
  );
  const type = passwordField.type === "password" ? "text" : "password";

  passwordField.type = type;
  confirmPasswordField.type = type;

  togglePasswordButton.textContent =
    type === "password" ? "Mostrar Senha" : "Ocultar Senha";
});

async function loadTodos() {
  const response = await fetch("http://localhost:3000/api/v1/todos", {
    credentials: "include",
  });

  if (response.ok) {
    const todos = await response.json();
    todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.textContent = todo.title;
      li.setAttribute("data-id", todo.id);

      if (todo.completed) {
        li.classList.add("completed");
      }

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "actionButtons";

      const completeButton = document.createElement("button");
      completeButton.textContent = todo.completed ? "Desmarcar" : "Completar";
      completeButton.classList.add("complete");
      completeButton.addEventListener("click", () => {
        const newCompletedStatus = !todo.completed;
        toggleComplete(todo.id, newCompletedStatus);
        completeButton.textContent = newCompletedStatus
          ? "Desmarcar"
          : "Completar";
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Deletar";
      deleteButton.classList.add("delete");
      deleteButton.addEventListener("click", () => deleteTodo(todo.id));

      buttonContainer.appendChild(completeButton);
      buttonContainer.appendChild(deleteButton);

      todoList.appendChild(li);
      todoList.appendChild(buttonContainer);
    });
  } else {
    alert("Erro ao carregar tarefas");
  }
}

document
  .getElementById("register-close-modal")
  .addEventListener("click", () => {
    document.getElementById("error-modal").style.display = "none";
  });
document.getElementById("success-modal").addEventListener("click", () => {
  document.getElementById("success-modal").style.display = "none";
});

async function toggleComplete(id, completed) {
  const response = await fetch(`http://localhost:3000/api/v1/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ completed }),
  });

  if (response.ok) {
    loadTodos();
  } else {
    alert("Erro ao atualizar tarefa");
  }
}

newTodoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("new-todo-title").value;

  const response = await fetch("http://localhost:3000/api/v1/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (response.ok) {
    loadTodos();
    newTodoForm.reset();
  } else {
    alert("Erro ao adicionar tarefa");
  }
});

async function deleteTodo(id) {
  const response = await fetch(`http://localhost:3000/api/v1/todos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.ok) {
    loadTodos();
  } else {
    alert("Erro ao deletar tarefa");
  }
}

document.getElementById("logout").addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/v1/users/logout", {
    method: "POST",
    credentials: "include",
  });
  if (response.ok) {
    todoContainer.style.display = "none";
    authContainer.style.display = "block";
  } else {
    alert("Erro ao fazer logout");
  }
});