import { auth } from "@clerk/nextjs/server";

export type AppSessionClaims = {
  FirstName?: string;
  Role?: "admin" | "user"; 
};


export async function getAppSessionClaims(): Promise<AppSessionClaims | null> {
  const { sessionClaims } = await auth();
  if (!sessionClaims) return null;

  return sessionClaims as AppSessionClaims;
}

export async function getFirstName(fallback = "User"): Promise<string> {
  const claims = await getAppSessionClaims();
  return claims?.FirstName || fallback;
}

export async function checkIsAdmin(): Promise<boolean> {
  const claims = await getAppSessionClaims();
  return claims?.Role === 'admin';
}