/**
 * 🏷️ Service Category Enum
 * 
 * Defines the main categories of services that can be offered by businesses.
 * These categories help organize services and enable better filtering and search functionality.
 */
export enum ServiceCategory {
  // 🩺 Medical & Healthcare
  CONSULTATION = 'CONSULTATION',
  DIAGNOSTIC = 'DIAGNOSTIC',
  THERAPY = 'THERAPY',
  SURGERY = 'SURGERY',
  VACCINATION = 'VACCINATION',
  EMERGENCY = 'EMERGENCY',
  
  // 🦷 Dental
  DENTAL_CHECKUP = 'DENTAL_CHECKUP',
  DENTAL_CLEANING = 'DENTAL_CLEANING',
  DENTAL_SURGERY = 'DENTAL_SURGERY',
  ORTHODONTICS = 'ORTHODONTICS',
  
  // 👁️ Vision & Eye Care
  EYE_EXAM = 'EYE_EXAM',
  VISION_THERAPY = 'VISION_THERAPY',
  CONTACT_LENS = 'CONTACT_LENS',
  
  // 💆‍♀️ Beauty & Wellness
  HAIRCUT = 'HAIRCUT',
  HAIR_COLORING = 'HAIR_COLORING',
  MANICURE = 'MANICURE',
  PEDICURE = 'PEDICURE',
  FACIAL = 'FACIAL',
  MASSAGE = 'MASSAGE',
  SKINCARE = 'SKINCARE',
  
  // 🏋️‍♂️ Fitness & Sports
  PERSONAL_TRAINING = 'PERSONAL_TRAINING',
  GROUP_CLASS = 'GROUP_CLASS',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  SPORTS_THERAPY = 'SPORTS_THERAPY',
  
  // ⚖️ Legal Services
  LEGAL_CONSULTATION = 'LEGAL_CONSULTATION',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  COURT_REPRESENTATION = 'COURT_REPRESENTATION',
  CONTRACT_DRAFTING = 'CONTRACT_DRAFTING',
  
  // 💼 Business & Professional
  BUSINESS_CONSULTATION = 'BUSINESS_CONSULTATION',
  ACCOUNTING = 'ACCOUNTING',
  TAX_PREPARATION = 'TAX_PREPARATION',
  FINANCIAL_PLANNING = 'FINANCIAL_PLANNING',
  
  // 🏠 Home & Maintenance
  HOME_INSPECTION = 'HOME_INSPECTION',
  CLEANING = 'CLEANING',
  REPAIR = 'REPAIR',
  INSTALLATION = 'INSTALLATION',
  
  // 🎓 Education & Training
  TUTORING = 'TUTORING',
  LANGUAGE_LESSON = 'LANGUAGE_LESSON',
  SKILL_TRAINING = 'SKILL_TRAINING',
  CERTIFICATION = 'CERTIFICATION',
  
  // 🐾 Pet Services
  VETERINARY = 'VETERINARY',
  PET_GROOMING = 'PET_GROOMING',
  PET_TRAINING = 'PET_TRAINING',
  PET_SITTING = 'PET_SITTING',
  
  // 🚗 Automotive
  CAR_INSPECTION = 'CAR_INSPECTION',
  CAR_REPAIR = 'CAR_REPAIR',
  CAR_WASH = 'CAR_WASH',
  
  // 📱 Technology
  TECH_SUPPORT = 'TECH_SUPPORT',
  SOFTWARE_DEVELOPMENT = 'SOFTWARE_DEVELOPMENT',
  DEVICE_REPAIR = 'DEVICE_REPAIR',
  
  // 🎨 Creative Services
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DESIGN = 'DESIGN',
  WRITING = 'WRITING',
  
  // 🔧 General Services
  CONSULTATION_GENERAL = 'CONSULTATION_GENERAL',
  APPOINTMENT = 'APPOINTMENT',
  WORKSHOP = 'WORKSHOP',
  EVENT = 'EVENT',
  OTHER = 'OTHER'
}

/**
 * 🏷️ Service Category Utilities
 * 
 * Utility functions for working with service categories
 */
export class ServiceCategoryUtils {
  
  /**
   * Get human-readable display name for a category
   */
  static getDisplayName(category: ServiceCategory): string {
    const displayNames: Record<ServiceCategory, string> = {
      // Medical & Healthcare
      [ServiceCategory.CONSULTATION]: 'Medical Consultation',
      [ServiceCategory.DIAGNOSTIC]: 'Diagnostic Test',
      [ServiceCategory.THERAPY]: 'Therapy Session',
      [ServiceCategory.SURGERY]: 'Surgical Procedure',
      [ServiceCategory.VACCINATION]: 'Vaccination',
      [ServiceCategory.EMERGENCY]: 'Emergency Care',
      
      // Dental
      [ServiceCategory.DENTAL_CHECKUP]: 'Dental Checkup',
      [ServiceCategory.DENTAL_CLEANING]: 'Dental Cleaning',
      [ServiceCategory.DENTAL_SURGERY]: 'Dental Surgery',
      [ServiceCategory.ORTHODONTICS]: 'Orthodontic Treatment',
      
      // Vision & Eye Care
      [ServiceCategory.EYE_EXAM]: 'Eye Examination',
      [ServiceCategory.VISION_THERAPY]: 'Vision Therapy',
      [ServiceCategory.CONTACT_LENS]: 'Contact Lens Service',
      
      // Beauty & Wellness
      [ServiceCategory.HAIRCUT]: 'Haircut & Styling',
      [ServiceCategory.HAIR_COLORING]: 'Hair Coloring',
      [ServiceCategory.MANICURE]: 'Manicure',
      [ServiceCategory.PEDICURE]: 'Pedicure',
      [ServiceCategory.FACIAL]: 'Facial Treatment',
      [ServiceCategory.MASSAGE]: 'Massage Therapy',
      [ServiceCategory.SKINCARE]: 'Skincare Treatment',
      
      // Fitness & Sports
      [ServiceCategory.PERSONAL_TRAINING]: 'Personal Training',
      [ServiceCategory.GROUP_CLASS]: 'Group Fitness Class',
      [ServiceCategory.PHYSIOTHERAPY]: 'Physiotherapy',
      [ServiceCategory.SPORTS_THERAPY]: 'Sports Therapy',
      
      // Legal Services
      [ServiceCategory.LEGAL_CONSULTATION]: 'Legal Consultation',
      [ServiceCategory.DOCUMENT_REVIEW]: 'Document Review',
      [ServiceCategory.COURT_REPRESENTATION]: 'Court Representation',
      [ServiceCategory.CONTRACT_DRAFTING]: 'Contract Drafting',
      
      // Business & Professional
      [ServiceCategory.BUSINESS_CONSULTATION]: 'Business Consultation',
      [ServiceCategory.ACCOUNTING]: 'Accounting Services',
      [ServiceCategory.TAX_PREPARATION]: 'Tax Preparation',
      [ServiceCategory.FINANCIAL_PLANNING]: 'Financial Planning',
      
      // Home & Maintenance
      [ServiceCategory.HOME_INSPECTION]: 'Home Inspection',
      [ServiceCategory.CLEANING]: 'Cleaning Service',
      [ServiceCategory.REPAIR]: 'Repair Service',
      [ServiceCategory.INSTALLATION]: 'Installation Service',
      
      // Education & Training
      [ServiceCategory.TUTORING]: 'Tutoring Session',
      [ServiceCategory.LANGUAGE_LESSON]: 'Language Lesson',
      [ServiceCategory.SKILL_TRAINING]: 'Skill Training',
      [ServiceCategory.CERTIFICATION]: 'Certification Program',
      
      // Pet Services
      [ServiceCategory.VETERINARY]: 'Veterinary Care',
      [ServiceCategory.PET_GROOMING]: 'Pet Grooming',
      [ServiceCategory.PET_TRAINING]: 'Pet Training',
      [ServiceCategory.PET_SITTING]: 'Pet Sitting',
      
      // Automotive
      [ServiceCategory.CAR_INSPECTION]: 'Car Inspection',
      [ServiceCategory.CAR_REPAIR]: 'Car Repair',
      [ServiceCategory.CAR_WASH]: 'Car Wash',
      
      // Technology
      [ServiceCategory.TECH_SUPPORT]: 'Technical Support',
      [ServiceCategory.SOFTWARE_DEVELOPMENT]: 'Software Development',
      [ServiceCategory.DEVICE_REPAIR]: 'Device Repair',
      
      // Creative Services
      [ServiceCategory.PHOTOGRAPHY]: 'Photography Session',
      [ServiceCategory.DESIGN]: 'Design Service',
      [ServiceCategory.WRITING]: 'Writing Service',
      
      // General Services
      [ServiceCategory.CONSULTATION_GENERAL]: 'General Consultation',
      [ServiceCategory.APPOINTMENT]: 'Appointment',
      [ServiceCategory.WORKSHOP]: 'Workshop',
      [ServiceCategory.EVENT]: 'Event',
      [ServiceCategory.OTHER]: 'Other Service'
    };

    return displayNames[category] || category;
  }

  /**
   * Get categories grouped by main sectors
   */
  static getCategoriesBySection(): Record<string, ServiceCategory[]> {
    return {
      'Medical & Healthcare': [
        ServiceCategory.CONSULTATION,
        ServiceCategory.DIAGNOSTIC,
        ServiceCategory.THERAPY,
        ServiceCategory.SURGERY,
        ServiceCategory.VACCINATION,
        ServiceCategory.EMERGENCY
      ],
      'Dental Care': [
        ServiceCategory.DENTAL_CHECKUP,
        ServiceCategory.DENTAL_CLEANING,
        ServiceCategory.DENTAL_SURGERY,
        ServiceCategory.ORTHODONTICS
      ],
      'Vision & Eye Care': [
        ServiceCategory.EYE_EXAM,
        ServiceCategory.VISION_THERAPY,
        ServiceCategory.CONTACT_LENS
      ],
      'Beauty & Wellness': [
        ServiceCategory.HAIRCUT,
        ServiceCategory.HAIR_COLORING,
        ServiceCategory.MANICURE,
        ServiceCategory.PEDICURE,
        ServiceCategory.FACIAL,
        ServiceCategory.MASSAGE,
        ServiceCategory.SKINCARE
      ],
      'Fitness & Sports': [
        ServiceCategory.PERSONAL_TRAINING,
        ServiceCategory.GROUP_CLASS,
        ServiceCategory.PHYSIOTHERAPY,
        ServiceCategory.SPORTS_THERAPY
      ],
      'Legal Services': [
        ServiceCategory.LEGAL_CONSULTATION,
        ServiceCategory.DOCUMENT_REVIEW,
        ServiceCategory.COURT_REPRESENTATION,
        ServiceCategory.CONTRACT_DRAFTING
      ],
      'Business & Professional': [
        ServiceCategory.BUSINESS_CONSULTATION,
        ServiceCategory.ACCOUNTING,
        ServiceCategory.TAX_PREPARATION,
        ServiceCategory.FINANCIAL_PLANNING
      ],
      'Home & Maintenance': [
        ServiceCategory.HOME_INSPECTION,
        ServiceCategory.CLEANING,
        ServiceCategory.REPAIR,
        ServiceCategory.INSTALLATION
      ],
      'Education & Training': [
        ServiceCategory.TUTORING,
        ServiceCategory.LANGUAGE_LESSON,
        ServiceCategory.SKILL_TRAINING,
        ServiceCategory.CERTIFICATION
      ],
      'Pet Services': [
        ServiceCategory.VETERINARY,
        ServiceCategory.PET_GROOMING,
        ServiceCategory.PET_TRAINING,
        ServiceCategory.PET_SITTING
      ],
      'Automotive': [
        ServiceCategory.CAR_INSPECTION,
        ServiceCategory.CAR_REPAIR,
        ServiceCategory.CAR_WASH
      ],
      'Technology': [
        ServiceCategory.TECH_SUPPORT,
        ServiceCategory.SOFTWARE_DEVELOPMENT,
        ServiceCategory.DEVICE_REPAIR
      ],
      'Creative Services': [
        ServiceCategory.PHOTOGRAPHY,
        ServiceCategory.DESIGN,
        ServiceCategory.WRITING
      ],
      'General Services': [
        ServiceCategory.CONSULTATION_GENERAL,
        ServiceCategory.APPOINTMENT,
        ServiceCategory.WORKSHOP,
        ServiceCategory.EVENT,
        ServiceCategory.OTHER
      ]
    };
  }

  /**
   * Get all available categories as array
   */
  static getAllCategories(): ServiceCategory[] {
    return Object.values(ServiceCategory);
  }

  /**
   * Check if category is valid
   */
  static isValidCategory(category: string): category is ServiceCategory {
    return Object.values(ServiceCategory).includes(category as ServiceCategory);
  }

  /**
   * Get icon/emoji for category (for UI display)
   */
  static getCategoryIcon(category: ServiceCategory): string {
    const icons: Record<ServiceCategory, string> = {
      // Medical & Healthcare
      [ServiceCategory.CONSULTATION]: '🩺',
      [ServiceCategory.DIAGNOSTIC]: '🔬',
      [ServiceCategory.THERAPY]: '🏥',
      [ServiceCategory.SURGERY]: '⚕️',
      [ServiceCategory.VACCINATION]: '💉',
      [ServiceCategory.EMERGENCY]: '🚑',
      
      // Dental
      [ServiceCategory.DENTAL_CHECKUP]: '🦷',
      [ServiceCategory.DENTAL_CLEANING]: '🪥',
      [ServiceCategory.DENTAL_SURGERY]: '🦷',
      [ServiceCategory.ORTHODONTICS]: '🦷',
      
      // Vision & Eye Care
      [ServiceCategory.EYE_EXAM]: '👁️',
      [ServiceCategory.VISION_THERAPY]: '👓',
      [ServiceCategory.CONTACT_LENS]: '🔍',
      
      // Beauty & Wellness
      [ServiceCategory.HAIRCUT]: '✂️',
      [ServiceCategory.HAIR_COLORING]: '🎨',
      [ServiceCategory.MANICURE]: '💅',
      [ServiceCategory.PEDICURE]: '🦶',
      [ServiceCategory.FACIAL]: '🧴',
      [ServiceCategory.MASSAGE]: '💆‍♀️',
      [ServiceCategory.SKINCARE]: '✨',
      
      // Fitness & Sports
      [ServiceCategory.PERSONAL_TRAINING]: '🏋️‍♂️',
      [ServiceCategory.GROUP_CLASS]: '👥',
      [ServiceCategory.PHYSIOTHERAPY]: '🦴',
      [ServiceCategory.SPORTS_THERAPY]: '⚽',
      
      // Legal Services
      [ServiceCategory.LEGAL_CONSULTATION]: '⚖️',
      [ServiceCategory.DOCUMENT_REVIEW]: '📄',
      [ServiceCategory.COURT_REPRESENTATION]: '🏛️',
      [ServiceCategory.CONTRACT_DRAFTING]: '📝',
      
      // Business & Professional
      [ServiceCategory.BUSINESS_CONSULTATION]: '💼',
      [ServiceCategory.ACCOUNTING]: '📊',
      [ServiceCategory.TAX_PREPARATION]: '💰',
      [ServiceCategory.FINANCIAL_PLANNING]: '💳',
      
      // Home & Maintenance
      [ServiceCategory.HOME_INSPECTION]: '🏠',
      [ServiceCategory.CLEANING]: '🧽',
      [ServiceCategory.REPAIR]: '🔧',
      [ServiceCategory.INSTALLATION]: '⚡',
      
      // Education & Training
      [ServiceCategory.TUTORING]: '📚',
      [ServiceCategory.LANGUAGE_LESSON]: '🗣️',
      [ServiceCategory.SKILL_TRAINING]: '🎯',
      [ServiceCategory.CERTIFICATION]: '🏆',
      
      // Pet Services
      [ServiceCategory.VETERINARY]: '🐕',
      [ServiceCategory.PET_GROOMING]: '✂️',
      [ServiceCategory.PET_TRAINING]: '🎾',
      [ServiceCategory.PET_SITTING]: '🐾',
      
      // Automotive
      [ServiceCategory.CAR_INSPECTION]: '🚗',
      [ServiceCategory.CAR_REPAIR]: '🔧',
      [ServiceCategory.CAR_WASH]: '🚿',
      
      // Technology
      [ServiceCategory.TECH_SUPPORT]: '💻',
      [ServiceCategory.SOFTWARE_DEVELOPMENT]: '👨‍💻',
      [ServiceCategory.DEVICE_REPAIR]: '🔧',
      
      // Creative Services
      [ServiceCategory.PHOTOGRAPHY]: '📸',
      [ServiceCategory.DESIGN]: '🎨',
      [ServiceCategory.WRITING]: '✍️',
      
      // General Services
      [ServiceCategory.CONSULTATION_GENERAL]: '💬',
      [ServiceCategory.APPOINTMENT]: '📅',
      [ServiceCategory.WORKSHOP]: '🔨',
      [ServiceCategory.EVENT]: '🎉',
      [ServiceCategory.OTHER]: '🔧'
    };

    return icons[category] || '🔧';
  }

  /**
   * Get suggested duration ranges for categories (in minutes)
   */
  static getSuggestedDuration(category: ServiceCategory): { min: number; max: number; default: number } {
    const durations: Record<ServiceCategory, { min: number; max: number; default: number }> = {
      // Medical & Healthcare
      [ServiceCategory.CONSULTATION]: { min: 15, max: 60, default: 30 },
      [ServiceCategory.DIAGNOSTIC]: { min: 10, max: 120, default: 30 },
      [ServiceCategory.THERAPY]: { min: 30, max: 90, default: 60 },
      [ServiceCategory.SURGERY]: { min: 60, max: 480, default: 120 },
      [ServiceCategory.VACCINATION]: { min: 5, max: 15, default: 10 },
      [ServiceCategory.EMERGENCY]: { min: 15, max: 240, default: 60 },
      
      // Dental
      [ServiceCategory.DENTAL_CHECKUP]: { min: 30, max: 60, default: 45 },
      [ServiceCategory.DENTAL_CLEANING]: { min: 45, max: 90, default: 60 },
      [ServiceCategory.DENTAL_SURGERY]: { min: 60, max: 240, default: 90 },
      [ServiceCategory.ORTHODONTICS]: { min: 30, max: 90, default: 45 },
      
      // Vision & Eye Care
      [ServiceCategory.EYE_EXAM]: { min: 30, max: 90, default: 60 },
      [ServiceCategory.VISION_THERAPY]: { min: 45, max: 90, default: 60 },
      [ServiceCategory.CONTACT_LENS]: { min: 15, max: 45, default: 30 },
      
      // Beauty & Wellness
      [ServiceCategory.HAIRCUT]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.HAIR_COLORING]: { min: 90, max: 240, default: 150 },
      [ServiceCategory.MANICURE]: { min: 30, max: 90, default: 45 },
      [ServiceCategory.PEDICURE]: { min: 45, max: 120, default: 60 },
      [ServiceCategory.FACIAL]: { min: 60, max: 120, default: 90 },
      [ServiceCategory.MASSAGE]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.SKINCARE]: { min: 45, max: 90, default: 60 },
      
      // Default for others
      [ServiceCategory.PERSONAL_TRAINING]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.GROUP_CLASS]: { min: 30, max: 90, default: 60 },
      [ServiceCategory.PHYSIOTHERAPY]: { min: 30, max: 90, default: 45 },
      [ServiceCategory.SPORTS_THERAPY]: { min: 45, max: 120, default: 60 },
      [ServiceCategory.LEGAL_CONSULTATION]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.DOCUMENT_REVIEW]: { min: 30, max: 240, default: 90 },
      [ServiceCategory.COURT_REPRESENTATION]: { min: 120, max: 480, default: 240 },
      [ServiceCategory.CONTRACT_DRAFTING]: { min: 60, max: 300, default: 120 },
      [ServiceCategory.BUSINESS_CONSULTATION]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.ACCOUNTING]: { min: 60, max: 240, default: 90 },
      [ServiceCategory.TAX_PREPARATION]: { min: 60, max: 180, default: 90 },
      [ServiceCategory.FINANCIAL_PLANNING]: { min: 60, max: 150, default: 90 },
      [ServiceCategory.HOME_INSPECTION]: { min: 60, max: 240, default: 120 },
      [ServiceCategory.CLEANING]: { min: 30, max: 240, default: 90 },
      [ServiceCategory.REPAIR]: { min: 30, max: 480, default: 120 },
      [ServiceCategory.INSTALLATION]: { min: 60, max: 480, default: 150 },
      [ServiceCategory.TUTORING]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.LANGUAGE_LESSON]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.SKILL_TRAINING]: { min: 60, max: 240, default: 120 },
      [ServiceCategory.CERTIFICATION]: { min: 120, max: 480, default: 240 },
      [ServiceCategory.VETERINARY]: { min: 15, max: 90, default: 30 },
      [ServiceCategory.PET_GROOMING]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.PET_TRAINING]: { min: 30, max: 90, default: 60 },
      [ServiceCategory.PET_SITTING]: { min: 60, max: 480, default: 240 },
      [ServiceCategory.CAR_INSPECTION]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.CAR_REPAIR]: { min: 60, max: 480, default: 120 },
      [ServiceCategory.CAR_WASH]: { min: 15, max: 60, default: 30 },
      [ServiceCategory.TECH_SUPPORT]: { min: 30, max: 120, default: 60 },
      [ServiceCategory.SOFTWARE_DEVELOPMENT]: { min: 60, max: 480, default: 180 },
      [ServiceCategory.DEVICE_REPAIR]: { min: 30, max: 240, default: 90 },
      [ServiceCategory.PHOTOGRAPHY]: { min: 30, max: 480, default: 120 },
      [ServiceCategory.DESIGN]: { min: 60, max: 480, default: 180 },
      [ServiceCategory.WRITING]: { min: 60, max: 480, default: 120 },
      [ServiceCategory.CONSULTATION_GENERAL]: { min: 15, max: 120, default: 45 },
      [ServiceCategory.APPOINTMENT]: { min: 15, max: 120, default: 30 },
      [ServiceCategory.WORKSHOP]: { min: 60, max: 480, default: 180 },
      [ServiceCategory.EVENT]: { min: 60, max: 480, default: 240 },
      [ServiceCategory.OTHER]: { min: 15, max: 480, default: 60 }
    };

    return durations[category] || { min: 15, max: 120, default: 30 };
  }
}
