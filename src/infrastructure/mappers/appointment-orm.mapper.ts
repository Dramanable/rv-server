import {
  Appointment,
  ClientInfo,
  AppointmentPricing,
  AppointmentMetadata,
} from '@domain/entities/appointment.entity';
import { AppointmentId } from '@domain/value-objects/appointment-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { AppointmentOrmEntity } from '@infrastructure/database/sql/postgresql/entities/appointment-orm.entity';

export class AppointmentOrmMapper {
  static toOrmEntity(domain: Appointment): AppointmentOrmEntity {
    const orm = new AppointmentOrmEntity();
    orm.id = domain.getId().getValue();
    orm.business_id = domain.getBusinessId().getValue();
    orm.calendar_id = domain.getCalendarId().getValue();
    orm.service_id = domain.getServiceId().getValue();

    const clientInfo = domain.getClientInfo();
    orm.client_first_name = clientInfo.firstName;
    orm.client_last_name = clientInfo.lastName;
    orm.client_email = clientInfo.email.getValue();
    orm.client_phone = clientInfo.phone?.getValue();
    orm.client_notes = clientInfo.notes;
    orm.is_new_client = clientInfo.isNewClient;

    orm.start_time = domain.getScheduledAt();
    orm.end_time = new Date(
      domain.getScheduledAt().getTime() + domain.getDuration() * 60000,
    );
    orm.status = domain.getStatus();

    const pricing = domain.getPricing();
    orm.base_price_amount = pricing.basePrice.getAmount();
    orm.base_price_currency = pricing.basePrice.getCurrency();
    orm.total_amount = pricing.totalAmount.getAmount();
    orm.total_currency = pricing.totalAmount.getCurrency();
    orm.payment_status = pricing.paymentStatus;

    const assignedStaffId = domain.getAssignedStaffId();
    orm.assigned_staff_id = assignedStaffId?.getValue();
    orm.title = domain.getTitle();
    orm.description = domain.getDescription();

    return orm;
  }

  // Méthode temporairement simplifiée pour permettre le build
  static toDomainEntity(orm: AppointmentOrmEntity): Appointment {
    throw new Error(
      'toDomainEntity needs to be implemented when interfaces are aligned',
    );
  }

  static toDomainEntities(ormEntities: AppointmentOrmEntity[]): Appointment[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }
}
