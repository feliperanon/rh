# Página de Login – Refatoração

## Execução

```bash
npm install
npm run dev
```

Acesse **http://localhost:3000/login**.

---

## Estrutura

- `app/login/page.tsx` — Página `/login` que renderiza o card em fundo claro.
- `components/auth/LoginCard.tsx` — Card de login (formulário, validação, estados).
- `lib/validators/login.ts` — Schema Zod (email, senha, lembrar).
- `lib/actions/login.ts` — Mock `loginAction` (delay 700–1200 ms); pronto para trocar pela API.
- `app/globals.css` — Tokens de design `--login-*` (cores, sombra, radius, altura de input).

---

## O que foi mantido (igual ao original)

- Hierarquia: ícone (cadeado) → título "RH Admin" → subtítulo "Faça login para gerenciar o painel".
- Campos: Email e Senha (com botão mostrar/ocultar senha).
- Checkbox "Salvar usuário e senha" e link "Recuperar senha" alinhados na mesma linha.
- Botão principal "Entrar" em largura total.
- Rodapé: "Não consegue acessar? Solicite ajuda rápida" com link.
- Card centralizado, largura máxima ~400px, fundo claro e bordas arredondadas.

---

## O que foi melhorado

- **Design tokens** em `globals.css`: `--login-bg`, `--login-surface`, `--login-primary`, `--login-radius`, `--login-shadow`, etc., para manutenção e tema único.
- **Validação** com Zod + React Hook Form: mensagens de erro por campo (email obrigatório/válido, senha mínima 6 caracteres).
- **Estados**: loading no botão (spinner + "Validando..."), desabilitado durante submit, mensagem de erro geral quando o mock retorna falha.
- **Acessibilidade**: labels associadas aos inputs, `aria-label` no botão de mostrar/ocultar senha, `role="alert"` no erro geral, foco visível (ring) em todos os interativos, navegação por teclado.
- **Microinterações**: hover suave em bordas dos inputs, botão com `active:scale-[0.99]`, ícone do cadeado com hover scale.
- **Cores**: acento em azul (`--login-primary`) em botão, links e foco; fundo e superfície em tons claros (off-white/cinza suave).
- **Sombra e radius**: card com `--login-shadow` e `--login-radius-lg` (1.5rem) para aparência mais limpa.
- **Mock de API**: `loginAction` em `lib/actions/login.ts` com delay configurável; basta trocar a implementação pela chamada real ao backend.

---

## Integração com API real

Substitua o corpo de `loginAction` em `lib/actions/login.ts` pela chamada ao seu backend (por exemplo `fetch` para `POST /auth/login`). Mantenha a assinatura e o retorno `{ success: true } | { success: false; message: string }` para o `LoginCard` continuar funcionando (sucesso limpa o form; erro exibe `message`).
