# FluxaQuote - Setup Firebase

## 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie o projeto com nome **fluxaquote**
3. Desative Google Analytics (opcional)

## 2. Authentication

1. **Authentication** > **Sign-in method** > Habilite **Email/Senha**
2. **Users** > Crie seu usuario administrador

## 3. Firestore Database

1. **Firestore Database** > **Criar banco de dados**
2. Modo: **Producao**
3. Regiao: **us-central1**

## 4. Credenciais

### Frontend (Web App)
1. **Configuracoes do Projeto** > **Seus aplicativos** > Web (`</>`)
2. Apelido: `fluxaquote-web`
3. Copie o `firebaseConfig`

### Backend (Service Account)
1. **Configuracoes do Projeto** > **Contas de servico**
2. **Gerar nova chave privada** (nunca commite este arquivo!)

## 5. Variaveis de Ambiente

```bash
# Frontend
cp frontend/.env.example frontend/.env
# Preencha: VITE_FIREBASE_API_KEY, MESSAGING_SENDER_ID, APP_ID

# Backend
cp backend/.env.example backend/.env.local
# Preencha: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
```

## 6. Instalar e Rodar

```bash
cd frontend && npm install
cd ../backend && npm install

# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 7. Deploy

```bash
npx firebase login
npx firebase use fluxaquote

cd frontend && npm run build
cd ../backend && npm run build
cd .. && npx firebase deploy
```
