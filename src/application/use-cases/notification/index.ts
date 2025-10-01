/**
 * @fileoverview Notification Use Cases Index
 * @module Application/UseCases/Notification
 * @version 1.0.0
 */

// Use Cases d'envoi et gestion des notifications
export { SendNotificationUseCase } from "./send-notification.use-case";
export { SendBulkNotificationUseCase } from "./send-bulk-notification.use-case";

// Use Cases de lecture et consultation
export { ListNotificationsUseCase } from "./list-notifications.use-case";
export { GetNotificationByIdUseCase } from "./get-notification-by-id.use-case";

// Use Cases de gestion du cycle de vie
export { MarkNotificationAsReadUseCase } from "./mark-notification-as-read.use-case";
export { DeleteNotificationUseCase } from "./delete-notification.use-case";

// Use Cases d'analytics et statistiques
export { GetNotificationAnalyticsUseCase } from "./get-notification-analytics.use-case";

// Interfaces et types partagés
export type {
  SendNotificationRequest,
  SendNotificationResponse,
} from "./send-notification.use-case";

export type {
  SendBulkNotificationRequest,
  SendBulkNotificationResponse,
} from "./send-bulk-notification.use-case";

export type {
  ListNotificationsRequest,
  ListNotificationsResponse,
  ListNotificationsFilters,
} from "./list-notifications.use-case";

export type {
  GetNotificationByIdRequest,
  GetNotificationByIdResponse,
} from "./get-notification-by-id.use-case";

export type {
  MarkNotificationAsReadRequest,
  MarkNotificationAsReadResponse,
} from "./mark-notification-as-read.use-case";

export type {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
} from "./delete-notification.use-case";

export type {
  GetNotificationAnalyticsRequest,
  GetNotificationAnalyticsResponse,
  AnalyticsDateRange,
  AnalyticsOptions,
  HourlyAnalytics,
  DayOfWeekAnalytics,
  DeliveryTimeAnalytics,
  RetryAnalytics,
} from "./get-notification-analytics.use-case";
