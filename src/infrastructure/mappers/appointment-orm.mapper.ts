import { Appointment } from '@domain/entities/appointment.entity';
import { AppointmentOrmEntity } from '@infrastructure/database/sql/postgresql/entities/appointment-orm.entity';

export class AppointmentOrmMapper {
  static toOrmEntity(domain: Appointment): AppointmentOrmEntity {
    const orm = new AppointmentOrmEntity();
    orm.id = domain.getId().getValue();
    orm.business_id = domain.getBusinessId().getValue();
    // orm.calendar_id = domain.getCalendarId()?.getValue(); // TODO: Vérifier si getCalendarId existe
    orm.service_id = domain.getServiceId().getValue();

    const clientInfo = domain.clientInfo; // ✅ Propriété directe selon entité
    orm.client_first_name = clientInfo.firstName;
    orm.client_last_name = clientInfo.lastName;
    orm.client_email = clientInfo.email.getValue();
    orm.client_phone = clientInfo.phone?.getValue();
    // orm.client_notes = clientInfo.notes; // TODO: notes n'existe pas dans ClientInfo
    // orm.is_new_client = clientInfo.isNewClient; // TODO: isNewClient n'existe pas dans ClientInfo

    // ✅ Utiliser les getters publics pour accéder aux propriétés de TimeSlot
    orm.start_time = domain.timeSlot.getStartTime();
    orm.end_time = domain.timeSlot.getEndTime();
    orm.status = domain.status; // ✅ Propriété directe

    const pricing = domain.pricing; // ✅ Propriété directe
    orm.base_price_amount = pricing.basePrice.getAmount();
    orm.base_price_currency = pricing.basePrice.getCurrency();
    orm.total_amount = pricing.totalAmount.getAmount();
    orm.total_currency = pricing.totalAmount.getCurrency();
    orm.payment_status = pricing.paymentStatus;

    // ✅ Pas de champ assignedStaffId dans l'entité Appointment actuelle
    // orm.assigned_staff_id = null; // Valeur par défaut pour compatibilité ORM

    // TODO: title et description ne sont pas dans l'entité Appointment domain
    // orm.title = domain.getTitle(); // ❌ N'existe pas
    // orm.description = domain.getDescription(); // ❌ N'existe pas

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
