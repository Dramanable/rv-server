import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { LocalAuthGuard } from '../../infrastructure/security/local-auth.guard';
import { Public } from '../../infrastructure/security/public.decorator';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('demo-auth')
export class DemoPassportController {
  /**
   * Endpoint public pour tester la création de compte sans authentification
   */
  @Public()
  @Get('status')
  getStatus() {
    return {
      message: 'Passport.js Authentication Demo API is running',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Login avec Local Strategy - req.user sera populé après authentification
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request() req: AuthenticatedRequest,
    // Le body est automatiquement traité par LocalStrategy avant d'arriver ici
  ) {
    // Après l'authentification via LocalStrategy, req.user est automatiquement populé
    // Note: Le body est automatiquement traité par LocalStrategy
    return {
      message: 'Login successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
      loginMethod: 'local-strategy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint protégé avec JWT Strategy - req.user sera populé depuis le token
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    // req.user est automatiquement populé par JwtStrategy depuis le cookie JWT
    return {
      message: 'Profile retrieved successfully',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
      authMethod: 'jwt-strategy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint protégé qui démontre l'accès aux propriétés de l'utilisateur
   */
  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  getUserInfo(@Request() req: AuthenticatedRequest) {
    // Démonstration que req.user contient l'entité User complète
    const user = req.user;

    return {
      message: 'User information retrieved via Passport.js',
      userDetails: {
        // Propriétés de base
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,

        // Méthodes d'entité disponibles - exemple simple
        hasManagerPermissions:
          user.role === UserRole.LOCATION_MANAGER || user.role === UserRole.PLATFORM_ADMIN,

        // Informations de profil
        profileComplete: !!(user.name && user.email),

        // Timestamps
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
      },
      authContext: {
        strategy: 'passport-jwt',
        requestTime: new Date().toISOString(),
        userExists: !!req.user,
        userType: req.user.constructor.name,
      },
    };
  }

  /**
   * Endpoint pour tester les autorisations basées sur le rôle
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin-only')
  getAdminData(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    // Exemple d'autorisation basée sur le rôle
    if (user.role !== UserRole.PLATFORM_ADMIN) {
      return {
        error: 'Insufficient permissions',
        userRole: user.role,
        requiredRole: 'PLATFORM_ADMIN',
      };
    }

    return {
      message: 'Admin data accessed successfully',
      adminData: {
        userCount: 42,
        systemStatus: 'healthy',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      accessedBy: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }
}
