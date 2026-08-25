import type { AuthenticatedUser, AuthService } from "@kcode/plugin-sdk";

export interface SignInInput {
  readonly username: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export interface SignInResult {
  readonly user: AuthenticatedUser;
}

export interface MutableAuthService extends AuthService {
  signIn(input: SignInInput): Promise<SignInResult>;
  signOut(): Promise<void>;
}

export interface CredentialValidator {
  validate(username: string, password: string): Promise<AuthenticatedUser | null>;
}

export interface AuthSessionStore {
  get(): AuthenticatedUser | null;
  set(user: AuthenticatedUser, remember: boolean): void;
  clear(): void;
}

export type AuthenticationErrorCode = "INVALID_CREDENTIALS" | "INVALID_REQUEST";

export class AuthenticationError extends Error {
  constructor(message: string, readonly code: AuthenticationErrorCode) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export interface DemoAuthOptions {
  readonly validator?: CredentialValidator;
  readonly sessions?: AuthSessionStore;
}

/** Development-only authentication implementation. Replace either boundary for production. */
export class DemoAuthService implements MutableAuthService {
  private readonly validator: CredentialValidator;
  private readonly sessions: AuthSessionStore;

  constructor(options: DemoAuthOptions = {}) {
    this.validator = options.validator ?? new DemoCredentialValidator();
    this.sessions = options.sessions ?? new InMemoryAuthSessionStore();
  }

  async signIn(input: SignInInput): Promise<SignInResult> {
    if (!input.username.trim() || !input.password) {
      throw new AuthenticationError("Username and password are required.", "INVALID_REQUEST");
    }
    const user = await this.validator.validate(input.username, input.password);
    if (!user) throw new AuthenticationError("Invalid username or password.", "INVALID_CREDENTIALS");
    const snapshot = snapshotUser(user);
    this.sessions.set(snapshot, input.rememberMe === true);
    return Object.freeze({ user: snapshotUser(snapshot) });
  }

  async signOut(): Promise<void> {
    this.sessions.clear();
  }

  getCurrentUser(): AuthenticatedUser | null {
    const user = this.sessions.get();
    return user && snapshotUser(user);
  }

  isAuthenticated(): boolean {
    return this.sessions.get() !== null;
  }

  hasPermission(permissionId: string): boolean {
    const permissions = this.sessions.get()?.permissions;
    return permissions?.includes("platform.admin") === true || permissions?.includes(permissionId) === true;
  }
}

export class InMemoryAuthSessionStore implements AuthSessionStore {
  private user: AuthenticatedUser | null = null;

  get(): AuthenticatedUser | null { return this.user && snapshotUser(this.user); }
  set(user: AuthenticatedUser): void { this.user = snapshotUser(user); }
  clear(): void { this.user = null; }
}

class DemoCredentialValidator implements CredentialValidator {
  async validate(username: string, password: string): Promise<AuthenticatedUser | null> {
    if (username !== "admin" || password !== "admin") return null;
    return snapshotUser({
      id: "demo-admin",
      username: "admin",
      displayName: "Demo Administrator",
      permissions: ["platform.admin"],
    });
  }
}

function snapshotUser(user: AuthenticatedUser): AuthenticatedUser {
  return Object.freeze({ ...user, permissions: Object.freeze([...user.permissions]) });
}
