import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsUUID,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsIn,
  Length,
} from "class-validator";

export class ClientInfoDto {
  @ApiProperty({
    description: "First name of the client",
    example: "Jean",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly firstName!: string;

  @ApiProperty({
    description: "Last name of the client",
    example: "Dupont",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly lastName!: string;

  @ApiProperty({
    description: "Email address of the client",
    example: "jean.dupont@example.com",
    format: "email",
  })
  @IsEmail()
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Phone number of the client",
    example: "+33123456789",
    pattern: "^\\+[1-9]\\d{1,14}$",
  })
  @IsOptional()
  @IsPhoneNumber()
  readonly phone?: string;

  @ApiPropertyOptional({
    description: "Whether this is a new client",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isNewClient?: boolean;
}

export class BookedByInfoDto {
  @ApiProperty({
    description: "First name of the person booking for the client",
    example: "Marie",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly firstName!: string;

  @ApiProperty({
    description: "Last name of the person booking for the client",
    example: "Dupont",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly lastName!: string;

  @ApiProperty({
    description: "Email address of the person booking",
    example: "marie.dupont@example.com",
    format: "email",
  })
  @IsEmail()
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Phone number of the person booking",
    example: "+33987654321",
    pattern: "^\\+[1-9]\\d{1,14}$",
  })
  @IsOptional()
  @IsPhoneNumber()
  readonly phone?: string;

  @ApiProperty({
    description: "Relationship to the client",
    example: "SPOUSE",
    enum: [
      "PARENT",
      "SPOUSE",
      "SIBLING",
      "CHILD",
      "GUARDIAN",
      "FAMILY_MEMBER",
      "OTHER",
    ],
  })
  @IsString()
  @IsIn([
    "PARENT",
    "SPOUSE",
    "SIBLING",
    "CHILD",
    "GUARDIAN",
    "FAMILY_MEMBER",
    "OTHER",
  ])
  readonly relationship!: string;

  @ApiPropertyOptional({
    description: 'Description of relationship when "OTHER" is selected',
    example: "Voisin proche qui aide",
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  readonly relationshipDescription?: string;
}

export class ClientInfoWithBookedByDto extends ClientInfoDto {
  @ApiPropertyOptional({
    description:
      "Information about the person booking for the client (family member)",
    type: BookedByInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookedByInfoDto)
  readonly bookedBy?: BookedByInfoDto;
}

export class BookAppointmentDto {
  @ApiProperty({
    description: "UUID of the business where the appointment is booked",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsUUID()
  readonly businessId!: string;

  @ApiProperty({
    description: "UUID of the calendar for the appointment",
    example: "660e8400-e29b-41d4-a716-446655440001",
    format: "uuid",
  })
  @IsUUID()
  readonly calendarId!: string;

  @ApiProperty({
    description: "UUID of the service being booked",
    example: "770e8400-e29b-41d4-a716-446655440002",
    format: "uuid",
  })
  @IsUUID()
  readonly serviceId!: string;

  @ApiProperty({
    description: "Start time of the appointment (ISO 8601)",
    example: "2025-01-15T14:30:00.000Z",
    format: "date-time",
  })
  @IsDateString()
  readonly startTime!: string;

  @ApiProperty({
    description: "End time of the appointment (ISO 8601)",
    example: "2025-01-15T15:30:00.000Z",
    format: "date-time",
  })
  @IsDateString()
  readonly endTime!: string;

  @ApiProperty({
    description: "Client information including optional family booking details",
    type: ClientInfoWithBookedByDto,
  })
  @ValidateNested()
  @Type(() => ClientInfoWithBookedByDto)
  readonly clientInfo!: ClientInfoWithBookedByDto;

  @ApiPropertyOptional({
    description: "UUID of the assigned staff member",
    example: "880e8400-e29b-41d4-a716-446655440003",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly assignedStaffId?: string;

  @ApiPropertyOptional({
    description: "Custom title for the appointment",
    example: "Consultation de routine",
    minLength: 5,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  readonly title?: string;

  @ApiPropertyOptional({
    description: "Additional description or notes",
    example: "Contrôle annuel avec vaccins",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly description?: string;
}
