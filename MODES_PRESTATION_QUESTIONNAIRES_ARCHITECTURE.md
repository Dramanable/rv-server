# 🎯 ARCHITECTURE TECHNIQUE - Modes de Prestation & Questionnaires Clients

## 📋 **ANALYSE FONCTIONNELLE**

### **1. Modes de Prestation**

#### **Types de Prestations Supportés :**

**🏢 Présentiel :**

- Cabinet médical, salon de coiffure, bureau de conseil
- Domicile client (services à domicile)
- Locaux entreprise (formations, audits)
- Sites externes (événements, interventions)

**💻 À Distance :**

- Conseil par email/chat
- Formation e-learning
- Support technique à distance
- Coaching écrit/asynchrone

**📹 Visioconférence :**

- Consultations médicales télé
- Formations interactives
- Réunions de conseil
- Thérapies en ligne

**📞 Appel Téléphonique :**

- Consultations rapides
- Suivi de dossiers
- Support technique vocal
- Coaching téléphonique

**🔄 Hybride :**

- Combinaison de plusieurs modes
- Phases différentes selon l'avancement
- Adaptation selon les besoins clients

### **2. Informations Supplémentaires Clients**

#### **Types de Questions Supportées :**

- **Texte libre** : Descriptions, commentaires
- **Choix multiple** : Sélections prédéfinies
- **Cases à cocher** : Options multiples
- **Numériques** : Âge, poids, budget, etc.
- **Dates** : Historique, échéances
- **Fichiers** : Documents, photos, analyses
- **Échelles** : Notation 1-10, satisfaction

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **1. Domain Layer**

#### **ServiceDeliveryMode Value Object**

```typescript
export enum DeliveryModeType {
  IN_PERSON = 'IN_PERSON',
  REMOTE = 'REMOTE',
  VIDEO_CONFERENCE = 'VIDEO_CONFERENCE',
  PHONE_CALL = 'PHONE_CALL',
  HYBRID = 'HYBRID',
}

export class ServiceDeliveryMode {
  private constructor(
    private readonly type: DeliveryModeType,
    private readonly isDefault: boolean,
    private readonly specificRequirements: DeliveryRequirement[],
    private readonly technicalSpecs: TechnicalSpecification[],
    private readonly additionalCosts: Money[],
  ) {}

  static create(config: DeliveryModeConfig): ServiceDeliveryMode {
    if (config.type === DeliveryModeType.VIDEO_CONFERENCE) {
      if (
        !config.technicalSpecs?.some((spec) => spec.type === 'VIDEO_PLATFORM')
      ) {
        throw new DomainError('Visioconférence requiert une plateforme vidéo');
      }
    }

    if (config.type === DeliveryModeType.IN_PERSON) {
      if (
        !config.specificRequirements?.some((req) => req.type === 'LOCATION')
      ) {
        throw new DomainError('Présentiel requiert une localisation');
      }
    }

    return new ServiceDeliveryMode(
      config.type,
      config.isDefault || false,
      config.specificRequirements || [],
      config.technicalSpecs || [],
      config.additionalCosts || [],
    );
  }

  requiresPhysicalPresence(): boolean {
    return (
      this.type === DeliveryModeType.IN_PERSON ||
      (this.type === DeliveryModeType.HYBRID &&
        this.specificRequirements.some((req) => req.requiresPresence))
    );
  }

  getTechnicalRequirements(): TechnicalSpecification[] {
    switch (this.type) {
      case DeliveryModeType.VIDEO_CONFERENCE:
        return [
          TechnicalSpecification.create('CAMERA', 'Caméra fonctionnelle'),
          TechnicalSpecification.create('MICROPHONE', 'Microphone de qualité'),
          TechnicalSpecification.create(
            'INTERNET',
            'Connexion stable 10+ Mbps',
          ),
        ];
      case DeliveryModeType.PHONE_CALL:
        return [TechnicalSpecification.create('PHONE', 'Téléphone ou mobile')];
      default:
        return this.technicalSpecs;
    }
  }

  getClientInstructions(): string[] {
    switch (this.type) {
      case DeliveryModeType.VIDEO_CONFERENCE:
        return [
          'Testez votre caméra et microphone avant le rendez-vous',
          'Choisissez un endroit calme et bien éclairé',
          'Vérifiez votre connexion internet',
          'Le lien de connexion vous sera envoyé par email',
        ];
      case DeliveryModeType.IN_PERSON:
        return [
          "Présentez-vous à l'heure au lieu indiqué",
          'Apportez les documents demandés',
          'Respectez les consignes sanitaires en vigueur',
        ];
      case DeliveryModeType.PHONE_CALL:
        return [
          "Assurez-vous d'être disponible au numéro indiqué",
          'Privilégiez un environnement calme',
          'Ayez vos documents à portée de main',
        ];
      default:
        return [];
    }
  }
}
```

#### **ClientQuestionnaire Entity**

```typescript
export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  FILE = 'FILE',
  SCALE = 'SCALE',
}

export class QuestionField {
  private constructor(
    private readonly id: string,
    private readonly type: QuestionType,
    private readonly label: string,
    private readonly description: string,
    private readonly isRequired: boolean,
    private readonly validationRules: ValidationRule[],
    private readonly options: QuestionOption[],
    private readonly conditionalLogic: ConditionalRule[],
  ) {}

  static create(config: QuestionFieldConfig): QuestionField {
    if (config.type === QuestionType.SELECT && !config.options?.length) {
      throw new DomainError('Question à choix multiple requiert des options');
    }

    if (
      config.type === QuestionType.FILE &&
      !config.validationRules?.some((rule) => rule.type === 'FILE_TYPE')
    ) {
      throw new DomainError('Question fichier requiert la validation du type');
    }

    return new QuestionField(
      config.id || generateId(),
      config.type,
      config.label,
      config.description || '',
      config.isRequired || false,
      config.validationRules || [],
      config.options || [],
      config.conditionalLogic || [],
    );
  }

  shouldBeDisplayed(previousAnswers: Map<string, any>): boolean {
    if (!this.conditionalLogic.length) return true;

    return this.conditionalLogic.every((rule) =>
      rule.evaluate(previousAnswers),
    );
  }

  validateAnswer(answer: any): ValidationResult {
    if (this.isRequired && !answer) {
      return ValidationResult.error('Champ obligatoire');
    }

    for (const rule of this.validationRules) {
      const result = rule.validate(answer);
      if (!result.isValid) {
        return result;
      }
    }

    return ValidationResult.success();
  }
}

export class ClientQuestionnaire {
  private constructor(
    private readonly id: QuestionnaireId,
    private readonly serviceId: ServiceId,
    private readonly name: string,
    private readonly description: string,
    private readonly fields: QuestionField[],
    private readonly isActive: boolean,
    private readonly version: number,
  ) {}

  static create(config: QuestionnaireConfig): ClientQuestionnaire {
    if (!config.fields?.length) {
      throw new DomainError(
        'Questionnaire doit contenir au moins une question',
      );
    }

    // Valider que les références conditionnelles sont cohérentes
    const fieldIds = config.fields.map((f) => f.getId());
    config.fields.forEach((field) => {
      field.getConditionalLogic().forEach((rule) => {
        if (!fieldIds.includes(rule.dependsOnFieldId)) {
          throw new DomainError(
            `Référence conditionnelle invalide: ${rule.dependsOnFieldId}`,
          );
        }
      });
    });

    return new ClientQuestionnaire(
      QuestionnaireId.generate(),
      config.serviceId,
      config.name,
      config.description || '',
      config.fields,
      config.isActive !== false,
      config.version || 1,
    );
  }

  validateAllAnswers(answers: Map<string, any>): ValidationResult {
    const visibleFields = this.fields.filter((field) =>
      field.shouldBeDisplayed(answers),
    );

    for (const field of visibleFields) {
      const answer = answers.get(field.getId());
      const result = field.validateAnswer(answer);

      if (!result.isValid) {
        return ValidationResult.error(
          `${field.getLabel()}: ${result.errorMessage}`,
        );
      }
    }

    return ValidationResult.success();
  }

  getRequiredInformation(): QuestionField[] {
    return this.fields.filter((field) => field.isRequired());
  }
}
```

#### **AppointmentAdditionalInfo Value Object**

```typescript
export class AppointmentAdditionalInfo {
  private constructor(
    private readonly answers: Map<string, any>,
    private readonly questionnaireVersion: number,
    private readonly submittedAt: Date,
    private readonly validatedAt: Date | null,
    private readonly validationErrors: string[],
  ) {}

  static create(
    answers: Map<string, any>,
    questionnaire: ClientQuestionnaire,
  ): AppointmentAdditionalInfo {
    const validation = questionnaire.validateAllAnswers(answers);

    if (!validation.isValid) {
      throw new DomainError(
        `Informations invalides: ${validation.errorMessage}`,
      );
    }

    return new AppointmentAdditionalInfo(
      answers,
      questionnaire.getVersion(),
      new Date(),
      new Date(),
      [],
    );
  }

  getAnswer(questionId: string): any {
    return this.answers.get(questionId);
  }

  hasRequiredInformation(questionnaire: ClientQuestionnaire): boolean {
    const requiredFields = questionnaire.getRequiredInformation();

    return requiredFields.every(
      (field) =>
        this.answers.has(field.getId()) &&
        this.answers.get(field.getId()) !== null &&
        this.answers.get(field.getId()) !== '',
    );
  }

  isComplete(): boolean {
    return this.validatedAt !== null && this.validationErrors.length === 0;
  }
}
```

### **2. Application Layer**

#### **BookAppointmentWithAdditionalInfo Use Case**

```typescript
export class BookAppointmentWithAdditionalInfoUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly questionnaireRepository: QuestionnaireRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly deliveryModeService: DeliveryModeService,
  ) {}

  async execute(
    request: BookAppointmentWithAdditionalInfoRequest,
  ): Promise<BookAppointmentWithAdditionalInfoResponse> {
    // 1. Récupérer le service et ses exigences
    const service = await this.serviceRepository.findById(request.serviceId);
    if (!service) {
      throw new ServiceNotFoundError(request.serviceId);
    }

    // 2. Valider le mode de prestation
    const deliveryMode = service.getDeliveryMode(request.deliveryModeType);
    if (!deliveryMode) {
      throw new DeliveryModeNotSupportedError(
        request.deliveryModeType,
        request.serviceId,
      );
    }

    // 3. Récupérer et valider le questionnaire
    const questionnaire = await this.questionnaireRepository.findByServiceId(
      request.serviceId,
    );
    if (questionnaire) {
      const additionalInfo = AppointmentAdditionalInfo.create(
        new Map(Object.entries(request.additionalInfo || {})),
        questionnaire,
      );

      if (!additionalInfo.hasRequiredInformation(questionnaire)) {
        throw new MissingRequiredInformationError(
          questionnaire.getRequiredInformation(),
        );
      }
    }

    // 4. Valider la disponibilité selon le mode de prestation
    const isAvailable = await this.validateAvailabilityForDeliveryMode(
      request.professionalId,
      request.scheduledAt,
      service.getDuration(),
      deliveryMode,
    );

    if (!isAvailable) {
      throw new ProfessionalNotAvailableError(
        request.professionalId,
        request.scheduledAt,
      );
    }

    // 5. Créer le rendez-vous avec informations supplémentaires
    const appointment = Appointment.createWithAdditionalInfo({
      serviceId: request.serviceId,
      professionalId: request.professionalId,
      clientId: request.clientId,
      scheduledAt: request.scheduledAt,
      deliveryMode: deliveryMode,
      additionalInfo: additionalInfo,
    });

    // 6. Préparer les éléments spécifiques au mode de prestation
    await this.setupDeliveryModeRequirements(appointment, deliveryMode);

    // 7. Sauvegarder le rendez-vous
    const savedAppointment = await this.appointmentRepository.save(appointment);

    return BookAppointmentWithAdditionalInfoResponse.fromAppointment(
      savedAppointment,
    );
  }

  private async setupDeliveryModeRequirements(
    appointment: Appointment,
    deliveryMode: ServiceDeliveryMode,
  ): Promise<void> {
    switch (deliveryMode.getType()) {
      case DeliveryModeType.VIDEO_CONFERENCE:
        await this.deliveryModeService.createVideoConferenceLink(appointment);
        break;
      case DeliveryModeType.PHONE_CALL:
        await this.deliveryModeService.validatePhoneNumber(appointment);
        break;
      case DeliveryModeType.IN_PERSON:
        await this.deliveryModeService.confirmLocation(appointment);
        break;
      // Autres modes...
    }
  }
}
```

#### **ConfigureServiceDeliveryModes Use Case**

```typescript
export class ConfigureServiceDeliveryModesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    request: ConfigureServiceDeliveryModesRequest,
  ): Promise<ConfigureServiceDeliveryModesResponse> {
    // 1. Vérifier les permissions
    await this.authorizationService.ensureCanManageService(
      request.requestingUserId,
      request.serviceId,
    );

    // 2. Récupérer le service
    const service = await this.serviceRepository.findById(request.serviceId);
    if (!service) {
      throw new ServiceNotFoundError(request.serviceId);
    }

    // 3. Créer les modes de prestation
    const deliveryModes = request.deliveryModes.map((modeConfig) =>
      ServiceDeliveryMode.create(modeConfig),
    );

    // 4. Valider qu'au moins un mode est défini par défaut
    const hasDefault = deliveryModes.some((mode) => mode.isDefault());
    if (!hasDefault) {
      throw new DomainError(
        'Au moins un mode de prestation doit être défini par défaut',
      );
    }

    // 5. Mettre à jour le service
    service.updateDeliveryModes(deliveryModes);

    // 6. Sauvegarder
    const updatedService = await this.serviceRepository.save(service);

    return ConfigureServiceDeliveryModesResponse.fromService(updatedService);
  }
}
```

### **3. Infrastructure Layer**

#### **ServiceDeliveryModeOrmEntity**

```typescript
@Entity('service_delivery_modes')
export class ServiceDeliveryModeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'delivery_type', type: 'varchar', length: 50 })
  deliveryType: string; // DeliveryModeType

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'specific_requirements', type: 'jsonb', nullable: true })
  specificRequirements: any[];

  @Column({ name: 'technical_specs', type: 'jsonb', nullable: true })
  technicalSpecs: any[];

  @Column({ name: 'additional_costs', type: 'jsonb', nullable: true })
  additionalCosts: any[];

  @Column({ name: 'client_instructions', type: 'text', nullable: true })
  clientInstructions: string;

  @ManyToOne(() => ServiceOrmEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### **ClientQuestionnaireOrmEntity**

```typescript
@Entity('client_questionnaires')
export class ClientQuestionnaireOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'fields', type: 'jsonb' })
  fields: any[]; // QuestionField[]

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @ManyToOne(() => ServiceOrmEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### **AppointmentAdditionalInfoOrmEntity**

```typescript
@Entity('appointment_additional_info')
export class AppointmentAdditionalInfoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @Column({ name: 'questionnaire_id', nullable: true })
  questionnaireId: string;

  @Column({ name: 'answers', type: 'jsonb' })
  answers: any; // Map<string, any>

  @Column({ name: 'questionnaire_version', type: 'int' })
  questionnaireVersion: number;

  @Column({ name: 'submitted_at', type: 'timestamp' })
  submittedAt: Date;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ name: 'validation_errors', type: 'jsonb', nullable: true })
  validationErrors: string[];

  @OneToOne(() => AppointmentOrmEntity)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentOrmEntity;

  @ManyToOne(() => ClientQuestionnaireOrmEntity)
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: ClientQuestionnaireOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### **Migration TypeORM**

```typescript
export class CreateDeliveryModesAndQuestionnaires
  implements MigrationInterface
{
  name = 'CreateDeliveryModesAndQuestionnaires';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Table des modes de prestation
    await queryRunner.query(`
      CREATE TABLE "${schema}"."service_delivery_modes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "service_id" uuid NOT NULL,
        "delivery_type" varchar(50) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "specific_requirements" jsonb,
        "technical_specs" jsonb,
        "additional_costs" jsonb,
        "client_instructions" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_service_delivery_modes_service_id" 
          FOREIGN KEY ("service_id") REFERENCES "${schema}"."services"("id") ON DELETE CASCADE
      )
    `);

    // Table des questionnaires clients
    await queryRunner.query(`
      CREATE TABLE "${schema}"."client_questionnaires" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "service_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text,
        "fields" jsonb NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "version" integer NOT NULL DEFAULT 1,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_client_questionnaires_service_id" 
          FOREIGN KEY ("service_id") REFERENCES "${schema}"."services"("id") ON DELETE CASCADE
      )
    `);

    // Table des informations supplémentaires de rendez-vous
    await queryRunner.query(`
      CREATE TABLE "${schema}"."appointment_additional_info" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "appointment_id" uuid NOT NULL,
        "questionnaire_id" uuid,
        "answers" jsonb NOT NULL,
        "questionnaire_version" integer NOT NULL,
        "submitted_at" timestamp NOT NULL,
        "validated_at" timestamp,
        "validation_errors" jsonb,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_appointment_additional_info_appointment_id" 
          FOREIGN KEY ("appointment_id") REFERENCES "${schema}"."appointments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointment_additional_info_questionnaire_id" 
          FOREIGN KEY ("questionnaire_id") REFERENCES "${schema}"."client_questionnaires"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_appointment_additional_info_appointment" 
          UNIQUE ("appointment_id")
      )
    `);

    // Ajouter colonne delivery_mode à appointments
    await queryRunner.query(`
      ALTER TABLE "${schema}"."appointments" 
      ADD COLUMN "delivery_mode_type" varchar(50) DEFAULT 'IN_PERSON'
    `);

    // Index pour optimiser les requêtes
    await queryRunner.query(`
      CREATE INDEX "IDX_service_delivery_modes_service_id" 
      ON "${schema}"."service_delivery_modes" ("service_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_client_questionnaires_service_id" 
      ON "${schema}"."client_questionnaires" ("service_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointment_additional_info_appointment_id" 
      ON "${schema}"."appointment_additional_info" ("appointment_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(
      `ALTER TABLE "${schema}"."appointments" DROP COLUMN IF EXISTS "delivery_mode_type"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${schema}"."appointment_additional_info"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${schema}"."client_questionnaires"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${schema}"."service_delivery_modes"`,
    );
  }
}
```

### **4. Presentation Layer**

#### **DeliveryModeDto**

```typescript
export class ConfigureDeliveryModeDto {
  @ApiProperty({
    enum: ['IN_PERSON', 'REMOTE', 'VIDEO_CONFERENCE', 'PHONE_CALL', 'HYBRID'],
    description: 'Type de mode de prestation',
  })
  @IsEnum(['IN_PERSON', 'REMOTE', 'VIDEO_CONFERENCE', 'PHONE_CALL', 'HYBRID'])
  readonly deliveryType: string;

  @ApiProperty({ description: 'Mode par défaut pour ce service' })
  @IsBoolean()
  readonly isDefault: boolean;

  @ApiPropertyOptional({
    description: 'Exigences spécifiques pour ce mode',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly specificRequirements?: any[];

  @ApiPropertyOptional({
    description: 'Spécifications techniques requises',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly technicalSpecs?: any[];

  @ApiPropertyOptional({
    description: 'Coûts supplémentaires pour ce mode',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly additionalCosts?: any[];
}

export class BookAppointmentWithInfoDto {
  @ApiProperty({ description: 'ID du service' })
  @IsUUID()
  readonly serviceId: string;

  @ApiProperty({ description: 'ID du professionnel' })
  @IsUUID()
  readonly professionalId: string;

  @ApiProperty({ description: 'Date et heure du rendez-vous' })
  @IsISO8601()
  readonly scheduledAt: string;

  @ApiProperty({
    enum: ['IN_PERSON', 'REMOTE', 'VIDEO_CONFERENCE', 'PHONE_CALL'],
    description: 'Mode de prestation choisi',
  })
  @IsEnum(['IN_PERSON', 'REMOTE', 'VIDEO_CONFERENCE', 'PHONE_CALL'])
  readonly deliveryModeType: string;

  @ApiPropertyOptional({
    description: 'Informations supplémentaires du client',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  readonly additionalInfo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Notes spéciales' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly notes?: string;
}
```

#### **QuestionnaireDto**

```typescript
export class QuestionFieldDto {
  @ApiProperty({ description: 'ID unique de la question' })
  @IsString()
  readonly id: string;

  @ApiProperty({
    enum: [
      'TEXT',
      'TEXTAREA',
      'SELECT',
      'MULTISELECT',
      'CHECKBOX',
      'RADIO',
      'NUMBER',
      'DATE',
      'FILE',
      'SCALE',
    ],
    description: 'Type de question',
  })
  @IsEnum([
    'TEXT',
    'TEXTAREA',
    'SELECT',
    'MULTISELECT',
    'CHECKBOX',
    'RADIO',
    'NUMBER',
    'DATE',
    'FILE',
    'SCALE',
  ])
  readonly type: string;

  @ApiProperty({ description: 'Libellé de la question' })
  @IsString()
  @Length(1, 200)
  readonly label: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ description: 'Question obligatoire' })
  @IsBoolean()
  readonly isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Règles de validation',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly validationRules?: any[];

  @ApiPropertyOptional({
    description: 'Options pour questions à choix',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly options?: any[];

  @ApiPropertyOptional({
    description: 'Logique conditionnelle',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsArray()
  readonly conditionalLogic?: any[];
}

export class CreateQuestionnaireDto {
  @ApiProperty({ description: 'ID du service' })
  @IsUUID()
  readonly serviceId: string;

  @ApiProperty({ description: 'Nom du questionnaire' })
  @IsString()
  @Length(1, 200)
  readonly name: string;

  @ApiPropertyOptional({ description: 'Description du questionnaire' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly description?: string;

  @ApiProperty({
    description: 'Liste des questions',
    type: [QuestionFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionFieldDto)
  readonly fields: QuestionFieldDto[];

  @ApiProperty({ description: 'Questionnaire actif' })
  @IsBoolean()
  readonly isActive: boolean;
}
```

---

## 🎯 **CAS D'USAGE SPÉCIFIQUES**

### **Secteur Médical**

- **Mode** : Visioconférence pour téléconsultation
- **Questions** : Symptômes, antécédents, médicaments actuels
- **Fichiers** : Analyses médicales, photos de symptômes

### **Secteur Formation**

- **Mode** : Hybride (présentiel + e-learning)
- **Questions** : Niveau, objectifs, équipement disponible
- **Validation** : Tests de prérequis, certification

### **Secteur Bien-être**

- **Mode** : Présentiel avec options domicile
- **Questions** : Allergies, préférences, historique
- **Personnalisation** : Adaptations selon les réponses

### **Secteur Technique**

- **Mode** : À distance avec escalade présentiel
- **Questions** : Équipement, problème détaillé, urgence
- **Diagnostic** : Photos, vidéos du problème

**Cette architecture permet une personnalisation maximale tout en conservant la simplicité d'utilisation !**
