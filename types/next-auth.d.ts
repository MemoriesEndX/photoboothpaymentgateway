declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Add role to session user
      role?: string | null;
    };
  }

  interface User {
    // Add role to User type returned by your adapter or authorize
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
  }
}
