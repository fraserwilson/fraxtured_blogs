import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

function parseCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const allowedEmails = parseCsv(process.env.ALLOWED_EMAILS);
const allowedDomains = parseCsv(process.env.ALLOWED_EMAIL_DOMAINS);

function isAllowedEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const normalized = email.toLowerCase();
  if (allowedEmails.length === 0 && allowedDomains.length === 0) {
    return true;
  }

  if (allowedEmails.includes(normalized)) {
    return true;
  }

  const domain = normalized.split("@")[1] ?? "";
  return allowedDomains.includes(domain);
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? ""
    })
  ],
  pages: {
    signIn: "/signin"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedEmail(user.email);
    }
  }
};
