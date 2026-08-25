import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "./session";

export { SESSION_COOKIE, SESSION_VALUE } from "./session";

export async function signedIn() {
  return (await cookies()).get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
