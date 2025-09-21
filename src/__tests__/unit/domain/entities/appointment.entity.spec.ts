import {
  Appointment,
  AppointmentId,
  AppointmentPricing,
  AppointmentStatus,
  AppointmentType,
  ClientInfo,
} from '@domain/entities/appointment.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import {
  TimeSlot,
  TimeSlotStatus,
} from '@domain/value-objects/time-slot.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';

describe('Appointment Entity', () => {
  let mockBusinessId: BusinessId;
  let mockCalendarId: CalendarId;
  let mockServiceId: ServiceId;
  let mockTimeSlot: TimeSlot;
  let mockClientInfo: ClientInfo;
  let mockPricing: AppointmentPricing;

  beforeEach(() => {
    mockBusinessId = BusinessId.generate();
    mockCalendarId = CalendarId.generate();
    mockServiceId = ServiceId.generate();

    // TimeSlot de 1 heure dans le futur
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1h
    mockTimeSlot = TimeSlot.create(
      startTime,
      endTime,
      TimeSlotStatus.AVAILABLE,
    );

    mockClientInfo = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: Email.create('jean.dupont@example.com'),
      phone: Phone.create('+33123456789'),
      isNewClient: false,
    };

    mockPricing = {
      basePrice: Money.create(50, 'EUR'),
      totalAmount: Money.create(50, 'EUR'),
      paymentStatus: 'PENDING' as const,
    };
  });

  describe('AppointmentId Value Object', () => {
    it('should create valid AppointmentId', () => {
      // WHEN
      const appointmentId = AppointmentId.generate();

      // THEN
      expect(appointmentId).toBeInstanceOf(AppointmentId);
      expect(appointmentId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should throw error for empty AppointmentId', () => {
      // WHEN & THEN
      expect(() => AppointmentId.create('')).toThrow(
        'AppointmentId cannot be empty',
      );
      expect(() => AppointmentId.create('   ')).toThrow(
        'AppointmentId cannot be empty',
      );
    });

    it('should support equality comparison', () => {
      // GIVEN
      const id1 = AppointmentId.create('550e8400-e29b-41d4-a716-446655440000');
      const id2 = AppointmentId.create('550e8400-e29b-41d4-a716-446655440000');
      const id3 = AppointmentId.create('550e8400-e29b-41d4-a716-446655440001');

      // WHEN & THEN
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('Appointment Entity Creation', () => {
    it('should create appointment with valid data', () => {
      // WHEN
      const appointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
      });

      // THEN
      expect(appointment).toBeInstanceOf(Appointment);
      expect(appointment.id).toBeInstanceOf(AppointmentId);
      expect(appointment.businessId).toBe(mockBusinessId);
      expect(appointment.calendarId).toBe(mockCalendarId);
      expect(appointment.serviceId).toBe(mockServiceId);
      expect(appointment.timeSlot).toBe(mockTimeSlot);
      expect(appointment.clientInfo).toBe(mockClientInfo);
      expect(appointment.type).toBe(AppointmentType.CONSULTATION);
      expect(appointment.status).toBe(AppointmentStatus.REQUESTED);
      expect(appointment.pricing).toBe(mockPricing);
      expect(appointment.createdAt).toBeInstanceOf(Date);
    });

    it('should create appointment with optional fields', () => {
      // GIVEN
      const assignedStaffId = UserId.generate();
      const title = 'Consultation de routine';
      const description = 'Contrôle annuel';

      // WHEN
      const appointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
        assignedStaffId,
        title,
        description,
      });

      // THEN
      expect(appointment.assignedStaffId).toBe(assignedStaffId);
      expect(appointment.title).toBe(title);
      expect(appointment.description).toBe(description);
    });
  });

  describe('Appointment Status Transitions', () => {
    let appointment: Appointment;

    beforeEach(() => {
      appointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
      });
    });

    describe('confirm()', () => {
      it('should confirm requested appointment', () => {
        // WHEN
        const confirmedAppointment = appointment.confirm();

        // THEN
        expect(confirmedAppointment.status).toBe(AppointmentStatus.CONFIRMED);
        expect(confirmedAppointment.updatedAt).toBeInstanceOf(Date);
        expect(confirmedAppointment.id).toBe(appointment.id);
      });

      it('should throw error when confirming non-requested appointment', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();

        // WHEN & THEN
        expect(() => confirmedAppointment.confirm()).toThrow(
          'Cannot confirm appointment with status CONFIRMED',
        );
      });
    });

    describe('cancel()', () => {
      it('should cancel requested appointment', () => {
        // WHEN
        const cancelledAppointment = appointment.cancel('Client annulé');

        // THEN
        expect(cancelledAppointment.status).toBe(AppointmentStatus.CANCELLED);
        expect(cancelledAppointment.notes).toHaveLength(1);
        expect(cancelledAppointment.notes![0].content).toContain(
          'Client annulé',
        );
        expect(cancelledAppointment.updatedAt).toBeInstanceOf(Date);
      });

      it('should cancel confirmed appointment', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();

        // WHEN
        const cancelledAppointment = confirmedAppointment.cancel('Urgence');

        // THEN
        expect(cancelledAppointment.status).toBe(AppointmentStatus.CANCELLED);
      });

      it('should throw error when cancelling already cancelled appointment', () => {
        // GIVEN
        const cancelledAppointment = appointment.cancel();

        // WHEN & THEN
        expect(() => cancelledAppointment.cancel()).toThrow(
          'Cannot cancel appointment with status CANCELLED',
        );
      });

      it('should throw error when cancelling completed appointment', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();
        const completedAppointment = confirmedAppointment.complete();

        // WHEN & THEN
        expect(() => completedAppointment.cancel()).toThrow(
          'Cannot cancel appointment with status COMPLETED',
        );
      });
    });

    describe('complete()', () => {
      it('should complete confirmed appointment', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();

        // WHEN
        const completedAppointment = confirmedAppointment.complete();

        // THEN
        expect(completedAppointment.status).toBe(AppointmentStatus.COMPLETED);
        expect(completedAppointment.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error when completing non-confirmed appointment', () => {
        // WHEN & THEN
        expect(() => appointment.complete()).toThrow(
          'Cannot complete appointment with status REQUESTED',
        );
      });
    });
  });

  describe('Appointment Business Logic', () => {
    let appointment: Appointment;

    beforeEach(() => {
      appointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
      });
    });

    describe('addNote()', () => {
      it('should add note to appointment', () => {
        // GIVEN
        const authorId = UserId.generate();
        const noteContent = 'Client très ponctuel';

        // WHEN
        const appointmentWithNote = appointment.addNote({
          authorId,
          content: noteContent,
          isPrivate: false,
        });

        // THEN
        expect(appointmentWithNote.notes).toHaveLength(1);
        expect(appointmentWithNote.notes![0].content).toBe(noteContent);
        expect(appointmentWithNote.notes![0].authorId).toBe(authorId);
        expect(appointmentWithNote.notes![0].isPrivate).toBe(false);
        expect(appointmentWithNote.notes![0].id).toBeDefined();
        expect(appointmentWithNote.notes![0].createdAt).toBeInstanceOf(Date);
      });

      it('should add multiple notes to appointment', () => {
        // GIVEN
        const authorId = UserId.generate();
        const note1 = { authorId, content: 'Première note', isPrivate: false };
        const note2 = { authorId, content: 'Deuxième note', isPrivate: true };

        // WHEN
        const appointmentWith2Notes = appointment.addNote(note1).addNote(note2);

        // THEN
        expect(appointmentWith2Notes.notes).toHaveLength(2);
        expect(appointmentWith2Notes.notes![0].content).toBe('Première note');
        expect(appointmentWith2Notes.notes![1].content).toBe('Deuxième note');
        expect(appointmentWith2Notes.notes![1].isPrivate).toBe(true);
      });
    });

    describe('canBeModified()', () => {
      it('should allow modification for REQUESTED status', () => {
        // WHEN & THEN
        expect(appointment.canBeModified()).toBe(true);
      });

      it('should allow modification for CONFIRMED status', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();

        // WHEN & THEN
        expect(confirmedAppointment.canBeModified()).toBe(true);
      });

      it('should not allow modification for CANCELLED status', () => {
        // GIVEN
        const cancelledAppointment = appointment.cancel();

        // WHEN & THEN
        expect(cancelledAppointment.canBeModified()).toBe(false);
      });

      it('should not allow modification for COMPLETED status', () => {
        // GIVEN
        const confirmedAppointment = appointment.confirm();
        const completedAppointment = confirmedAppointment.complete();

        // WHEN & THEN
        expect(completedAppointment.canBeModified()).toBe(false);
      });
    });

    describe('isFuture()', () => {
      it('should return true for future appointment', () => {
        // WHEN & THEN (mockTimeSlot is set to +24h in beforeEach)
        expect(appointment.isFuture()).toBe(true);
      });

      it('should return false for past appointment', () => {
        // GIVEN - Créer un créneau dans le passé
        const pastStart = new Date(Date.now() - 24 * 60 * 60 * 1000); // -24h
        const pastEnd = new Date(pastStart.getTime() + 60 * 60 * 1000); // +1h
        const pastTimeSlot = TimeSlot.create(pastStart, pastEnd);

        const pastAppointment = Appointment.create({
          businessId: mockBusinessId,
          calendarId: mockCalendarId,
          serviceId: mockServiceId,
          timeSlot: pastTimeSlot,
          clientInfo: mockClientInfo,
          type: AppointmentType.CONSULTATION,
          pricing: mockPricing,
        });

        // WHEN & THEN
        expect(pastAppointment.isFuture()).toBe(false);
      });
    });

    describe('getDurationMinutes()', () => {
      it('should calculate duration correctly', () => {
        // WHEN & THEN (mockTimeSlot is 1 hour duration)
        expect(appointment.getDurationMinutes()).toBe(60);
      });

      it('should calculate duration for different time slots', () => {
        // GIVEN - Créer un créneau de 30 minutes
        const start = new Date();
        const end = new Date(start.getTime() + 30 * 60 * 1000); // +30min
        const shortTimeSlot = TimeSlot.create(start, end);

        const shortAppointment = Appointment.create({
          businessId: mockBusinessId,
          calendarId: mockCalendarId,
          serviceId: mockServiceId,
          timeSlot: shortTimeSlot,
          clientInfo: mockClientInfo,
          type: AppointmentType.CONSULTATION,
          pricing: mockPricing,
        });

        // WHEN & THEN
        expect(shortAppointment.getDurationMinutes()).toBe(30);
      });
    });
  });

  describe('Appointment Immutability', () => {
    it('should create new instance when confirming', () => {
      // GIVEN
      const originalAppointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
      });

      // WHEN
      const confirmedAppointment = originalAppointment.confirm();

      // THEN
      expect(confirmedAppointment).not.toBe(originalAppointment);
      expect(originalAppointment.status).toBe(AppointmentStatus.REQUESTED);
      expect(confirmedAppointment.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should create new instance when adding note', () => {
      // GIVEN
      const originalAppointment = Appointment.create({
        businessId: mockBusinessId,
        calendarId: mockCalendarId,
        serviceId: mockServiceId,
        timeSlot: mockTimeSlot,
        clientInfo: mockClientInfo,
        type: AppointmentType.CONSULTATION,
        pricing: mockPricing,
      });

      // WHEN
      const appointmentWithNote = originalAppointment.addNote({
        authorId: UserId.generate(),
        content: 'Test note',
        isPrivate: false,
      });

      // THEN
      expect(appointmentWithNote).not.toBe(originalAppointment);
      expect(originalAppointment.notes || []).toHaveLength(0);
      expect(appointmentWithNote.notes).toHaveLength(1);
    });
  });
});
