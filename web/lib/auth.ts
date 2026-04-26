import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

function getEnv(name: string) {
  return (process.env[name] ?? "").trim().replace(/^"(.*)"$/, "$1");
}

function parseCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const allowedEmails = parseCsv(process.env.ALLOWED_EMAILS);
const allowedDomains = parseCsv(process.env.ALLOWED_EMAIL_DOMAINS);
const azureClientId = getEnv("AZURE_AD_CLIENT_ID");
const azureClientSecret = getEnv("AZURE_AD_CLIENT_SECRET");
const azureTenantId = getEnv("AZURE_AD_TENANT_ID");
const isAzureConfigured = Boolean(azureClientId && azureClientSecret && azureTenantId);

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
  providers: isAzureConfigured
    ? [
        AzureADProvider({
          clientId: azureClientId,
          clientSecret: azureClientSecret,
          tenantId: azureTenantId,
          client: {
            token_endpoint_auth_method: "client_secret_post"
          }
        })
      ]
    : [],
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      console.error("[next-auth][logger][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][logger][warn]", code);
    }
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedEmail(user.email);
    }
  }
};
