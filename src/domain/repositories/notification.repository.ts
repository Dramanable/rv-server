import { Notification } from "../entities/notification.entity";
import { NotificationStatus } from "../value-objects/notification-status.value-object";

/**
 * Interface du repository de notifications (PORT)
 *
 * Cette interface définit le contrat que doit respecter toute implémentation
 * de persistence pour les notifications.
 *
 * Elle appartient à la couche Domain car elle exprime les besoins métier
 * sans se préoccuper des détails techniques d'implémentation.
 */
export interface INotificationRepository {
  /**
   * Sauvegarde une notification
   * @param notification L'entité notification à sauvegarder
   * @returns Les informations de la notification sauvegardée (id et statut)
   */
  save(
    notification: Notification,
  ): Promise<{ id: string; status: NotificationStatus }>;

  /**
   * Trouve une notification par son identifiant
   * @param id L'identifiant unique de la notification
   * @returns La notification trouvée ou null si elle n'existe pas
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Trouve toutes les notifications d'un destinataire donné
   * @param recipientId L'identifiant du destinataire
   * @returns La liste des notifications du destinataire
   */
  findByRecipient(recipientId: string): Promise<Notification[]>;

  /**
   * Trouve les notifications ayant un statut donné
   * @param status Le statut des notifications à rechercher
   * @returns La liste des notifications avec le statut spécifié
   */
  findByStatus(status: NotificationStatus): Promise<Notification[]>;

  /**
   * Met à jour le statut d'une notification
   * @param id L'identifiant de la notification
   * @param status Le nouveau statut
   * @returns La notification mise à jour
   * @throws Error si la notification n'existe pas
   */
  updateStatus(id: string, status: NotificationStatus): Promise<Notification>;

  /**
   * Supprime une notification
   * @param id L'identifiant de la notification à supprimer
   * @throws Error si la notification n'existe pas
   */
  delete(id: string): Promise<void>;

  /**
   * Compte le nombre total de notifications
   * @returns Le nombre total de notifications
   */
  count(): Promise<number>;

  /**
   * Compte les notifications d'un destinataire donné
   * @param recipientId L'identifiant du destinataire
   * @returns Le nombre de notifications du destinataire
   */
  countByRecipient(recipientId: string): Promise<number>;

  /**
   * Trouve les notifications en attente plus anciennes qu'une date donnée
   * Utile pour les tâches de nettoyage ou de retry
   * @param cutoffDate La date de coupure
   * @returns Les notifications en attente anciennes
   */
  findPendingOlderThan(cutoffDate: Date): Promise<Notification[]>;
}
