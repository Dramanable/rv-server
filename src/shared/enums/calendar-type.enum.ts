/**
 * 📅 Calendar Type Enumeration
 * 
 * Defines the different types of calendars available in the appointment system.
 * Each type has specific behaviors and access patterns designed for different use cases.
 * 
 * Frontend Usage Example:
 * ```typescript
 * // Filter calendars by type in admin interface
 * const staffCalendars = await calendarService.getCalendars({
 *   businessId: 'business-uuid',
 *   type: CalendarType.STAFF
 * });
 * 
 * // Create resource calendar for equipment booking
 * const equipmentCalendar = await calendarService.create({
 *   name: 'Dental X-Ray Machine',
 *   type: CalendarType.RESOURCE,
 *   businessId: 'business-uuid'
 * });
 * 
 * // Display calendar type in UI
 * const typeDisplay = CalendarTypeUtils.getDisplayName(calendar.type);
 * const typeColor = CalendarTypeUtils.getColor(calendar.type);
 * ```
 */
export enum CalendarType {
  /**
   * 👤 Staff Calendar
   * 
   * Personal calendar for individual staff members.
   * 
   * **Characteristics:**
   * - Linked to a specific staff member
   * - Reflects personal working hours and availability
   * - Supports individual booking preferences
   * - Integrates with staff leave and time-off management
   * - Can have multiple calendars per staff (different locations/roles)
   * 
   * **Use Cases:**
   * - Doctor's consultation schedule
   * - Therapist appointment calendar
   * - Hair stylist booking calendar
   * - Personal trainer schedule
   */
  STAFF = 'STAFF',

  /**
   * 🏢 Business Calendar
   * 
   * Business-wide calendar for general appointments and events.
   * 
   * **Characteristics:**
   * - Not tied to specific staff members
   * - Managed by business administrators
   * - Can be assigned to available staff dynamically
   * - Suitable for general consultations or walk-ins
   * - Shared resource scheduling
   * 
   * **Use Cases:**
   * - General consultation slots
   * - Business events and meetings
   * - Shared facility bookings
   * - Emergency appointment slots
   */
  BUSINESS = 'BUSINESS',

  /**
   * 🛠️ Resource Calendar
   * 
   * Calendar for physical resources, equipment, or facilities.
   * 
   * **Characteristics:**
   * - Represents bookable equipment or rooms
   * - Independent of staff schedules
   * - Prevents double-booking of resources
   * - Supports maintenance and downtime scheduling
   * - Can be combined with staff calendars for complex bookings
   * 
   * **Use Cases:**
   * - Medical equipment booking (X-ray machine, MRI)
   * - Meeting room reservations
   * - Specialized treatment facilities
   * - Vehicle or tool rentals
   */
  RESOURCE = 'RESOURCE',

  /**
   * 🏥 Department Calendar
   * 
   * Departmental calendar for team-based scheduling.
   * 
   * **Characteristics:**
   * - Represents entire department availability
   * - Aggregates multiple staff calendars
   * - Supports department-wide policies
   * - Enables load balancing across team members
   * - Hierarchical calendar management
   * 
   * **Use Cases:**
   * - Medical department scheduling
   * - Team-based service delivery
   * - Department meetings and training
   * - Multi-practitioner consultations
   */
  DEPARTMENT = 'DEPARTMENT',

  /**
   * 🎯 Service Calendar
   * 
   * Calendar specific to particular services or specialties.
   * 
   * **Characteristics:**
   * - Dedicated to specific service types
   * - Custom booking rules per service category
   * - Specialized availability patterns
   * - Service-specific staff assignment
   * - Tailored client experience
   * 
   * **Use Cases:**
   * - Emergency services calendar
   * - Specialized treatment schedules
   * - VIP or premium service slots
   * - Seasonal or temporary services
   */
  SERVICE = 'SERVICE',

  /**
   * 📍 Location Calendar
   * 
   * Calendar representing a specific business location or address.
   * 
   * **Characteristics:**
   * - Tied to a physical business address
   * - Aggregates all calendars at that location
   * - Location-specific operating hours
   * - Supports multi-location businesses
   * - Geographic availability management
   * 
   * **Use Cases:**
   * - Multi-branch clinic management
   * - Geographic service coverage
   * - Location-based capacity planning
   * - Regional appointment distribution
   */
  LOCATION = 'LOCATION'
}

/**
 * 🛠️ Calendar Type Utilities
 * 
 * Helper functions for working with calendar types including
 * display formatting, validation, and business logic support.
 */
export class CalendarTypeUtils {
  /**
   * 📝 Display Names Map
   * 
   * Human-readable names for each calendar type, suitable for UI display.
   * These should be internationalized in a real application.
   */
  private static readonly DISPLAY_NAMES: Record<CalendarType, string> = {
    [CalendarType.STAFF]: 'Staff Member Calendar',
    [CalendarType.BUSINESS]: 'Business Calendar', 
    [CalendarType.RESOURCE]: 'Resource/Equipment Calendar',
    [CalendarType.DEPARTMENT]: 'Department Calendar',
    [CalendarType.SERVICE]: 'Service-Specific Calendar',
    [CalendarType.LOCATION]: 'Location Calendar'
  };

  /**
   * 🎨 Color Scheme Map
   * 
   * Default colors for each calendar type to provide consistent UI theming.
   */
  private static readonly COLORS: Record<CalendarType, string> = {
    [CalendarType.STAFF]: '#4CAF50',      // Green - Personal/Individual
    [CalendarType.BUSINESS]: '#2196F3',   // Blue - Business/Corporate
    [CalendarType.RESOURCE]: '#FF9800',   // Orange - Equipment/Tools
    [CalendarType.DEPARTMENT]: '#9C27B0', // Purple - Team/Group
    [CalendarType.SERVICE]: '#F44336',    // Red - Service/Specialty
    [CalendarType.LOCATION]: '#607D8B'    // Blue Grey - Geographic
  };

  /**
   * 🏷️ Description Map
   * 
   * Detailed descriptions explaining when to use each calendar type.
   */
  private static readonly DESCRIPTIONS: Record<CalendarType, string> = {
    [CalendarType.STAFF]: 'Individual staff member schedules with personal working hours and preferences',
    [CalendarType.BUSINESS]: 'General business appointments not tied to specific staff members',
    [CalendarType.RESOURCE]: 'Physical resources like equipment, rooms, or facilities that can be booked',
    [CalendarType.DEPARTMENT]: 'Team-based calendars for departmental scheduling and coordination',
    [CalendarType.SERVICE]: 'Specialized calendars for specific services or treatment types',
    [CalendarType.LOCATION]: 'Location-based calendars for multi-site business management'
  };

  /**
   * 📊 Permission Requirements Map
   * 
   * Defines what permissions are needed to manage each calendar type.
   */
  private static readonly PERMISSION_REQUIREMENTS: Record<CalendarType, string[]> = {
    [CalendarType.STAFF]: ['CALENDAR_MANAGE_OWN', 'CALENDAR_MANAGE_STAFF'],
    [CalendarType.BUSINESS]: ['CALENDAR_MANAGE_BUSINESS', 'BUSINESS_ADMIN'],
    [CalendarType.RESOURCE]: ['RESOURCE_MANAGE', 'CALENDAR_MANAGE_BUSINESS'],
    [CalendarType.DEPARTMENT]: ['DEPARTMENT_MANAGE', 'CALENDAR_MANAGE_DEPARTMENT'],
    [CalendarType.SERVICE]: ['SERVICE_MANAGE', 'CALENDAR_MANAGE_SERVICE'],
    [CalendarType.LOCATION]: ['LOCATION_MANAGE', 'BUSINESS_ADMIN']
  };

  /**
   * Gets the display name for a calendar type
   */
  static getDisplayName(type: CalendarType): string {
    return this.DISPLAY_NAMES[type] || type;
  }

  /**
   * Gets the default color for a calendar type
   */
  static getColor(type: CalendarType): string {
    return this.COLORS[type] || '#4CAF50';
  }

  /**
   * Gets the description for a calendar type
   */
  static getDescription(type: CalendarType): string {
    return this.DESCRIPTIONS[type] || '';
  }

  /**
   * Gets the required permissions to manage a calendar type
   */
  static getPermissionRequirements(type: CalendarType): string[] {
    return this.PERMISSION_REQUIREMENTS[type] || [];
  }

  /**
   * Gets all calendar types as an array
   */
  static getAllTypes(): CalendarType[] {
    return Object.values(CalendarType);
  }

  /**
   * Validates if a string is a valid calendar type
   */
  static isValidType(type: string): type is CalendarType {
    return Object.values(CalendarType).includes(type as CalendarType);
  }

  /**
   * Gets calendar types suitable for staff members
   */
  static getStaffSuitableTypes(): CalendarType[] {
    return [CalendarType.STAFF, CalendarType.SERVICE];
  }

  /**
   * Gets calendar types suitable for resources
   */
  static getResourceSuitableTypes(): CalendarType[] {
    return [CalendarType.RESOURCE, CalendarType.LOCATION];
  }

  /**
   * Gets calendar types suitable for business administration
   */
  static getBusinessSuitableTypes(): CalendarType[] {
    return [
      CalendarType.BUSINESS, 
      CalendarType.DEPARTMENT, 
      CalendarType.LOCATION
    ];
  }

  /**
   * Determines if a calendar type requires staff assignment
   */
  static requiresStaffAssignment(type: CalendarType): boolean {
    return [CalendarType.STAFF, CalendarType.SERVICE].includes(type);
  }

  /**
   * Determines if a calendar type supports multiple staff assignment
   */
  static supportsMultipleStaff(type: CalendarType): boolean {
    return [
      CalendarType.BUSINESS, 
      CalendarType.DEPARTMENT, 
      CalendarType.LOCATION
    ].includes(type);
  }

  /**
   * Gets calendar types that can be location-independent
   */
  static getLocationIndependentTypes(): CalendarType[] {
    return [CalendarType.SERVICE]; // Services might be offered at multiple locations
  }

  /**
   * Gets display information for UI components
   */
  static getDisplayInfo(type: CalendarType): {
    name: string;
    color: string;
    description: string;
    icon?: string;
  } {
    const icons: Record<CalendarType, string> = {
      [CalendarType.STAFF]: '👤',
      [CalendarType.BUSINESS]: '🏢',
      [CalendarType.RESOURCE]: '🛠️',
      [CalendarType.DEPARTMENT]: '🏥',
      [CalendarType.SERVICE]: '🎯',
      [CalendarType.LOCATION]: '📍'
    };

    return {
      name: this.getDisplayName(type),
      color: this.getColor(type),
      description: this.getDescription(type),
      icon: icons[type]
    };
  }

  /**
   * Gets calendar types organized by category for UI grouping
   */
  static getTypesByCategory(): Record<string, CalendarType[]> {
    return {
      'Individual': [CalendarType.STAFF],
      'Business': [CalendarType.BUSINESS, CalendarType.DEPARTMENT, CalendarType.LOCATION],
      'Resources': [CalendarType.RESOURCE, CalendarType.SERVICE]
    };
  }
}

/**
 * 📋 Calendar Type Information Interface
 * 
 * Type definition for calendar type metadata used in frontend components.
 */
export interface CalendarTypeInfo {
  type: CalendarType;
  name: string;
  description: string;
  color: string;
  icon?: string;
  requiresStaff: boolean;
  supportsMultipleStaff: boolean;
  permissions: string[];
}

/**
 * Gets complete information about all calendar types
 */
export function getAllCalendarTypeInfo(): CalendarTypeInfo[] {
  return CalendarTypeUtils.getAllTypes().map(type => ({
    type,
    name: CalendarTypeUtils.getDisplayName(type),
    description: CalendarTypeUtils.getDescription(type),
    color: CalendarTypeUtils.getColor(type),
    icon: CalendarTypeUtils.getDisplayInfo(type).icon,
    requiresStaff: CalendarTypeUtils.requiresStaffAssignment(type),
    supportsMultipleStaff: CalendarTypeUtils.supportsMultipleStaff(type),
    permissions: CalendarTypeUtils.getPermissionRequirements(type)
  }));
}
