# 🏥 PHASE 1 : Services Multi-Professionnels - Architecture Technique

## 🎯 **OBJECTIF PHASE 1**

Implémenter un système de **services multi-professionnels** permettant de :

- **Réserver des rendez-vous** nécessitant plusieurs professionnels simultanément
- **Gérer la disponibilité synchronisée** de toute l'équipe requise
- **Optimiser l'allocation des ressources** humaines spécialisées
- **Impact client direct majeur** : Nouvelles possibilités de réservation

## 🏗️ **ARCHITECTURE TECHNIQUE - TDD STRICT**

### 📋 **1. DOMAIN LAYER - Nouvelles Entités & Value Objects**

#### **🎯 Value Objects Multi-Pro**

```typescript
// TeamRequirement.ts - Définition équipe requise
export class TeamRequirement {
  constructor(
    private readonly professionalRole: ProfessionalRole,
    private readonly requiredCount: number,
    private readonly requiredSkills: Skill[],
    private readonly isLead: boolean = false,
  ) {}

  static create(
    role: ProfessionalRole,
    count: number,
    skills: Skill[],
  ): TeamRequirement;
  getLead(): TeamRequirement | null;
  getTotalProfessionals(): number;
  hasRequiredSkill(skill: Skill): boolean;
}

// TeamComposition.ts - Composition d'équipe finale
export class TeamComposition {
  constructor(
    private readonly requirements: TeamRequirement[],
    private readonly assignedProfessionals: AssignedProfessional[],
  ) {}

  static create(requirements: TeamRequirement[]): TeamComposition;
  assignProfessional(professional: Staff, requirement: TeamRequirement): void;
  isFullyStaffed(): boolean;
  getConflicts(): TeamConflict[];
  calculateOptimalSchedule(): TimeSlot[];
}

// ServiceCapacity.ts - Capacité service multi-pro
export class ServiceCapacity {
  constructor(
    private readonly simultaneousTeams: number,
    private readonly resourceSharing: ResourceSharingPolicy,
  ) {}

  static createUnlimited(): ServiceCapacity;
  static createLimited(maxTeams: number): ServiceCapacity;
  canAccommodateTeam(teamSize: number, timeSlot: TimeSlot): boolean;
}
```

#### **🏢 Entité Business - Extension Multi-Pro**

```typescript
// business.entity.ts - Extension
export class Business {
  // ... existing properties

  private teamServices: Map<ServiceId, TeamRequirement[]> = new Map();
  private professionalPool: Staff[] = [];

  configureTeamService(
    serviceId: ServiceId,
    requirements: TeamRequirement[],
  ): void {
    // Validation business rules
    this.teamServices.set(serviceId, requirements);
  }

  getAvailableTeamsForSlot(
    serviceId: ServiceId,
    timeSlot: TimeSlot,
  ): TeamComposition[] {
    // Algorithme d'optimisation d'équipe
  }

  canProvideTeamService(serviceId: ServiceId): boolean {
    return this.teamServices.has(serviceId);
  }
}
```

#### **⚕️ Entité Service - Extension Multi-Pro**

```typescript
// service.entity.ts - Extension
export class Service {
  // ... existing properties

  private teamRequirements: TeamRequirement[] = [];
  private isTeamService: boolean = false;
  private capacity: ServiceCapacity;

  configureAsTeamService(requirements: TeamRequirement[]): void {
    this.validateTeamRequirements(requirements);
    this.teamRequirements = requirements;
    this.isTeamService = true;
  }

  requiresTeam(): boolean {
    return this.isTeamService && this.teamRequirements.length > 0;
  }

  getMinimumTeamSize(): number {
    return this.teamRequirements.reduce(
      (sum, req) => sum + req.getRequiredCount(),
      0,
    );
  }

  calculateTeamPrice(teamComposition: TeamComposition): Money {
    // Calcul prix équipe avec bonus/malus selon composition
  }
}
```

### 📋 **2. APPLICATION LAYER - Use Cases Multi-Pro**

#### **🎯 Use Cases Principaux**

```typescript
// ConfigureTeamServiceUseCase.ts
export class ConfigureTeamServiceUseCase {
  async execute(
    request: ConfigureTeamServiceRequest,
  ): Promise<ConfigureTeamServiceResponse> {
    // 1. Validation permissions business
    // 2. Validation cohérence équipe requise
    // 3. Vérification disponibilité pool professionnel
    // 4. Configuration service multi-pro
    // 5. Notification changements staff concerné
  }
}

// FindAvailableTeamSlotsUseCase.ts
export class FindAvailableTeamSlotsUseCase {
  async execute(request: FindTeamSlotsRequest): Promise<FindTeamSlotsResponse> {
    // 1. Récupération requirements service
    // 2. Analyse disponibilités individuelles staff
    // 3. Calcul intersections libres pour équipe complète
    // 4. Optimisation allocation selon priorités/préférences
    // 5. Retour créneaux équipe avec composition proposée
  }
}

// BookTeamAppointmentUseCase.ts
export class BookTeamAppointmentUseCase {
  async execute(
    request: BookTeamAppointmentRequest,
  ): Promise<BookTeamAppointmentResponse> {
    // 1. Validation disponibilité équipe au créneau
    // 2. Réservation simultanée tous les professionnels
    // 3. Gestion conflits et rollback si échec partiel
    // 4. Calcul prix équipe et facturation
    // 5. Notifications synchronisées toute l'équipe
    // 6. Génération planning optimisé
  }
}
```

#### **🔍 Use Cases Support**

```typescript
// OptimizeTeamAllocationUseCase.ts - IA/ML
export class OptimizeTeamAllocationUseCase {
  async execute(
    request: OptimizeAllocationRequest,
  ): Promise<OptimizationResponse> {
    // 1. Analyse historique performance équipes
    // 2. Calcul affinités professionnelles
    // 3. Optimisation équilibrage charge travail
    // 4. Suggestions améliorations composition
  }
}

// HandleTeamConflictUseCase.ts - Gestion incidents
export class HandleTeamConflictUseCase {
  async execute(
    request: TeamConflictRequest,
  ): Promise<ConflictResolutionResponse> {
    // 1. Détection conflits planning équipe
    // 2. Recherche solutions substitution
    // 3. Notification clients impactés
    // 4. Reprogrammation automatique si possible
  }
}
```

### 📋 **3. INFRASTRUCTURE LAYER - Persistence & Services**

#### **🗄️ TypeORM Entities Multi-Pro**

```typescript
// team-requirement-orm.entity.ts
@Entity('team_requirements')
export class TeamRequirementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  @Index()
  serviceId: string;

  @Column({ name: 'professional_role', type: 'varchar', length: 50 })
  professionalRole: string;

  @Column({ name: 'required_count', type: 'int' })
  requiredCount: number;

  @Column({ name: 'required_skills', type: 'jsonb' })
  requiredSkills: string[];

  @Column({ name: 'is_lead', type: 'boolean', default: false })
  isLead: boolean;

  @ManyToOne(() => ServiceOrmEntity, (service) => service.teamRequirements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// team-appointment-orm.entity.ts
@Entity('team_appointments')
export class TeamAppointmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  @Index()
  appointmentId: string;

  @Column({ name: 'team_composition', type: 'jsonb' })
  teamComposition: any;

  @Column({ name: 'lead_professional_id', nullable: true })
  leadProfessionalId?: string;

  @Column({
    name: 'total_team_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalTeamPrice: number;

  @Column({
    name: 'team_price_currency',
    type: 'varchar',
    length: 3,
    default: 'EUR',
  })
  teamPriceCurrency: string;

  @OneToOne(
    () => AppointmentOrmEntity,
    (appointment) => appointment.teamDetails,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentOrmEntity;

  @OneToMany(
    () => AppointmentProfessionalOrmEntity,
    (ap) => ap.teamAppointment,
    {
      cascade: true,
    },
  )
  assignedProfessionals: AppointmentProfessionalOrmEntity[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// appointment-professional-orm.entity.ts
@Entity('appointment_professionals')
export class AppointmentProfessionalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_appointment_id' })
  @Index()
  teamAppointmentId: string;

  @Column({ name: 'professional_id' })
  @Index()
  professionalId: string;

  @Column({ name: 'role_in_team', type: 'varchar', length: 50 })
  roleInTeam: string;

  @Column({ name: 'is_lead', type: 'boolean', default: false })
  isLead: boolean;

  @Column({
    name: 'individual_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  individualPrice: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ASSIGNED' })
  status: string; // ASSIGNED, CONFIRMED, CANCELLED, SUBSTITUTED

  @ManyToOne(
    () => TeamAppointmentOrmEntity,
    (team) => team.assignedProfessionals,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'team_appointment_id' })
  teamAppointment: TeamAppointmentOrmEntity;

  @ManyToOne(() => StaffOrmEntity)
  @JoinColumn({ name: 'professional_id' })
  professional: StaffOrmEntity;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### **📊 Migration TypeORM**

```typescript
// {timestamp}-CreateTeamServicesStructure.ts
export class CreateTeamServicesStructure implements MigrationInterface {
  name = 'CreateTeamServicesStructure{timestamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Table team_requirements
    await queryRunner.createTable(
      new Table({
        name: `${schema}.team_requirements`,
        columns: [
          // ID et références
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          { name: 'service_id', type: 'uuid', isNullable: false },

          // Configuration équipe
          {
            name: 'professional_role',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'required_count',
            type: 'int',
            isNullable: false,
            default: '1',
          },
          {
            name: 'required_skills',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
          },
          {
            name: 'is_lead',
            type: 'boolean',
            isNullable: false,
            default: false,
          },

          // Timestamps
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Table team_appointments
    await queryRunner.createTable(
      new Table({
        name: `${schema}.team_appointments`,
        columns: [
          // ID et références
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'appointment_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },

          // Composition équipe
          { name: 'team_composition', type: 'jsonb', isNullable: false },
          { name: 'lead_professional_id', type: 'uuid', isNullable: true },

          // Tarification équipe
          {
            name: 'total_team_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'team_price_currency',
            type: 'varchar',
            length: '3',
            default: "'EUR'",
          },

          // Timestamps
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Table appointment_professionals
    await queryRunner.createTable(
      new Table({
        name: `${schema}.appointment_professionals`,
        columns: [
          // ID et références
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          { name: 'team_appointment_id', type: 'uuid', isNullable: false },
          { name: 'professional_id', type: 'uuid', isNullable: false },

          // Rôle dans l'équipe
          {
            name: 'role_in_team',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'is_lead', type: 'boolean', default: false },

          // Tarification individuelle
          {
            name: 'individual_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },

          // Statut professionnel
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'ASSIGNED'",
          },

          // Timestamps
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Index et contraintes
    await queryRunner.createIndex(
      `${schema}.team_requirements`,
      new Index('IDX_team_requirements_service', ['service_id']),
    );
    await queryRunner.createIndex(
      `${schema}.team_appointments`,
      new Index('IDX_team_appointments_appointment', ['appointment_id']),
    );
    await queryRunner.createIndex(
      `${schema}.appointment_professionals`,
      new Index('IDX_appointment_professionals_team', ['team_appointment_id']),
    );
    await queryRunner.createIndex(
      `${schema}.appointment_professionals`,
      new Index('IDX_appointment_professionals_staff', ['professional_id']),
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      `${schema}.team_requirements`,
      new ForeignKey({
        columnNames: ['service_id'],
        referencedTableName: `${schema}.services`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${schema}.team_appointments`,
      new ForeignKey({
        columnNames: ['appointment_id'],
        referencedTableName: `${schema}.appointments`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${schema}.appointment_professionals`,
      new ForeignKey({
        columnNames: ['team_appointment_id'],
        referencedTableName: `${schema}.team_appointments`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${schema}.appointment_professionals`,
      new ForeignKey({
        columnNames: ['professional_id'],
        referencedTableName: `${schema}.staff`,
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();
    await queryRunner.dropTable(`${schema}.appointment_professionals`);
    await queryRunner.dropTable(`${schema}.team_appointments`);
    await queryRunner.dropTable(`${schema}.team_requirements`);
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

### 📋 **4. PRESENTATION LAYER - APIs Multi-Pro**

#### **🎮 TeamServiceController**

```typescript
@ApiTags('👥 Team Services')
@Controller('api/v1/team-services')
@ApiBearerAuth()
export class TeamServiceController {
  @Post('configure')
  @ApiOperation({
    summary: '⚙️ Configure Team Service Requirements',
    description: 'Define professional team requirements for a service',
  })
  async configureTeamService(
    @Body() dto: ConfigureTeamServiceDto,
    @GetUser() user: User,
  ): Promise<ConfigureTeamServiceResponseDto> {
    // Use case configuration équipe service
  }

  @Post('availability/search')
  @ApiOperation({
    summary: '🔍 Find Available Team Slots',
    description: 'Search for time slots where complete team is available',
  })
  async findAvailableTeamSlots(
    @Body() dto: FindTeamSlotsDto,
    @GetUser() user: User,
  ): Promise<FindTeamSlotsResponseDto> {
    // Use case recherche créneaux équipe
  }

  @Post('appointments/book')
  @ApiOperation({
    summary: '📅 Book Team Appointment',
    description: 'Reserve appointment requiring multiple professionals',
  })
  async bookTeamAppointment(
    @Body() dto: BookTeamAppointmentDto,
    @GetUser() user: User,
  ): Promise<BookTeamAppointmentResponseDto> {
    // Use case réservation rendez-vous équipe
  }

  @Get('appointments/:appointmentId/team')
  @ApiOperation({
    summary: '👥 Get Team Composition',
    description: 'Retrieve complete team details for appointment',
  })
  async getTeamComposition(
    @Param('appointmentId') appointmentId: string,
    @GetUser() user: User,
  ): Promise<TeamCompositionDto> {
    // Récupération composition équipe
  }

  @Put('appointments/:appointmentId/team/substitute')
  @ApiOperation({
    summary: '🔄 Substitute Team Member',
    description: 'Replace a team member due to unavailability',
  })
  async substituteTeamMember(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: SubstituteTeamMemberDto,
    @GetUser() user: User,
  ): Promise<SubstitutionResponseDto> {
    // Use case substitution membre équipe
  }
}
```

## 🚀 **PLAN D'IMPLÉMENTATION PHASE 1**

### **Étape 1 : Domain Layer (TDD RED)**

1. ✅ **TeamRequirement Value Object** + tests RED
2. ✅ **TeamComposition Value Object** + tests RED
3. ✅ **ServiceCapacity Value Object** + tests RED
4. ✅ **Service Entity extension** + tests RED
5. ✅ **Business Entity extension** + tests RED

### **Étape 2 : Application Layer (TDD GREEN)**

1. ✅ **ConfigureTeamServiceUseCase** + tests GREEN
2. ✅ **FindAvailableTeamSlotsUseCase** + tests GREEN
3. ✅ **BookTeamAppointmentUseCase** + tests GREEN
4. ✅ **Repository interfaces** pour Team Services

### **Étape 3 : Infrastructure Layer (TDD REFACTOR)**

1. ✅ **TypeORM entities** team-related
2. ✅ **Migration** team services structure
3. ✅ **Repository implementations** avec optimisations
4. ✅ **Mappers** Domain ↔ ORM ↔ DTO

### **Étape 4 : Presentation Layer (TDD VALIDATE)**

1. ✅ **DTOs** team services avec validation
2. ✅ **TeamServiceController** complet
3. ✅ **Integration tests** E2E team booking
4. ✅ **Swagger documentation** complète

## 🎯 **CRITÈRES DE SUCCÈS PHASE 1**

### **✅ Fonctionnel**

- **Configuration équipe** : Service peut définir professionnels requis
- **Recherche créneaux** : Algorithme trouve disponibilités équipe synchronisées
- **Réservation équipe** : Booking simultané tous les professionnels
- **Gestion conflits** : Substitution automatique en cas d'indisponibilité

### **✅ Technique**

- **Tests** : 100% couverture use cases critiques
- **Performance** : < 500ms recherche créneaux équipe (< 10 professionnels)
- **Scalabilité** : Support 50+ équipes simultanées par business
- **Sécurité** : Validation permissions team management

### **✅ Business Impact**

- **Nouveaux services** : Chirurgie, consultation spécialisée, formation
- **Optimisation ressources** : Réduction temps morts professionnels
- **Client experience** : Réservation équipe complète en un clic
- **Revenue stream** : Tarification premium services équipe

## 🎯 **PRÊT POUR L'IMPLÉMENTATION ?**

La **PHASE 1** est maintenant architecturée et documentée. Commençons par le **Domain Layer** en mode **TDD strict** !

**Première étape** : Création du **TeamRequirement Value Object** avec tests RED ?
