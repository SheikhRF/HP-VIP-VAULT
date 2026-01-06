import { auth } from "@clerk/nextjs/server";

export type AppSessionClaims = {
  FirstName?: string; 
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