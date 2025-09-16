import { MongoClient, Db } from 'mongodb';
import { Logger } from '@nestjs/common';

/**
 * 🍃 MongoDB Collections and Indexes Migration
 * 
 * Sets up MongoDB collections for document-based data:
 * - Business metadata and analytics
 * - Calendar configurations and settings
 * - Appointment history and logs
 * - File storage references
 * - Real-time notifications
 */
export class CreateMongoCollections1694780001000 {
  private readonly logger = new Logger(CreateMongoCollections1694780001000.name);
  
  name = 'CreateMongoCollections1694780001000';

  async up(client: MongoClient, dbName: string): Promise<void> {
    const db: Db = client.db(dbName);

    try {
      // 1. Business Analytics Collection
      await this.createBusinessAnalyticsCollection(db);
      
      // 2. Calendar Configurations Collection
      await this.createCalendarConfigsCollection(db);
      
      // 3. Appointment Logs Collection
      await this.createAppointmentLogsCollection(db);
      
      // 4. File Storage References Collection
      await this.createFileReferencesCollection(db);
      
      // 5. Notification Queue Collection
      await this.createNotificationQueueCollection(db);
      
      // 6. Business Templates Collection
      await this.createBusinessTemplatesCollection(db);
      
      // 7. Audit Logs Collection
      await this.createAuditLogsCollection(db);

      this.logger.log('MongoDB collections and indexes created successfully');

    } catch (error) {
      this.logger.error('Failed to create MongoDB collections', error);
      throw error;
    }
  }

  async down(client: MongoClient, dbName: string): Promise<void> {
    const db: Db = client.db(dbName);

    try {
      // Drop collections in reverse order
      await db.collection('audit_logs').drop();
      await db.collection('business_templates').drop();
      await db.collection('notification_queue').drop();
      await db.collection('file_references').drop();
      await db.collection('appointment_logs').drop();
      await db.collection('calendar_configs').drop();
      await db.collection('business_analytics').drop();

      this.logger.log('MongoDB collections dropped successfully');

    } catch (error) {
      this.logger.error('Failed to drop MongoDB collections', error);
      throw error;
    }
  }

  private async createBusinessAnalyticsCollection(db: Db): Promise<void> {
    const collection = db.collection('business_analytics');
    
    // Create indexes for analytics queries
    await collection.createIndex({ business_id: 1, date: -1 });
    await collection.createIndex({ business_id: 1, metric_type: 1, date: -1 });
    await collection.createIndex({ business_id: 1, staff_id: 1, date: -1 });
    await collection.createIndex({ created_at: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

    // Insert sample document structure for validation
    await collection.insertOne({
      _id: 'sample_analytics_doc',
      business_id: 'uuid_placeholder',
      date: new Date(),
      metric_type: 'appointments',
      data: {
        total_appointments: 0,
        confirmed_appointments: 0,
        cancelled_appointments: 0,
        revenue: {
          amount: 0,
          currency: 'EUR'
        },
        staff_utilization: {},
        service_popularity: {},
        time_slot_analysis: {}
      },
      metadata: {
        calculation_method: 'daily_aggregate',
        data_sources: ['appointments', 'payments'],
        confidence_level: 1.0
      },
      created_at: new Date(),
      updated_at: new Date()
    });

    // Remove sample document
    await collection.deleteOne({ _id: 'sample_analytics_doc' });

    this.logger.log('Business analytics collection created with indexes');
  }

  private async createCalendarConfigsCollection(db: Db): Promise<void> {
    const collection = db.collection('calendar_configs');
    
    // Create indexes
    await collection.createIndex({ business_id: 1, calendar_id: 1 }, { unique: true });
    await collection.createIndex({ business_id: 1, config_type: 1 });
    await collection.createIndex({ calendar_id: 1 });

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_calendar_config',
      business_id: 'uuid_placeholder',
      calendar_id: 'uuid_placeholder',
      config_type: 'working_hours_template',
      name: 'Standard Business Hours',
      configuration: {
        timezone: 'Europe/Paris',
        working_days: [1, 2, 3, 4, 5], // Monday to Friday
        working_hours: {
          start: '09:00',
          end: '17:00'
        },
        break_times: [
          {
            start: '12:00',
            end: '13:00',
            name: 'Lunch Break'
          }
        ],
        holidays: [],
        exceptions: [],
        booking_rules: {
          advance_booking_days: 30,
          min_advance_hours: 2,
          max_advance_days: 90,
          allow_same_day_booking: true,
          cancellation_policy: {
            free_cancellation_hours: 24,
            partial_refund_hours: 12,
            no_refund_hours: 2
          }
        },
        availability_rules: {
          slot_duration_minutes: 30,
          buffer_time_minutes: 15,
          max_consecutive_slots: 8,
          allow_double_booking: false
        }
      },
      is_template: true,
      is_active: true,
      version: 1,
      created_by: 'system',
      created_at: new Date(),
      updated_at: new Date(),
      applied_to_calendars: []
    });

    await collection.deleteOne({ _id: 'sample_calendar_config' });

    this.logger.log('Calendar configurations collection created with indexes');
  }

  private async createAppointmentLogsCollection(db: Db): Promise<void> {
    const collection = db.collection('appointment_logs');
    
    // Create indexes for log queries
    await collection.createIndex({ appointment_id: 1, timestamp: -1 });
    await collection.createIndex({ business_id: 1, timestamp: -1 });
    await collection.createIndex({ action_type: 1, timestamp: -1 });
    await collection.createIndex({ user_id: 1, timestamp: -1 });
    await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_appointment_log',
      appointment_id: 'uuid_placeholder',
      business_id: 'uuid_placeholder',
      action_type: 'CREATED',
      timestamp: new Date(),
      user_id: 'uuid_placeholder',
      user_role: 'RECEPTIONIST',
      details: {
        previous_state: null,
        new_state: {
          status: 'PENDING',
          start_time: new Date(),
          end_time: new Date(),
          service_id: 'uuid_placeholder',
          client_id: 'uuid_placeholder',
          staff_id: 'uuid_placeholder'
        },
        changes: [],
        reason: 'Initial appointment creation',
        client_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        session_id: 'session_uuid'
      },
      metadata: {
        correlation_id: 'correlation_uuid',
        operation_id: 'operation_uuid',
        request_source: 'web_app',
        processing_time_ms: 150
      }
    });

    await collection.deleteOne({ _id: 'sample_appointment_log' });

    this.logger.log('Appointment logs collection created with indexes');
  }

  private async createFileReferencesCollection(db: Db): Promise<void> {
    const collection = db.collection('file_references');
    
    // Create indexes
    await collection.createIndex({ business_id: 1, entity_type: 1, entity_id: 1 });
    await collection.createIndex({ file_url: 1 }, { unique: true });
    await collection.createIndex({ uploaded_by: 1, upload_date: -1 });
    await collection.createIndex({ file_type: 1, business_id: 1 });
    await collection.createIndex({ tags: 1, business_id: 1 });

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_file_reference',
      business_id: 'uuid_placeholder',
      entity_type: 'business_logo',
      entity_id: 'uuid_placeholder',
      file_url: 'https://storage.example.com/logos/sample.png',
      original_filename: 'company-logo.png',
      file_type: 'image/png',
      file_size: 245760,
      storage_provider: 'aws_s3',
      storage_path: 'businesses/uuid_placeholder/logos/logo.png',
      metadata: {
        dimensions: {
          width: 400,
          height: 200
        },
        alt_text: 'Company Logo',
        description: 'Main business logo',
        is_public: true,
        cdn_url: 'https://cdn.example.com/logos/sample.png'
      },
      tags: ['logo', 'branding', 'public'],
      uploaded_by: 'uuid_placeholder',
      upload_date: new Date(),
      last_accessed: new Date(),
      access_count: 0,
      is_active: true,
      expires_at: null
    });

    await collection.deleteOne({ _id: 'sample_file_reference' });

    this.logger.log('File references collection created with indexes');
  }

  private async createNotificationQueueCollection(db: Db): Promise<void> {
    const collection = db.collection('notification_queue');
    
    // Create indexes
    await collection.createIndex({ business_id: 1, scheduled_for: 1 });
    await collection.createIndex({ recipient_id: 1, status: 1 });
    await collection.createIndex({ notification_type: 1, status: 1 });
    await collection.createIndex({ status: 1, scheduled_for: 1 });
    await collection.createIndex({ created_at: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_notification',
      business_id: 'uuid_placeholder',
      notification_type: 'appointment_reminder',
      recipient_id: 'uuid_placeholder',
      recipient_type: 'client',
      channels: ['email', 'sms'],
      status: 'pending',
      priority: 'normal',
      scheduled_for: new Date(),
      content: {
        email: {
          template_id: 'appointment_reminder_client',
          subject: 'Appointment Reminder - {{appointment_date}}',
          variables: {
            client_name: 'John Doe',
            appointment_date: '2025-09-15 14:00',
            service_name: 'Consultation',
            staff_name: 'Dr. Smith',
            business_name: 'Health Clinic',
            business_address: '123 Main St, Paris',
            confirmation_url: 'https://app.example.com/confirm/...',
            cancellation_url: 'https://app.example.com/cancel/...'
          }
        },
        sms: {
          template_id: 'appointment_reminder_sms',
          message: 'Reminder: Appointment with {{staff_name}} on {{appointment_date}}. Confirm: {{short_url}}',
          variables: {
            staff_name: 'Dr. Smith',
            appointment_date: '15/09 14h00',
            short_url: 'https://short.ly/abc123'
          }
        }
      },
      retry_config: {
        max_attempts: 3,
        current_attempt: 0,
        backoff_strategy: 'exponential',
        next_retry: null
      },
      metadata: {
        appointment_id: 'uuid_placeholder',
        correlation_id: 'correlation_uuid',
        created_by: 'system',
        locale: 'fr-FR',
        timezone: 'Europe/Paris'
      },
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: null,
      delivered_at: null,
      failed_at: null,
      error_message: null
    });

    await collection.deleteOne({ _id: 'sample_notification' });

    this.logger.log('Notification queue collection created with indexes');
  }

  private async createBusinessTemplatesCollection(db: Db): Promise<void> {
    const collection = db.collection('business_templates');
    
    // Create indexes
    await collection.createIndex({ business_type: 1, template_type: 1 });
    await collection.createIndex({ is_default: 1, business_type: 1 });
    await collection.createIndex({ created_by: 1, created_at: -1 });
    await collection.createIndex({ tags: 1 });

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_business_template',
      business_type: 'MEDICAL_CLINIC',
      template_type: 'service_catalog',
      name: 'Standard Medical Services',
      description: 'Default service catalog for medical clinics',
      version: '1.0',
      is_default: true,
      template_data: {
        services: [
          {
            name: 'General Consultation',
            duration_minutes: 30,
            base_price: 50,
            currency: 'EUR',
            category: 'consultation',
            requirements: 'Valid ID required',
            description: 'Standard medical consultation'
          },
          {
            name: 'Follow-up Visit',
            duration_minutes: 15,
            base_price: 25,
            currency: 'EUR',
            category: 'consultation',
            requirements: 'Previous consultation required',
            description: 'Follow-up appointment after initial consultation'
          }
        ],
        categories: [
          {
            name: 'consultation',
            display_name: 'Consultations',
            color: '#007bff',
            icon: 'stethoscope'
          }
        ],
        default_settings: {
          booking_advance_hours: 24,
          cancellation_hours: 2,
          max_participants: 1,
          require_confirmation: true
        }
      },
      usage_stats: {
        times_used: 0,
        businesses_using: 0,
        last_used: null
      },
      tags: ['medical', 'consultation', 'standard'],
      created_by: 'system',
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    });

    await collection.deleteOne({ _id: 'sample_business_template' });

    this.logger.log('Business templates collection created with indexes');
  }

  private async createAuditLogsCollection(db: Db): Promise<void> {
    const collection = db.collection('audit_logs');
    
    // Create indexes for audit queries
    await collection.createIndex({ business_id: 1, timestamp: -1 });
    await collection.createIndex({ user_id: 1, timestamp: -1 });
    await collection.createIndex({ action: 1, timestamp: -1 });
    await collection.createIndex({ entity_type: 1, entity_id: 1, timestamp: -1 });
    await collection.createIndex({ correlation_id: 1 });
    await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL

    // Insert sample document structure
    await collection.insertOne({
      _id: 'sample_audit_log',
      business_id: 'uuid_placeholder',
      user_id: 'uuid_placeholder',
      user_role: 'BUSINESS_ADMIN',
      action: 'CREATE_SERVICE',
      entity_type: 'service',
      entity_id: 'uuid_placeholder',
      timestamp: new Date(),
      details: {
        previous_data: null,
        new_data: {
          name: 'New Service',
          duration_minutes: 60,
          base_price: 100,
          currency: 'EUR',
          is_active: true
        },
        changed_fields: ['name', 'duration_minutes', 'base_price'],
        change_reason: 'New service offering',
        impact_level: 'medium'
      },
      context: {
        correlation_id: 'correlation_uuid',
        operation_id: 'operation_uuid',
        session_id: 'session_uuid',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        request_source: 'web_app',
        client_version: '1.0.0'
      },
      security: {
        permissions_checked: ['CREATE_SERVICES'],
        authorization_method: 'jwt',
        mfa_verified: false,
        risk_score: 0.1
      },
      compliance: {
        gdpr_applicable: true,
        data_classification: 'business',
        retention_period_days: 365,
        anonymization_required: false
      }
    });

    await collection.deleteOne({ _id: 'sample_audit_log' });

    this.logger.log('Audit logs collection created with indexes');
  }
}
