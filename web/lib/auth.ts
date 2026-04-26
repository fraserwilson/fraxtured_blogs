import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

function getRequiredEnv(name: string) {
  const raw = process.env[name];
  const normalized = (raw ?? "").trim().replace(/^"(.*)"$/, "$1");
  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalized;
}

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
      clientId: getRequiredEnv("AZURE_AD_CLIENT_ID"),
      clientSecret: getRequiredEnv("AZURE_AD_CLIENT_SECRET"),
      tenantId: getRequiredEnv("AZURE_AD_TENANT_ID"),
      client: {
        token_endpoint_auth_method: "client_secret_post"
      }
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
