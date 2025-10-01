/**
 * 🚨 PROSPECT EXCEPTIONS - Domain Layer
 * ✅ Clean Architecture - Pure Domain Exceptions
 * ✅ Exceptions spécifiques aux prospects commerciaux
 */

import { DomainException } from "@domain/exceptions/domain.exception";

export class ProspectException extends DomainException {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, code || "PROSPECT_ERROR", metadata);
  }
}

export class ProspectValidationError extends ProspectException {
  constructor(message: string, field?: string) {
    super(message, "PROSPECT_VALIDATION_ERROR", { field });
  }
}

export class ProspectNotFoundError extends ProspectException {
  constructor(prospectId: string) {
    super(`Prospect with ID ${prospectId} not found`, "PROSPECT_NOT_FOUND", {
      prospectId,
    });
  }
}

export class ProspectStatusTransitionError extends ProspectException {
  constructor(fromStatus: string, toStatus: string) {
    super(
      `Cannot transition prospect from ${fromStatus} to ${toStatus}`,
      "PROSPECT_STATUS_TRANSITION_ERROR",
      { fromStatus, toStatus },
    );
  }
}

export class ProspectPermissionError extends ProspectException {
  constructor(userId: string, action: string, prospectId?: string) {
    super(
      `User ${userId} does not have permission to ${action} prospect${prospectId ? ` ${prospectId}` : ""}`,
      "PROSPECT_PERMISSION_ERROR",
      { userId, action, prospectId },
    );
  }
}

export class ProspectAssignmentError extends ProspectException {
  constructor(prospectId: string, salesRepId: string, reason: string) {
    super(
      `Cannot assign prospect ${prospectId} to sales rep ${salesRepId}: ${reason}`,
      "PROSPECT_ASSIGNMENT_ERROR",
      { prospectId, salesRepId, reason },
    );
  }
}

export class ProspectBusinessRuleError extends ProspectException {
  constructor(rule: string, prospectId?: string) {
    super(
      `Business rule violation: ${rule}${prospectId ? ` (Prospect: ${prospectId})` : ""}`,
      "PROSPECT_BUSINESS_RULE_ERROR",
      { rule, prospectId },
    );
  }
}
