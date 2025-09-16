-- 🏢 Business Migration - PostgreSQL
-- Clean Architecture + SOLID Compliant

-- Create Business table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slogan VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'CLINIC', 'LAW_FIRM', 'SALON', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    
    -- Branding information
    logo_url TEXT,
    cover_image_url TEXT,
    brand_primary_color VARCHAR(7), -- Hex color
    brand_secondary_color VARCHAR(7),
    brand_accent_color VARCHAR(7),
    brand_images TEXT[], -- Array of image URLs
    
    -- Contact information
    primary_email VARCHAR(255) NOT NULL,
    secondary_emails TEXT[], -- Array of emails
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phones TEXT[], -- Array of phones
    website VARCHAR(255),
    
    -- Social media
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    
    -- Settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT businesses_name_unique UNIQUE (name),
    CONSTRAINT businesses_primary_email_unique UNIQUE (primary_email),
    CONSTRAINT businesses_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT businesses_type_check CHECK (type IN (
        'CLINIC', 'DENTAL_CLINIC', 'VETERINARY_CLINIC', 'MEDICAL_CENTER',
        'LAW_FIRM', 'LEGAL_SERVICES', 'NOTARY',
        'BEAUTY_SALON', 'BARBER_SHOP', 'SPA', 'NAIL_SALON',
        'FITNESS_CENTER', 'GYM', 'YOGA_STUDIO', 'PILATES_STUDIO',
        'CONSULTING', 'COACHING', 'THERAPY',
        'RESTAURANT', 'CAFE', 'BAR',
        'AUTOMOTIVE', 'GARAGE', 'CAR_WASH',
        'EDUCATION', 'TRAINING_CENTER', 'LANGUAGE_SCHOOL',
        'REAL_ESTATE', 'INSURANCE', 'FINANCE',
        'OTHER'
    ))
);

-- Create Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Personal information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Professional information
    role VARCHAR(30) NOT NULL, -- StaffRole enum values
    department VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Working hours (JSON for flexibility)
    working_hours JSONB DEFAULT '{}',
    
    -- Permissions (JSON for flexibility)
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT staff_business_email_unique UNIQUE (business_id, email),
    CONSTRAINT staff_role_check CHECK (role IN (
        'OWNER', 'ADMIN', 'MANAGER', 
        'RECEPTIONIST', 'ASSISTANT', 'COORDINATOR',
        'DOCTOR', 'DENTIST', 'VETERINARIAN', 'NURSE', 'THERAPIST',
        'LAWYER', 'PARALEGAL', 'LEGAL_ASSISTANT',
        'STYLIST', 'BARBER', 'AESTHETICIAN', 'MASSEUR',
        'TRAINER', 'INSTRUCTOR', 'COACH',
        'CONSULTANT', 'SPECIALIST', 'TECHNICIAN',
        'INTERN', 'VOLUNTEER', 'CONTRACTOR'
    ))
);

-- Create Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Service information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    
    -- Duration and pricing
    duration INTEGER NOT NULL, -- in minutes
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    
    -- Settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    
    -- Requirements (JSON for flexibility)
    requirements JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT services_business_name_unique UNIQUE (business_id, name),
    CONSTRAINT services_duration_positive CHECK (duration > 0),
    CONSTRAINT services_price_non_negative CHECK (price_amount >= 0),
    CONSTRAINT services_currency_check CHECK (price_currency IN ('EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY'))
);

-- Create Calendars table
CREATE TABLE IF NOT EXISTS calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Calendar information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- 'INDIVIDUAL', 'SHARED', 'RESOURCE', 'APPOINTMENT'
    
    -- Address information (each calendar has a specific address/location)
    address_street VARCHAR(255) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state VARCHAR(100) NOT NULL,
    address_zip_code VARCHAR(20) NOT NULL,
    address_country VARCHAR(100) NOT NULL,
    
    -- Working hours (JSON for flexibility)
    working_hours JSONB NOT NULL,
    
    -- Settings (JSON for flexibility)
    settings JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT calendars_business_name_unique UNIQUE (business_id, name),
    CONSTRAINT calendars_type_check CHECK (type IN ('INDIVIDUAL', 'SHARED', 'RESOURCE', 'APPOINTMENT'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(type);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);

CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_price_amount ON services(price_amount);

CREATE INDEX IF NOT EXISTS idx_calendars_business_id ON calendars(business_id);
CREATE INDEX IF NOT EXISTS idx_calendars_type ON calendars(type);
CREATE INDEX IF NOT EXISTS idx_calendars_is_active ON calendars(is_active);
CREATE INDEX IF NOT EXISTS idx_calendars_address_city ON calendars(address_city);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendars_updated_at ON calendars;
CREATE TRIGGER update_calendars_updated_at
    BEFORE UPDATE ON calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE businesses IS 'Stores business/organization information with branding, contact details, and settings';
COMMENT ON COLUMN businesses.type IS 'Business type for industry-specific features and validations';
COMMENT ON COLUMN businesses.settings IS 'Flexible JSON storage for business-specific configuration (timezone, currency, appointment settings, etc.)';

COMMENT ON TABLE staff IS 'Staff members associated with businesses, including roles, permissions, and working hours';
COMMENT ON COLUMN staff.role IS 'Staff role from StaffRole enum, determines base permissions and capabilities';
COMMENT ON COLUMN staff.working_hours IS 'JSON object defining weekly schedule (monday: {start: "09:00", end: "17:00"}, etc.)';
COMMENT ON COLUMN staff.permissions IS 'JSON object with granular permissions (canManageAppointments, canViewReports, etc.)';

COMMENT ON TABLE services IS 'Services offered by businesses with pricing, duration, and booking settings';
COMMENT ON COLUMN services.settings IS 'JSON object with booking settings (isOnlineBookingEnabled, requiresApproval, bufferTime, etc.)';
COMMENT ON COLUMN services.requirements IS 'JSON object with service requirements (preparation, materials, restrictions, etc.)';

COMMENT ON TABLE calendars IS 'Calendars associated with specific business locations/addresses for appointment scheduling';
COMMENT ON COLUMN calendars.type IS 'Calendar type: INDIVIDUAL (personal), SHARED (team), RESOURCE (room/equipment), APPOINTMENT (booking)';
COMMENT ON COLUMN calendars.working_hours IS 'JSON object defining available time slots for each day of the week';
COMMENT ON COLUMN calendars.settings IS 'JSON object with calendar settings (timezone, slotDuration, bufferTime, color, etc.)';
