// src/lib/auth-api.ts
import { NextResponse } from "next/server";

export function validateInternalToken(request: Request): { isValid: boolean; errorResponse?: NextResponse } {
  const authHeader = request.headers.get("Authorization");
  const secret = process.env.INTERNAL_API_SECRET_KEY;

  // 1. Verificar que el secreto esté configurado en el servidor
  if (!secret) {
    console.error("🔒 Error de configuración: INTERNAL_API_SECRET no está definido.");
    return { 
      isValid: false, 
      errorResponse: NextResponse.json({ error: "Internal Server Error" }, { status: 500 }) 
    };
  }

  // 2. Validar que el formato sea 'Bearer <token>' y coincida
  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== secret) {
    return { 
      isValid: false, 
      errorResponse: NextResponse.json({ error: "No autorizado. Token inválido o ausente." }, { status: 401 }) 
    };
  }

  return { isValid: true };
}