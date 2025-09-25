# 🎯 ARCHITECTURE TECHNIQUE - Services Multi-Professionnels

## 📋 **ANALYSE FONCTIONNELLE**

### **Cas d'Usage Identifiés**

#### **Secteur Médical :**

- **Chirurgie** : Chirurgien + Anesthésiste + Infirmier(ère) bloc
- **Consultations spécialisées** : Médecin + Interprète + Infirmier(ère)
- **Examens complexes** : Radiologue + Technicien + Infirmier(ère)

#### **Secteur Formation :**

- **Formations techniques** : Formateur principal + Assistant technique
- **Formations linguistiques** : Professeur + Interprète natif
- **Ateliers pratiques** : Formateur + Assistant sécurité

#### **Secteur Bien-être :**

- **Massages duo** : 2 Masseurs pour couple
- **Soins esthétiques complexes** : Esthéticien(ne) + Assistant(e)
- **Séances de coaching** : Coach principal + Coach spécialisé

#### **Secteur Technique :**

- **Interventions complexes** : Technicien senior + Apprenti
- **Installations spécialisées** : Expert + Assistant + Sécurité
- **Maintenances lourdes** : Chef d'équipe + Plusieurs techniciens

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **1. Domain Layer**

#### **ServiceTeamRequirement Value Object**

```typescript
export class ServiceTeamRequirement {
  private constructor(
    private readonly minProfessionals: number,
    private readonly maxProfessionals: number,
    private readonly requiredSkills: ProfessionalSkill[],
    private readonly isTeamMandatory: boolean,
    private readonly substitutionRules: SubstitutionRule[],
  ) {}

  static create(config: TeamRequirementConfig): ServiceTeamRequirement {
    // Validation business rules
    if (config.minProfessionals < 1) {
      throw new DomainError('Au moins un professionnel requis');
    }
    if (config.maxProfessionals < config.minProfessionals) {
      throw new DomainError('Maximum doit être >= minimum');
    }

    return new ServiceTeamRequirement(
      config.minProfessionals,
      config.maxProfessionals,
      config.requiredSkills,
      config.isTeamMandatory,
      config.substitutionRules || [],
    );
  }

  canBePerformedBy(professionals: Professional[]): boolean {
    if (professionals.length < this.minProfessionals) return false;
    if (professionals.length > this.maxProfessionals) return false;

    // Vérifier que toutes les compétences requises sont couvertes
    return this.requiredSkills.every((skill) =>
      professionals.some((prof) => prof.hasSkill(skill)),
    );
  }

  findOptimalTeam(availableProfessionals: Professional[]): Professional[] {
    // Algorithme d'optimisation pour sélectionner la meilleure équipe
    // Critères : compétences, expérience, coût, disponibilité
  }
}
```

#### **TeamAppointment Entity**

```typescript
export class TeamAppointment {
  private constructor(
    private readonly id: AppointmentId,
    private readonly serviceId: ServiceId,
    private readonly clientId: ClientId,
    private readonly professionals: Professional[],
    private readonly scheduledAt: Date,
    private readonly duration: Duration,
    private readonly teamRequirement: ServiceTeamRequirement,
    private status: AppointmentStatus,
  ) {}

  static create(config: TeamAppointmentConfig): TeamAppointment {
    // Validation que l'équipe respecte les exigences du service
    if (!config.teamRequirement.canBePerformedBy(config.professionals)) {
      throw new DomainError('Équipe ne respecte pas les exigences du service');
    }

    return new TeamAppointment(
      AppointmentId.generate(),
      config.serviceId,
      config.clientId,
      config.professionals,
      config.scheduledAt,
      config.duration,
      config.teamRequirement,
      AppointmentStatus.REQUESTED,
    );
  }

  validateTeamAvailability(date: Date, duration: Duration): boolean {
    return this.professionals.every((prof) =>
      prof.isAvailableAt(date, duration),
    );
  }

  substituteTeamMember(currentProf: Professional, newProf: Professional): void {
    // Logique de substitution avec validation des compétences
  }

  confirmTeam(): void {
    if (!this.validateTeamAvailability(this.scheduledAt, this.duration)) {
      throw new DomainError('Équipe non disponible au créneau demandé');
    }
    this.status = AppointmentStatus.CONFIRMED;
  }
}
```

### **2. Application Layer**

#### **BookTeamAppointment Use Case**

```typescript
export class BookTeamAppointmentUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async execute(
    request: BookTeamAppointmentRequest,
  ): Promise<BookTeamAppointmentResponse> {
    // 1. Récupérer le service et ses exigences d'équipe
    const service = await this.serviceRepository.findById(request.serviceId);
    if (!service) {
      throw new ServiceNotFoundError(request.serviceId);
    }

    const teamRequirement = service.getTeamRequirement();
    if (!teamRequirement) {
      throw new ServiceDoesNotRequireTeamError(request.serviceId);
    }

    // 2. Valider que le service permet la réservation en ligne
    if (!service.isBookable()) {
      throw new ServiceNotBookableOnlineError(request.serviceId);
    }

    // 3. Rechercher une équipe disponible ou utiliser l'équipe spécifiée
    let selectedTeam: Professional[];

    if (request.preferredProfessionals?.length) {
      selectedTeam = await this.validatePreferredTeam(
        request.preferredProfessionals,
        teamRequirement,
        request.scheduledAt,
        service.getDuration(),
      );
    } else {
      selectedTeam = await this.findAvailableTeam(
        teamRequirement,
        request.scheduledAt,
        service.getDuration(),
      );
    }

    // 4. Créer le rendez-vous d'équipe
    const teamAppointment = TeamAppointment.create({
      serviceId: request.serviceId,
      clientId: request.clientId,
      professionals: selectedTeam,
      scheduledAt: request.scheduledAt,
      duration: service.getDuration(),
      teamRequirement,
    });

    // 5. Réserver les créneaux pour toute l'équipe
    await this.blockSlotsForTeam(
      selectedTeam,
      request.scheduledAt,
      service.getDuration(),
    );

    // 6. Sauvegarder le rendez-vous
    const savedAppointment =
      await this.appointmentRepository.save(teamAppointment);

    return BookTeamAppointmentResponse.fromTeamAppointment(savedAppointment);
  }

  private async findAvailableTeam(
    requirement: ServiceTeamRequirement,
    scheduledAt: Date,
    duration: Duration,
  ): Promise<Professional[]> {
    // Algorithme complexe de recherche d'équipe optimale
    const availableProfessionals =
      await this.professionalRepository.findAvailableAt(scheduledAt, duration);

    const optimalTeam = requirement.findOptimalTeam(availableProfessionals);

    if (!optimalTeam.length) {
      throw new NoAvailableTeamError(scheduledAt, requirement);
    }

    return optimalTeam;
  }
}
```

#### **ValidateTeamAvailability Use Case**

```typescript
export class ValidateTeamAvailabilityUseCase {
  async execute(
    request: ValidateTeamAvailabilityRequest,
  ): Promise<ValidateTeamAvailabilityResponse> {
    const conflicts: TeamConflict[] = [];

    for (const professional of request.professionals) {
      const availability =
        await this.availabilityService.checkProfessionalAvailability(
          professional.getId(),
          request.scheduledAt,
          request.duration,
        );

      if (!availability.isAvailable) {
        conflicts.push(
          new TeamConflict(
            professional,
            availability.conflictingAppointments,
            availability.reason,
          ),
        );
      }
    }

    return ValidateTeamAvailabilityResponse.create({
      isTeamAvailable: conflicts.length === 0,
      conflicts,
      alternativeSlots:
        conflicts.length > 0 ? await this.findAlternativeSlots(request) : [],
    });
  }
}
```

### **3. Infrastructure Layer**

#### **ServiceTeamRequirementOrmEntity**

```typescript
@Entity('service_team_requirements')
export class ServiceTeamRequirementOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'min_professionals', type: 'int' })
  minProfessionals: number;

  @Column({ name: 'max_professionals', type: 'int' })
  maxProfessionals: number;

  @Column({ name: 'required_skills', type: 'jsonb' })
  requiredSkills: any[];

  @Column({ name: 'is_team_mandatory', type: 'boolean' })
  isTeamMandatory: boolean;

  @Column({ name: 'substitution_rules', type: 'jsonb', nullable: true })
  substitutionRules: any[];

  @ManyToOne(() => ServiceOrmEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### **AppointmentProfessionalOrmEntity (Table de liaison)**

```typescript
@Entity('appointment_professionals')
export class AppointmentProfessionalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @Column({ name: 'professional_id' })
  professionalId: string;

  @Column({ name: 'role_in_service' })
  roleInService: string; // 'PRIMARY', 'ASSISTANT', 'SPECIALIST', etc.

  @Column({
    name: 'revenue_share_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  revenueSharePercentage: number;

  @Column({ name: 'is_lead_professional', type: 'boolean', default: false })
  isLeadProfessional: boolean;

  @ManyToOne(() => AppointmentOrmEntity)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentOrmEntity;

  @ManyToOne(() => StaffOrmEntity)
  @JoinColumn({ name: 'professional_id' })
  professional: StaffOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

#### **Migration TypeORM**

```typescript
export class CreateServiceTeamRequirementsTable implements MigrationInterface {
  name = 'CreateServiceTeamRequirementsTable';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    // Table des exigences d'équipe par service
    await queryRunner.query(`
      CREATE TABLE "${schema}"."service_team_requirements" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "service_id" uuid NOT NULL,
        "min_professionals" integer NOT NULL DEFAULT 1,
        "max_professionals" integer NOT NULL DEFAULT 1,
        "required_skills" jsonb NOT NULL DEFAULT '[]',
        "is_team_mandatory" boolean NOT NULL DEFAULT false,
        "substitution_rules" jsonb,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_service_team_requirements_service_id"
          FOREIGN KEY ("service_id") REFERENCES "${schema}"."services"("id") ON DELETE CASCADE
      )
    `);

    // Table de liaison appointment-professionals
    await queryRunner.query(`
      CREATE TABLE "${schema}"."appointment_professionals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "appointment_id" uuid NOT NULL,
        "professional_id" uuid NOT NULL,
        "role_in_service" varchar(50) NOT NULL DEFAULT 'PRIMARY',
        "revenue_share_percentage" decimal(5,2) NOT NULL DEFAULT 100.00,
        "is_lead_professional" boolean NOT NULL DEFAULT false,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_appointment_professionals_appointment_id"
          FOREIGN KEY ("appointment_id") REFERENCES "${schema}"."appointments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointment_professionals_professional_id"
          FOREIGN KEY ("professional_id") REFERENCES "${schema}"."staff"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_appointment_professional"
          UNIQUE ("appointment_id", "professional_id")
      )
    `);

    // Index pour optimiser les requêtes
    await queryRunner.query(`
      CREATE INDEX "IDX_service_team_requirements_service_id"
      ON "${schema}"."service_team_requirements" ("service_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointment_professionals_appointment_id"
      ON "${schema}"."appointment_professionals" ("appointment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointment_professionals_professional_id"
      ON "${schema}"."appointment_professionals" ("professional_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryRunner.query(
      `DROP TABLE IF EXISTS "${schema}"."appointment_professionals"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "${schema}"."service_team_requirements"`,
    );
  }
}
```

### **4. Presentation Layer**

#### **TeamAppointmentDto**

```typescript
export class BookTeamAppointmentDto {
  @ApiProperty({ description: 'ID du service nécessitant une équipe' })
  @IsUUID()
  readonly serviceId: string;

  @ApiProperty({ description: 'Date et heure souhaitées' })
  @IsISO8601()
  readonly scheduledAt: string;

  @ApiPropertyOptional({
    description: 'Professionnels préférés (optionnel)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly preferredProfessionals?: string[];

  @ApiPropertyOptional({ description: "Notes spéciales pour l'équipe" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly teamNotes?: string;
}

export class TeamAppointmentResponseDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly serviceId: string;

  @ApiProperty()
  readonly scheduledAt: string;

  @ApiProperty({ type: [ProfessionalDto] })
  readonly assignedProfessionals: ProfessionalDto[];

  @ApiProperty()
  readonly leadProfessional: ProfessionalDto;

  @ApiProperty()
  readonly status: string;

  @ApiProperty()
  readonly totalCost: number;

  @ApiProperty({ type: [RevenueShareDto] })
  readonly revenueShares: RevenueShareDto[];
}
```

---

## 🧮 **ALGORITHMES COMPLEXES**

### **1. Recherche d'Équipe Optimale**

```typescript
export class TeamOptimizationService {
  async findOptimalTeam(
    requirement: ServiceTeamRequirement,
    availableProfessionals: Professional[],
    scheduledAt: Date,
    duration: Duration,
  ): Promise<Professional[]> {
    // Algorithme de optimisation multi-critères :

    // 1. Filtrer par compétences requises
    const eligibleProfessionals = availableProfessionals.filter((prof) =>
      requirement.getRequiredSkills().some((skill) => prof.hasSkill(skill)),
    );

    // 2. Générer toutes les combinaisons possibles
    const combinations = this.generateTeamCombinations(
      eligibleProfessionals,
      requirement.getMinProfessionals(),
      requirement.getMaxProfessionals(),
    );

    // 3. Scorer chaque combinaison
    const scoredTeams = await Promise.all(
      combinations.map((team) =>
        this.scoreTeam(team, requirement, scheduledAt),
      ),
    );

    // 4. Sélectionner la meilleure équipe
    const bestTeam = scoredTeams.reduce((best, current) =>
      current.score > best.score ? current : best,
    );

    return bestTeam.professionals;
  }

  private async scoreTeam(
    team: Professional[],
    requirement: ServiceTeamRequirement,
    scheduledAt: Date,
  ): Promise<TeamScore> {
    let score = 0;

    // Critères de scoring :
    // - Compétences (40%)
    score += this.scoreSkillCoverage(team, requirement) * 0.4;

    // - Expérience (25%)
    score += this.scoreExperience(team) * 0.25;

    // - Coût (20%)
    score += this.scoreCost(team) * 0.2;

    // - Disponibilité historique (10%)
    score += (await this.scoreReliability(team, scheduledAt)) * 0.1;

    // - Synergie d'équipe (5%)
    score += (await this.scoreTeamSynergy(team)) * 0.05;

    return { professionals: team, score };
  }
}
```

### **2. Validation de Disponibilité d'Équipe**

```typescript
export class TeamAvailabilityValidator {
  async validateTeamAvailability(
    professionals: Professional[],
    scheduledAt: Date,
    duration: Duration,
  ): Promise<TeamAvailabilityResult> {
    const validationResults = await Promise.all(
      professionals.map((prof) =>
        this.validateSingleProfessional(prof, scheduledAt, duration),
      ),
    );

    const conflicts = validationResults.filter((result) => !result.isAvailable);

    if (conflicts.length === 0) {
      return TeamAvailabilityResult.success();
    }

    // Rechercher des créneaux alternatifs
    const alternativeSlots = await this.findAlternativeSlots(
      professionals,
      scheduledAt,
      duration,
      conflicts,
    );

    return TeamAvailabilityResult.withConflicts(conflicts, alternativeSlots);
  }

  private async findAlternativeSlots(
    professionals: Professional[],
    preferredTime: Date,
    duration: Duration,
    conflicts: ProfessionalConflict[],
  ): Promise<AlternativeSlot[]> {
    // Algorithme de recherche de créneaux alternatifs :
    // 1. Identifier les fenêtres de disponibilité communes
    // 2. Prioriser les créneaux proches du créneau préféré
    // 3. Considérer les préférences de chaque professionnel

    const timeWindow = {
      start: addHours(preferredTime, -4),
      end: addHours(preferredTime, 4),
    };

    const commonAvailabilities = await this.findCommonAvailabilities(
      professionals,
      timeWindow,
      duration,
    );

    return commonAvailabilities
      .map((slot) => ({
        scheduledAt: slot.start,
        availableProfessionals: professionals,
        proximityScore: this.calculateProximityScore(slot.start, preferredTime),
      }))
      .sort((a, b) => b.proximityScore - a.proximityScore)
      .slice(0, 5); // Top 5 alternatives
  }
}
```

---

## 📊 **MÉTRIQUES & MONITORING**

### **KPIs Business**

- **Taux de réussite** des réservations d'équipe
- **Temps moyen** de constitution d'équipe
- **Satisfaction client** pour services multi-professionnels
- **Utilisation optimale** des ressources humaines

### **KPIs Techniques**

- **Performance** algorithme de recherche d'équipe (<500ms)
- **Taux de conflits** de disponibilité
- **Précision** des prédictions de disponibilité
- **Charge système** lors des calculs complexes

---

## 🚨 **DÉFIS TECHNIQUES**

### **Complexité Algorithmique**

- **Problème NP-Hard** : Optimisation d'équipes avec contraintes multiples
- **Solution** : Heuristiques + cache intelligent + pré-calcul

### **Concurrence**

- **Race Conditions** : Réservations simultanées de professionnels
- **Solution** : Locks pessimistes + validation atomique

### **Performance**

- **Calculs intensifs** pour équipes nombreuses
- **Solution** : Calcul asynchrone + mise en cache + optimisation DB

### **Évolutivité**

- **Croissance exponentielle** des combinaisons possibles
- **Solution** : Pruning intelligent + limites configurable + monitoring

**Cette architecture supportera les cas d'usage les plus complexes tout en restant performante et maintenable !**
