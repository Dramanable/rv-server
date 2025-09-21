import {
  Appointment,
  AppointmentId,
  AppointmentStatus,
  AppointmentType,
  NotificationMethod,
} from '@domain/entities/appointment.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { TimeSlot } from '@domain/value-objects/time-slot.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { AppointmentOrmEntity } from '@infrastructure/database/sql/postgresql/entities/appointment-orm.entity';

/**
 * Mapper dédié pour la conversion entre entités Domain Appointment et ORM AppointmentOrmEntity
 * Respecte les principes de Clean Architecture en séparant les responsabilités
 */
export class AppointmentOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: Appointment): AppointmentOrmEntity {
    const orm = new AppointmentOrmEntity();

    // Identifiants et références
    orm.id = domain.id.getValue();
    orm.business_id = domain.businessId.getValue();
    orm.calendar_id = domain.calendarId.getValue();
    orm.service_id = domain.serviceId.getValue();
    orm.assigned_staff_id = domain.assignedStaffId?.getValue() || undefined;
    orm.parent_appointment_id =
      domain.parentAppointmentId?.getValue() || undefined;

    // Informations client
    orm.client_first_name = domain.clientInfo.firstName;
    orm.client_last_name = domain.clientInfo.lastName;
    orm.client_email = domain.clientInfo.email.getValue();
    orm.client_phone = domain.clientInfo.phone?.getValue() || undefined;
    orm.client_date_of_birth = domain.clientInfo.dateOfBirth || undefined;
    orm.client_notes = domain.clientInfo.notes || undefined;
    orm.is_new_client = domain.clientInfo.isNewClient;

    // Informations temporelles
    orm.start_time = domain.timeSlot.getStartTime();
    orm.end_time = domain.timeSlot.getEndTime();

    // Type et statut
    orm.type = domain.type;
    orm.status = domain.status;
    orm.title = domain.title || undefined;
    orm.description = domain.description || undefined;

    // Informations financières
    orm.base_price_amount = domain.pricing.basePrice.getAmount();
    orm.base_price_currency = domain.pricing.basePrice.getCurrency();
    orm.total_amount = domain.pricing.totalAmount.getAmount();
    orm.total_currency = domain.pricing.totalAmount.getCurrency();
    orm.payment_status = domain.pricing.paymentStatus;
    orm.payment_method = domain.pricing.paymentMethod || undefined;
    orm.discounts = domain.pricing.discounts || undefined;
    orm.taxes =
      domain.pricing.taxes?.map((tax) => ({
        name: tax.name,
        rate: tax.rate,
        amount: tax.amount.getAmount(),
        currency: tax.amount.getCurrency(),
      })) || undefined;

    // Notes (conversion des AppointmentNote vers format JSON)
    orm.notes =
      domain.notes?.map((note) => ({
        id: note.id,
        author_id: note.authorId.getValue(),
        content: note.content,
        is_private: note.isPrivate,
        created_at: note.createdAt.toISOString(),
        updated_at: note.updatedAt?.toISOString(),
      })) || undefined;

    // Reminders (conversion des AppointmentReminder vers format JSON)
    orm.reminders =
      domain.reminders?.map((reminder) => ({
        method: reminder.method,
        scheduled_for: reminder.scheduledFor.toISOString(),
        sent: reminder.sent,
        sent_at: reminder.sentAt?.toISOString(),
        template: reminder.template,
      })) || undefined;

    // Métadonnées
    if (domain.metadata) {
      orm.source = domain.metadata.source;
      orm.user_agent = domain.metadata.userAgent || undefined;
      orm.ip_address = domain.metadata.ipAddress || undefined;
      orm.referral_source = domain.metadata.referralSource || undefined;
      orm.tags = domain.metadata.tags || undefined;
      orm.custom_fields = domain.metadata.customFields || undefined;
    }

    // Pattern récurrent (TODO: à implémenter selon la structure ORM)
    // orm.recurring_frequency = domain.recurringPattern?.frequency;
    // orm.recurring_interval = domain.recurringPattern?.interval;
    // orm.recurring_end_date = domain.recurringPattern?.endDate;
    // orm.recurring_occurrences = domain.recurringPattern?.occurrences;

    // Dates système
    orm.created_at = domain.createdAt;
    if (domain.updatedAt) {
      orm.updated_at = domain.updatedAt;
    }

    return orm;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: AppointmentOrmEntity): Appointment {
    // Reconstruction des Value Objects
    const appointmentId = AppointmentId.create(orm.id);
    const businessId = BusinessId.create(orm.business_id);
    const calendarId = CalendarId.create(orm.calendar_id);
    const serviceId = ServiceId.create(orm.service_id);
    const assignedStaffId = orm.assigned_staff_id
      ? UserId.create(orm.assigned_staff_id)
      : undefined;
    const parentAppointmentId = orm.parent_appointment_id
      ? AppointmentId.create(orm.parent_appointment_id)
      : undefined;

    // Reconstruction du TimeSlot
    const timeSlot = TimeSlot.create(orm.start_time, orm.end_time);

    // Reconstruction des informations client
    const clientInfo = {
      firstName: orm.client_first_name,
      lastName: orm.client_last_name,
      email: Email.create(orm.client_email),
      phone: orm.client_phone ? Phone.create(orm.client_phone) : undefined,
      dateOfBirth: orm.client_date_of_birth || undefined,
      notes: orm.client_notes || undefined,
      isNewClient: orm.is_new_client,
    };

    // Reconstruction des informations de pricing
    const basePrice = Money.create(
      orm.base_price_amount,
      orm.base_price_currency,
    );
    const totalAmount = Money.create(orm.total_amount, orm.total_currency);

    const pricing = {
      basePrice,
      discounts: orm.discounts || undefined,
      taxes:
        orm.taxes?.map((tax) => ({
          name: tax.name,
          rate: tax.rate,
          amount: Money.create(tax.amount, tax.currency),
        })) || undefined,
      totalAmount,
      paymentStatus: orm.payment_status as
        | 'PENDING'
        | 'PAID'
        | 'PARTIAL'
        | 'REFUNDED',
      paymentMethod: orm.payment_method || undefined,
    };

    // Reconstruction des notes
    const notes =
      orm.notes?.map((note) => ({
        id: note.id,
        authorId: UserId.create(note.author_id),
        content: note.content,
        isPrivate: note.is_private,
        createdAt: new Date(note.created_at),
        updatedAt: note.updated_at ? new Date(note.updated_at) : undefined,
      })) || undefined;

    // Reconstruction des reminders
    const reminders =
      orm.reminders?.map((reminder) => ({
        method: NotificationMethod[reminder.method],
        scheduledFor: new Date(reminder.scheduled_for),
        sent: reminder.sent,
        sentAt: reminder.sent_at ? new Date(reminder.sent_at) : undefined,
        template: reminder.template,
      })) || undefined;

    // Reconstruction des métadonnées
    const metadata = {
      source: orm.source as 'ONLINE' | 'PHONE' | 'WALK_IN' | 'ADMIN',
      userAgent: orm.user_agent || undefined,
      ipAddress: orm.ip_address || undefined,
      referralSource: orm.referral_source || undefined,
      tags: orm.tags || undefined,
      customFields: orm.custom_fields || undefined,
    };

    // Reconstruction de l'entité Domain avec le constructeur
    return new Appointment(
      appointmentId,
      businessId,
      calendarId,
      serviceId,
      timeSlot,
      clientInfo,
      AppointmentType[orm.type as keyof typeof AppointmentType],
      AppointmentStatus[orm.status as keyof typeof AppointmentStatus],
      pricing,
      assignedStaffId,
      orm.title || undefined,
      orm.description || undefined,
      notes,
      reminders,
      metadata,
      parentAppointmentId,
      undefined, // recurringPattern - TODO: à implémenter
      orm.created_at,
      orm.updated_at || undefined,
    );
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(ormEntities: AppointmentOrmEntity[]): Appointment[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit liste Domain vers ORM
   */
  static toOrmEntities(domainEntities: Appointment[]): AppointmentOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
