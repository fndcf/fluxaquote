// Configurar variáveis de ambiente ANTES de qualquer import
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9199';
process.env.FIREBASE_PROJECT_ID = 'demo-fluxaquote';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

import { db, auth } from '../../config/firebase';

export { db, auth };

// Helper: criar usuário de teste no Auth Emulator
export async function criarUsuarioTeste(email: string, senha: string) {
  try {
    return await auth.createUser({ email, password: senha });
  } catch {
    return await auth.getUserByEmail(email);
  }
}

// Helper: criar tenant de teste no Firestore
export async function criarTenantTeste(tenantId: string, ownerId: string) {
  await db.collection('tenants').doc(tenantId).set({
    slug: 'teste',
    nomeEmpresa: 'Empresa Teste',
    email: 'teste@teste.com',
    telefone: '11999999999',
    ownerId,
    plano: 'basico',
    ativo: true,
    createdAt: new Date(),
  });

  await db.collection('userTenants').doc(ownerId).set({
    tenantId,
    slug: 'teste',
    role: 'admin',
    createdAt: new Date(),
  });

  // Criar contador de orçamentos para o tenant
  await db.collection('tenants').doc(tenantId)
    .collection('contadores').doc('orcamentos')
    .set({ numero: 0 });
}

// Helper: gerar token JWT válido para testes
export async function gerarTokenTeste(uid: string): Promise<string> {
  const customToken = await auth.createCustomToken(uid);

  const response = await fetch(
    `http://localhost:9199/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  const data = (await response.json()) as { idToken: string };
  return data.idToken;
}

// Helper: limpar Firestore
export async function limparFirestore() {
  await fetch(
    `http://localhost:8181/emulator/v1/projects/demo-fluxaquote/databases/(default)/documents`,
    { method: 'DELETE' }
  );
}

// Helper: limpar Auth
export async function limparAuth() {
  await fetch(
    `http://localhost:9199/emulator/v1/projects/demo-fluxaquote/accounts`,
    { method: 'DELETE' }
  );
}

// NÃO limpar automaticamente — cada suite gerencia seu próprio cleanup
