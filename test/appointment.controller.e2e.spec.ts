/**
 * 🧪 APPOINTMENTS E2E TESTS - CLEAN ARCHITECTURE COMPLÈTE
 * ✅ Tests d'intégration complets pour toutes les fonctionnalités appointments
 * ✅ Validation Domain → Application → Infrastructure → Presentation
 * ✅ TDD avec règles métier et cas d'erreur
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from '../src/domain/entities/user.entity';
import { AppModule } from '../src/app.module';

describe('🧪 AppointmentController (E2E) - Clean Architecture Flow', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let testUser: User;

  // Test Data - Business Setup
  let businessId: string;
  let calendarId: string;
  let serviceId: string;
  let staffId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get DataSource for direct DB operations
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Setup test environment
    await setupTestEnvironment();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await app.close();
  });

  /**
   * 🔧 SETUP TEST ENVIRONMENT
   * Créer le contexte business complet nécessaire pour les appointments
   */
  async function setupTestEnvironment(): Promise<void> {
    // 1. Create test user and get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      })
      .expect(HttpStatus.OK);

    authToken = loginResponse.body.data.accessToken;
    testUser = loginResponse.body.data.user;

    // 2. Create business
    const businessResponse = await request(app.getHttpServer())
      .post('/businesses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Appointment Business',
        email: 'business@appointment-test.com',
        address: '123 Test Street',
        city: 'Test City',
        country: 'France',
        businessSectorId: 'existing-sector-id',
      })
      .expect(HttpStatus.CREATED);

    businessId = businessResponse.body.data.id;

    // 3. Create calendar
    const calendarResponse = await request(app.getHttpServer())
      .post('/calendars')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Appointment Test Calendar',
        description: 'Calendar for appointment testing',
        businessId: businessId,
        calendarTypeId: 'existing-calendar-type-id',
      })
      .expect(HttpStatus.CREATED);

    calendarId = calendarResponse.body.data.id;

    // 4. Create service with online booking allowed
    const serviceResponse = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        businessId: businessId,
        name: 'Test Consultation Service',
        description: 'Service for appointment testing',
        duration: 60,
        allowOnlineBooking: true, // ✅ CRITICAL: Must allow online booking
        pricingConfig: {
          type: 'FIXED',
          basePrice: { amount: 75.0, currency: 'EUR' },
        },
      })
      .expect(HttpStatus.CREATED);

    serviceId = serviceResponse.body.data.id;

    // 5. Create staff member
    const staffResponse = await request(app.getHttpServer())
      .post('/staff')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        businessId: businessId,
        firstName: 'Dr. Jean',
        lastName: 'Dupont',
        email: 'dr.dupont@test.com',
        specializations: ['General Medicine'],
        isActive: true,
      })
      .expect(HttpStatus.CREATED);

    staffId = staffResponse.body.data.id;
  }

  /**
   * 🧹 CLEANUP TEST DATA
   */
  async function cleanupTestData(): Promise<void> {
    if (dataSource && dataSource.isInitialized) {
      // Clean in reverse dependency order
      await dataSource.query(
        'DELETE FROM appointments WHERE business_id = $1',
        [businessId],
      );
      await dataSource.query('DELETE FROM staff WHERE business_id = $1', [
        businessId,
      ]);
      await dataSource.query('DELETE FROM services WHERE business_id = $1', [
        businessId,
      ]);
      await dataSource.query('DELETE FROM calendars WHERE business_id = $1', [
        businessId,
      ]);
      await dataSource.query('DELETE FROM businesses WHERE id = $1', [
        businessId,
      ]);
    }
  }

  describe('🔍 GET AVAILABLE SLOTS - Domain → Application → Infrastructure → Presentation', () => {
    it('should get available slots successfully with valid service', async () => {
      const getAvailableSlotsDto = {
        businessId,
        calendarId,
        serviceId,
        dateFrom: '2024-01-15T08:00:00Z',
        dateTo: '2024-01-15T18:00:00Z',
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getAvailableSlotsDto)
        .expect(HttpStatus.OK);

      // ✅ Validate response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // ✅ If slots are available, validate structure
      if (response.body.data.length > 0) {
        const slot = response.body.data[0];
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('available', true);
        expect(new Date(slot.startTime)).toBeInstanceOf(Date);
        expect(new Date(slot.endTime)).toBeInstanceOf(Date);
      }
    });

    it('should return 400 for invalid service ID', async () => {
      const invalidDto = {
        businessId,
        calendarId,
        serviceId: 'invalid-uuid',
        dateFrom: '2024-01-15T08:00:00Z',
        dateTo: '2024-01-15T18:00:00Z',
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/available-slots')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/appointments/available-slots')
        .send({ serviceId })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('📅 BOOK APPOINTMENT - Complete Business Flow', () => {
    const validClientInfo = {
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      phone: '+33123456789',
      isNewClient: true,
    };

    it('should book appointment successfully with valid data', async () => {
      const bookingDto = {
        businessId,
        calendarId,
        serviceId,
        startTime: '2024-01-15T14:00:00Z',
        endTime: '2024-01-15T15:00:00Z',
        clientInfo: validClientInfo,
        assignedStaffId: staffId,
        title: 'Consultation générale',
        description: 'Première consultation',
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingDto)
        .expect(HttpStatus.CREATED);

      // ✅ Validate success response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const appointment = response.body.data;
      expect(appointment).toHaveProperty('id');
      expect(appointment).toHaveProperty('status', 'BOOKED');
      expect(appointment).toHaveProperty('startTime', bookingDto.startTime);
      expect(appointment).toHaveProperty('endTime', bookingDto.endTime);
      expect(appointment).toHaveProperty('clientInfo');
      expect(appointment.clientInfo).toMatchObject(validClientInfo);

      // ✅ Validate pricing calculation
      expect(appointment).toHaveProperty('calculatedPrice');
      expect(appointment.calculatedPrice).toHaveProperty('amount', 75.0);
      expect(appointment.calculatedPrice).toHaveProperty('currency', 'EUR');

      // Store appointment ID for subsequent tests
      (global as any).testAppointmentId = appointment.id;
    });

    it('should reject booking for service without online booking allowed', async () => {
      // Create service with allowOnlineBooking: false
      const restrictedServiceResponse = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessId,
          name: 'Restricted Service',
          description: 'No online booking allowed',
          duration: 30,
          allowOnlineBooking: false, // ❌ Online booking disabled
          pricingConfig: {
            type: 'FIXED',
            basePrice: { amount: 50.0, currency: 'EUR' },
          },
        })
        .expect(HttpStatus.CREATED);

      const restrictedServiceId = restrictedServiceResponse.body.data.id;

      const bookingDto = {
        businessId,
        calendarId,
        serviceId: restrictedServiceId,
        startTime: '2024-01-15T16:00:00Z',
        endTime: '2024-01-15T16:30:00Z',
        clientInfo: validClientInfo,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingDto)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      // ✅ Validate business rule error
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('SERVICE_NOT_BOOKABLE_ONLINE');
    });

    it('should validate required client information', async () => {
      const invalidBookingDto = {
        businessId,
        calendarId,
        serviceId,
        startTime: '2024-01-15T15:00:00Z',
        endTime: '2024-01-15T16:00:00Z',
        clientInfo: {
          firstName: '', // ❌ Empty required field
          lastName: 'Martin',
          email: 'invalid-email', // ❌ Invalid email format
        },
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookingDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle time slot conflicts', async () => {
      // Book first appointment
      const firstBooking = {
        businessId,
        calendarId,
        serviceId,
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T11:00:00Z',
        clientInfo: validClientInfo,
        assignedStaffId: staffId,
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(firstBooking)
        .expect(HttpStatus.CREATED);

      // Try to book conflicting appointment
      const conflictingBooking = {
        ...firstBooking,
        startTime: '2024-01-16T10:30:00Z', // ❌ Overlapping time
        endTime: '2024-01-16T11:30:00Z',
        clientInfo: {
          ...validClientInfo,
          email: 'another.client@example.com',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(conflictingBooking)
        .expect(HttpStatus.CONFLICT);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('APPOINTMENT_TIME_CONFLICT');
    });
  });

  describe('📋 LIST APPOINTMENTS - Pagination & Filtering', () => {
    beforeAll(async () => {
      // Create multiple appointments for testing filters and pagination
      const appointments = [
        {
          clientInfo: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@test.com',
          },
          startTime: '2024-01-20T09:00:00Z',
          endTime: '2024-01-20T10:00:00Z',
        },
        {
          clientInfo: {
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@test.com',
          },
          startTime: '2024-01-20T14:00:00Z',
          endTime: '2024-01-20T15:00:00Z',
        },
        {
          clientInfo: {
            firstName: 'Charlie',
            lastName: 'Brown',
            email: 'charlie@test.com',
          },
          startTime: '2024-01-21T11:00:00Z',
          endTime: '2024-01-21T12:00:00Z',
        },
      ];

      for (const appointmentData of appointments) {
        await request(app.getHttpServer())
          .post('/appointments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            businessId,
            calendarId,
            serviceId,
            ...appointmentData,
          })
          .expect(HttpStatus.CREATED);
      }
    });

    it('should list appointments with pagination', async () => {
      const listDto = {
        page: 1,
        limit: 10,
        sortBy: 'startTime',
        sortOrder: 'asc',
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.OK);

      // ✅ Validate pagination response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');

      const { data, meta } = response.body;
      expect(Array.isArray(data)).toBe(true);
      expect(meta).toHaveProperty('currentPage', 1);
      expect(meta).toHaveProperty('totalItems');
      expect(meta).toHaveProperty('totalPages');
      expect(meta).toHaveProperty('itemsPerPage', 10);
      expect(meta).toHaveProperty('hasNextPage');
      expect(meta).toHaveProperty('hasPrevPage', false);

      // ✅ Validate appointment structure
      if (data.length > 0) {
        const appointment = data[0];
        expect(appointment).toHaveProperty('id');
        expect(appointment).toHaveProperty('status');
        expect(appointment).toHaveProperty('startTime');
        expect(appointment).toHaveProperty('endTime');
        expect(appointment).toHaveProperty('clientInfo');
        expect(appointment).toHaveProperty('service');
      }
    });

    it('should filter appointments by date range', async () => {
      const listDto = {
        dateFrom: '2024-01-20T00:00:00Z',
        dateTo: '2024-01-20T23:59:59Z',
        page: 1,
        limit: 20,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.OK);

      // ✅ All returned appointments should be within date range
      const { data } = response.body;
      expect(Array.isArray(data)).toBe(true);

      data.forEach((appointment: any) => {
        const startTime = new Date(appointment.startTime);
        const dateFrom = new Date(listDto.dateFrom);
        const dateTo = new Date(listDto.dateTo);
        expect(startTime >= dateFrom && startTime <= dateTo).toBe(true);
      });
    });

    it('should filter appointments by status', async () => {
      const listDto = {
        status: 'BOOKED',
        page: 1,
        limit: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.OK);

      const { data } = response.body;
      data.forEach((appointment: any) => {
        expect(appointment.status).toBe('BOOKED');
      });
    });

    it('should search appointments by client name', async () => {
      const listDto = {
        search: 'Alice',
        page: 1,
        limit: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.OK);

      const { data } = response.body;

      // Should return appointments with client names matching 'Alice'
      const hasAlice = data.some(
        (appointment: any) =>
          appointment.clientInfo.firstName.toLowerCase().includes('alice') ||
          appointment.clientInfo.lastName.toLowerCase().includes('alice'),
      );

      if (data.length > 0) {
        expect(hasAlice).toBe(true);
      }
    });
  });

  describe('📄 GET APPOINTMENT BY ID - Domain Entity Retrieval', () => {
    it('should get appointment by ID successfully', async () => {
      let appointmentId = (global as any).testAppointmentId;

      if (!appointmentId) {
        // Create a test appointment if none exists
        const bookingResponse = await request(app.getHttpServer())
          .post('/appointments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            serviceId: (global as any).testServiceId,
            clientInfo: {
              firstName: 'Alice',
              lastName: 'Test',
              email: 'alice.test@example.com',
              phoneNumber: '+33123456789',
            },
            timeSlot: {
              startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
              endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // tomorrow + 1 hour
            },
          })
          .expect(HttpStatus.CREATED);

        appointmentId = bookingResponse.body.data.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      // ✅ Validate complete appointment data
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const appointment = response.body.data;
      expect(appointment).toHaveProperty('id', appointmentId);
      expect(appointment).toHaveProperty('status');
      expect(appointment).toHaveProperty('startTime');
      expect(appointment).toHaveProperty('endTime');
      expect(appointment).toHaveProperty('clientInfo');
      expect(appointment).toHaveProperty('service');
      expect(appointment).toHaveProperty('calculatedPrice');

      // ✅ Validate nested objects
      expect(appointment.clientInfo).toHaveProperty('firstName');
      expect(appointment.clientInfo).toHaveProperty('lastName');
      expect(appointment.service).toHaveProperty('name');
      expect(appointment.service).toHaveProperty('duration');
    });

    it('should return 404 for non-existent appointment', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app.getHttpServer())
        .get(`/appointments/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('APPOINTMENT_NOT_FOUND');
    });

    it('should validate appointment ID format', async () => {
      const invalidId = 'invalid-uuid-format';

      await request(app.getHttpServer())
        .get(`/appointments/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('✏️ UPDATE APPOINTMENT - Business Rule Validation', () => {
    let updateTestAppointmentId: string;

    beforeAll(async () => {
      // Create appointment specifically for update tests
      const bookingResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessId,
          calendarId,
          serviceId,
          startTime: '2024-01-30T09:00:00Z',
          endTime: '2024-01-30T10:00:00Z',
          clientInfo: {
            firstName: 'Update',
            lastName: 'Test',
            email: 'update.test@example.com',
          },
        })
        .expect(HttpStatus.CREATED);

      updateTestAppointmentId = bookingResponse.body.data.id;
    });

    it('should update appointment time successfully', async () => {
      const updateDto = {
        startTime: '2024-01-30T14:00:00Z',
        endTime: '2024-01-30T15:00:00Z',
      };

      const response = await request(app.getHttpServer())
        .put(`/appointments/${updateTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty(
        'startTime',
        updateDto.startTime,
      );
      expect(response.body.data).toHaveProperty('endTime', updateDto.endTime);
    });

    it('should update appointment status BOOKED -> CONFIRMED', async () => {
      const updateDto = {
        status: 'CONFIRMED',
      };

      const response = await request(app.getHttpServer())
        .put(`/appointments/${updateTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveProperty('status', 'CONFIRMED');
    });

    it('should reject invalid status transitions', async () => {
      // Try to set status back to BOOKED from CONFIRMED (should fail)
      const invalidUpdateDto = {
        status: 'BOOKED',
      };

      const response = await request(app.getHttpServer())
        .put(`/appointments/${updateTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should validate time slot availability for updates', async () => {
      // Create another appointment to create a conflict
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessId,
          calendarId,
          serviceId,
          startTime: '2024-01-31T10:00:00Z',
          endTime: '2024-01-31T11:00:00Z',
          clientInfo: {
            firstName: 'Conflict',
            lastName: 'Test',
            email: 'conflict.test@example.com',
          },
        })
        .expect(HttpStatus.CREATED);

      // Try to update appointment to conflicting time
      const conflictingUpdateDto = {
        startTime: '2024-01-31T10:30:00Z', // Overlapping with above
        endTime: '2024-01-31T11:30:00Z',
      };

      const response = await request(app.getHttpServer())
        .put(`/appointments/${updateTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(conflictingUpdateDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.error.code).toBe('APPOINTMENT_TIME_CONFLICT');
    });
  });

  describe('❌ CANCEL APPOINTMENT - Business Flow Completion', () => {
    let cancelTestAppointmentId: string;

    beforeAll(async () => {
      // Create appointment specifically for cancellation tests
      const bookingResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessId,
          calendarId,
          serviceId,
          startTime: '2024-02-01T15:00:00Z',
          endTime: '2024-02-01T16:00:00Z',
          clientInfo: {
            firstName: 'Cancel',
            lastName: 'Test',
            email: 'cancel.test@example.com',
          },
        })
        .expect(HttpStatus.CREATED);

      cancelTestAppointmentId = bookingResponse.body.data.id;
    });

    it('should cancel appointment successfully', async () => {
      const cancelDto = {
        reason: 'Client request',
      };

      const response = await request(app.getHttpServer())
        .delete(`/appointments/${cancelTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(HttpStatus.OK);

      // ✅ Validate cancellation response
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'CANCELLED');
      expect(response.body.data).toHaveProperty('cancelledAt');
      expect(response.body.data).toHaveProperty(
        'cancellationReason',
        'Client request',
      );

      // ✅ Verify appointment status is updated
      const verificationResponse = await request(app.getHttpServer())
        .get(`/appointments/${cancelTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(verificationResponse.body.data).toHaveProperty(
        'status',
        'CANCELLED',
      );
    });

    it('should prevent cancelling already cancelled appointments', async () => {
      const cancelDto = {
        reason: 'Duplicate cancellation attempt',
      };

      const response = await request(app.getHttpServer())
        .delete(`/appointments/${cancelTestAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error.code).toBe('APPOINTMENT_ALREADY_CANCELLED');
    });

    it('should handle non-existent appointment cancellation', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

      const response = await request(app.getHttpServer())
        .delete(`/appointments/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.error.code).toBe('APPOINTMENT_NOT_FOUND');
    });
  });

  describe('🔒 SECURITY & PERMISSIONS - Business Context Validation', () => {
    it('should enforce business context isolation', async () => {
      // Create another business and try to access appointments
      const otherBusinessResponse = await request(app.getHttpServer())
        .post('/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Other Business',
          email: 'other@business.com',
          address: '456 Other Street',
          city: 'Other City',
          country: 'France',
          businessSectorId: 'existing-sector-id',
        })
        .expect(HttpStatus.CREATED);

      const otherBusinessId = otherBusinessResponse.body.data.id;

      // Try to list appointments with wrong business context
      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessId: otherBusinessId, // Different business
          page: 1,
          limit: 10,
        })
        .expect(HttpStatus.OK);

      // Should return empty results due to business isolation
      expect(response.body.data).toHaveLength(0);
    });

    it('should require authentication for all endpoints', async () => {
      const testCases = [
        { method: 'post', path: '/appointments/available-slots' },
        { method: 'post', path: '/appointments' },
        { method: 'post', path: '/appointments/list' },
        { method: 'get', path: '/appointments/some-id' },
        { method: 'put', path: '/appointments/some-id' },
        { method: 'delete', path: '/appointments/some-id' },
      ];

      for (const { method, path } of testCases) {
        const agent = request(app.getHttpServer());
        let req;
        switch (method) {
          case 'get':
            req = agent.get(path);
            break;
          case 'post':
            req = agent.post(path);
            break;
          case 'put':
            req = agent.put(path);
            break;
          case 'delete':
            req = agent.delete(path);
            break;
          default:
            throw new Error(`Unknown method: ${method}`);
        }
        await req.send({}).expect(HttpStatus.UNAUTHORIZED);
      }
    });
  });

  describe('🎯 PERFORMANCE & EDGE CASES', () => {
    it('should handle large pagination requests efficiently', async () => {
      const listDto = {
        page: 1,
        limit: 100, // Max allowed
        sortBy: 'startTime',
        sortOrder: 'desc',
      };

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.OK);

      const duration = Date.now() - startTime;

      // ✅ Should complete within reasonable time (< 2 seconds)
      expect(duration).toBeLessThan(2000);
      expect(response.body.data.length).toBeLessThanOrEqual(100);
    });

    it('should reject pagination limits exceeding maximum', async () => {
      const listDto = {
        page: 1,
        limit: 150, // Exceeds max of 100
      };

      const response = await request(app.getHttpServer())
        .post('/appointments/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error.message).toContain('limit');
    });

    it('should handle concurrent booking attempts gracefully', async () => {
      const bookingDto = {
        businessId,
        calendarId,
        serviceId,
        startTime: '2024-02-15T10:00:00Z',
        endTime: '2024-02-15T11:00:00Z',
        clientInfo: {
          firstName: 'Concurrent',
          lastName: 'Test',
          email: 'concurrent@test.com',
        },
      };

      // Simulate concurrent booking attempts
      const promises = Array(3)
        .fill(0)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/appointments')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              ...bookingDto,
              clientInfo: {
                ...bookingDto.clientInfo,
                email: `concurrent${index}@test.com`,
              },
            }),
        );

      const responses = await Promise.all(
        promises.map((p) => p.catch((err: any) => err.response)),
      );

      // ✅ Only one should succeed, others should get conflict errors
      const successful = responses.filter(
        (r: any) => r.status === HttpStatus.CREATED,
      );
      const conflicts = responses.filter(
        (r: any) => r.status === HttpStatus.CONFLICT,
      );

      expect(successful).toHaveLength(1);
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });
});
