import { describe, expect, it } from "vitest";
import { DemoAuthService } from "./auth/demo-auth-service";

describe("DemoAuthService", () => {
  it("authenticates the demo administrator and establishes a session", async () => {
    const auth = new DemoAuthService();

    const result = await auth.signIn({ username: "admin", password: "admin" });

    expect(result.user).toMatchObject({ id: "demo-admin", username: "admin" });
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.hasPermission("arbitrary.permission")).toBe(true);
    expect(auth.getCurrentUser()).toEqual(result.user);

    await auth.signOut();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it("rejects invalid and incomplete credentials without creating a session", async () => {
    const auth = new DemoAuthService();

    await expect(auth.signIn({ username: "admin", password: "wrong" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    await expect(auth.signIn({ username: "", password: "admin" })).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });
    expect(auth.getCurrentUser()).toBeNull();
  });
});
