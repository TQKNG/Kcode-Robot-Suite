import { isNonEmptyString } from "@kcode/shared";

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export class PermissionDeniedError extends PermissionError {
  constructor(readonly subjectId: string, readonly permissionId: string) {
    super(`Subject "${subjectId}" does not have permission "${permissionId}".`);
    this.name = "PermissionDeniedError";
  }
}

/** Domain-neutral grants. Permission identifiers are declared by plugins. */
export class PermissionService {
  private readonly grantsBySubject = new Map<string, Set<string>>();

  constructor(private readonly administratorPermission = "platform.admin") {
    this.assertIdentifier(administratorPermission, "administrator permission");
  }

  grant(subjectId: string, permissionId: string): void {
    this.assertSubjectAndPermission(subjectId, permissionId);
    const grants = this.grantsBySubject.get(subjectId) ?? new Set<string>();
    grants.add(permissionId);
    this.grantsBySubject.set(subjectId, grants);
  }

  revoke(subjectId: string, permissionId: string): boolean {
    this.assertSubjectAndPermission(subjectId, permissionId);
    const grants = this.grantsBySubject.get(subjectId);
    const removed = grants?.delete(permissionId) ?? false;
    if (grants?.size === 0) this.grantsBySubject.delete(subjectId);
    return removed;
  }

  replace(subjectId: string, permissionIds: readonly string[]): void {
    this.assertIdentifier(subjectId, "subject id");
    for (const permissionId of permissionIds) this.assertIdentifier(permissionId, "permission id");
    this.grantsBySubject.set(subjectId, new Set(permissionIds));
  }

  clear(subjectId: string): boolean {
    this.assertIdentifier(subjectId, "subject id");
    return this.grantsBySubject.delete(subjectId);
  }

  has(subjectId: string, permissionId: string): boolean {
    this.assertSubjectAndPermission(subjectId, permissionId);
    const grants = this.grantsBySubject.get(subjectId);
    return grants?.has(this.administratorPermission) === true || grants?.has(permissionId) === true;
  }

  hasAll(subjectId: string, permissionIds: readonly string[]): boolean {
    return permissionIds.every((permissionId) => this.has(subjectId, permissionId));
  }

  hasAny(subjectId: string, permissionIds: readonly string[]): boolean {
    return permissionIds.some((permissionId) => this.has(subjectId, permissionId));
  }

  assert(subjectId: string, permissionId: string): void {
    if (!this.has(subjectId, permissionId)) throw new PermissionDeniedError(subjectId, permissionId);
  }

  getGrantedPermissions(subjectId: string): readonly string[] {
    this.assertIdentifier(subjectId, "subject id");
    return Object.freeze([...(this.grantsBySubject.get(subjectId) ?? [])].sort());
  }

  private assertSubjectAndPermission(subjectId: string, permissionId: string): void {
    this.assertIdentifier(subjectId, "subject id");
    this.assertIdentifier(permissionId, "permission id");
  }

  private assertIdentifier(value: string, label: string): void {
    if (!isNonEmptyString(value)) throw new PermissionError(`A non-empty ${label} is required.`);
  }
}
