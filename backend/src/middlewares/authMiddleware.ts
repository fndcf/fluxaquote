import { Request, Response, NextFunction } from "express";
import { auth, db } from "../config/firebase";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { GLOBAL_COLLECTIONS } from "../utils/constants";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    tenantId: string;
    slug: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token não fornecido");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Tentar ler tenantId das custom claims
    let tenantId = decodedToken.tenantId as string | undefined;
    let slug = decodedToken.slug as string | undefined;
    let role = decodedToken.role as string | undefined;

    // Fallback: buscar no userTenants se claims não existem
    if (!tenantId) {
      const userTenantDoc = await db
        .collection(GLOBAL_COLLECTIONS.USER_TENANTS)
        .doc(decodedToken.uid)
        .get();

      if (userTenantDoc.exists) {
        const data = userTenantDoc.data();
        tenantId = data?.tenantId;
        slug = data?.slug;
        role = data?.role;

        // Setar custom claims para próximas requisições
        await auth.setCustomUserClaims(decodedToken.uid, {
          tenantId,
          slug,
          role,
        });
      }
    }

    if (!tenantId) {
      throw new ForbiddenError("Usuário não está associado a nenhuma empresa");
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      tenantId,
      slug: slug || "",
      role: role || "admin",
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      next(new UnauthorizedError("Token inválido ou expirado"));
    }
  }
};
