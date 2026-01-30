import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as functions from "firebase-functions";
import * as functionsV1 from "firebase-functions/v1";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { inicializarEventHandlers } from "./services/notificacaoService";
import { auth } from "./config/firebase";
import { logger } from "./utils/logger";

dotenv.config();

// Inicializa os handlers de eventos para comunicação entre serviços
inicializarEventHandlers();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Rotas
app.use("/api", routes);

// Error Handler
app.use(errorHandler);

// Export para Firebase Cloud Functions
export const api = functions.https.onRequest(app);

/**
 * Trigger: desabilitar novos usuários automaticamente.
 * O administrador habilita manualmente pelo Firebase Console.
 */
export const onUserCreated = functionsV1.auth.user().onCreate(async (user) => {
  try {
    await auth.updateUser(user.uid, { disabled: true });
    logger.info("Novo usuário criado e desabilitado automaticamente", {
      uid: user.uid,
      email: user.email,
    });
  } catch (error: unknown) {
    logger.error("Erro ao desabilitar novo usuário", {
      uid: user.uid,
      email: user.email,
      error,
    });
  }
});

export default app;
