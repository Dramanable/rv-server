/**
 * @fileoverview Notification Analytics Value Object
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { ValueObjectValidationError } from "../exceptions/domain.exceptions";

/**
 * Métriques de performance des notifications
 */
export interface NotificationMetrics {
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalFailed: number;
  readonly totalPending: number;
  readonly deliveryRate: number; // Pourcentage
  readonly averageDeliveryTime: number; // En millisecondes
  readonly channelBreakdown: Record<string, number>;
  readonly statusBreakdown: Record<string, number>;
  readonly hourlyDistribution: Record<number, number>; // 0-23h
  readonly dailyTrend: Array<{ date: string; count: number }>;
}

/**
 * Analytics des notifications avec métriques détaillées
 */
export class NotificationAnalytics {
  private constructor(
    private readonly _periodStart: Date,
    private readonly _periodEnd: Date,
    private readonly _metrics: NotificationMetrics,
    private readonly _generatedAt: Date = new Date(),
  ) {
    this.validatePeriod();
  }

  /**
   * Crée des analytics de notifications
   */
  static create(
    periodStart: Date,
    periodEnd: Date,
    metrics: NotificationMetrics,
  ): NotificationAnalytics {
    return new NotificationAnalytics(periodStart, periodEnd, metrics);
  }

  /**
   * Crée des analytics vides
   */
  static empty(periodStart: Date, periodEnd: Date): NotificationAnalytics {
    const emptyMetrics: NotificationMetrics = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalPending: 0,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      channelBreakdown: {},
      statusBreakdown: {},
      hourlyDistribution: {},
      dailyTrend: [],
    };

    return new NotificationAnalytics(periodStart, periodEnd, emptyMetrics);
  }

  /**
   * Valide la période
   */
  private validatePeriod(): void {
    if (this._periodStart >= this._periodEnd) {
      throw new ValueObjectValidationError(
        "NOTIFICATION_ANALYTICS_PERIOD_INVALID",
        "Period start must be before period end",
        { periodStart: this._periodStart, periodEnd: this._periodEnd },
      );
    }

    const maxPeriodDays = 365; // 1 an maximum
    const periodDays =
      (this._periodEnd.getTime() - this._periodStart.getTime()) /
      (1000 * 60 * 60 * 24);

    if (periodDays > maxPeriodDays) {
      throw new ValueObjectValidationError(
        "NOTIFICATION_ANALYTICS_PERIOD_TOO_LONG",
        `Period too long: ${periodDays} days (max: ${maxPeriodDays})`,
        { periodDays, maxPeriodDays },
      );
    }
  }

  /**
   * Obtient le taux de succès par canal
   */
  getChannelSuccessRates(): Record<string, number> {
    const rates: Record<string, number> = {};

    Object.keys(this._metrics.channelBreakdown).forEach((channel) => {
      const channelTotal = this._metrics.channelBreakdown[channel] || 0;
      if (channelTotal > 0) {
        // Approximation basée sur le taux global
        rates[channel] = this._metrics.deliveryRate;
      }
    });

    return rates;
  }

  /**
   * Obtient les heures de pointe
   */
  getPeakHours(): Array<{ hour: number; count: number; percentage: number }> {
    const total = Object.values(this._metrics.hourlyDistribution).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Object.entries(this._metrics.hourlyDistribution)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 heures
  }

  /**
   * Obtient la tendance de croissance
   */
  getGrowthTrend(): {
    trend: "increasing" | "decreasing" | "stable";
    changePercentage: number;
    description: string;
  } {
    if (this._metrics.dailyTrend.length < 2) {
      return {
        trend: "stable",
        changePercentage: 0,
        description: "Données insuffisantes pour analyser la tendance",
      };
    }

    const firstHalf = this._metrics.dailyTrend.slice(
      0,
      Math.floor(this._metrics.dailyTrend.length / 2),
    );
    const secondHalf = this._metrics.dailyTrend.slice(
      Math.floor(this._metrics.dailyTrend.length / 2),
    );

    const firstAvg =
      firstHalf.reduce((sum, day) => sum + day.count, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, day) => sum + day.count, 0) / secondHalf.length;

    const changePercentage =
      firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    let trend: "increasing" | "decreasing" | "stable";
    let description: string;

    if (Math.abs(changePercentage) < 5) {
      trend = "stable";
      description = "Volume de notifications stable";
    } else if (changePercentage > 0) {
      trend = "increasing";
      description = `Augmentation de ${changePercentage.toFixed(1)}% du volume`;
    } else {
      trend = "decreasing";
      description = `Diminution de ${Math.abs(changePercentage).toFixed(1)}% du volume`;
    }

    return { trend, changePercentage, description };
  }

  /**
   * Obtient les recommandations basées sur les métriques
   */
  getRecommendations(): Array<{
    type: "performance" | "optimization" | "alert";
    priority: "low" | "medium" | "high";
    title: string;
    description: string;
    action: string;
  }> {
    const recommendations = [];

    // Recommandation sur le taux de livraison
    if (this._metrics.deliveryRate < 85) {
      recommendations.push({
        type: "alert" as const,
        priority: "high" as const,
        title: "Taux de livraison faible",
        description: `Le taux de livraison actuel est de ${this._metrics.deliveryRate.toFixed(1)}%, en dessous du seuil recommandé de 85%`,
        action:
          "Vérifier la configuration des canaux de notification et la validité des adresses",
      });
    }

    // Recommandation sur le temps de livraison
    if (this._metrics.averageDeliveryTime > 60000) {
      // > 1 minute
      recommendations.push({
        type: "performance" as const,
        priority: "medium" as const,
        title: "Temps de livraison élevé",
        description: `Temps moyen de livraison : ${(this._metrics.averageDeliveryTime / 1000).toFixed(1)}s`,
        action:
          "Optimiser les fournisseurs de notification ou augmenter la capacité",
      });
    }

    // Recommandation sur la distribution horaire
    const peakHours = this.getPeakHours();
    if (peakHours.length > 0 && peakHours[0].percentage > 30) {
      recommendations.push({
        type: "optimization" as const,
        priority: "low" as const,
        title: "Pic de charge concentré",
        description: `${peakHours[0].percentage.toFixed(1)}% des notifications sont envoyées à ${peakHours[0].hour}h`,
        action:
          "Considérer un lissage des envois pour optimiser les performances",
      });
    }

    // Recommandation sur les échecs
    if (this._metrics.totalFailed > this._metrics.totalSent * 0.1) {
      recommendations.push({
        type: "alert" as const,
        priority: "high" as const,
        title: "Taux d'échec élevé",
        description: `${this._metrics.totalFailed} notifications ont échoué sur ${this._metrics.totalSent} envoyées`,
        action:
          "Analyser les causes d'échec et améliorer la validation des destinataires",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Exporte les données pour les graphiques
   */
  exportForCharts(): {
    deliveryRateChart: { labels: string[]; data: number[] };
    channelDistribution: { labels: string[]; data: number[] };
    hourlyDistribution: { labels: string[]; data: number[] };
    dailyTrend: { labels: string[]; data: number[] };
  } {
    return {
      deliveryRateChart: {
        labels: ["Livrées", "Échouées", "En attente"],
        data: [
          this._metrics.totalDelivered,
          this._metrics.totalFailed,
          this._metrics.totalPending,
        ],
      },
      channelDistribution: {
        labels: Object.keys(this._metrics.channelBreakdown),
        data: Object.values(this._metrics.channelBreakdown),
      },
      hourlyDistribution: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        data: Array.from(
          { length: 24 },
          (_, i) => this._metrics.hourlyDistribution[i] || 0,
        ),
      },
      dailyTrend: {
        labels: this._metrics.dailyTrend.map((day) => day.date),
        data: this._metrics.dailyTrend.map((day) => day.count),
      },
    };
  }

  /**
   * Génère un résumé textuel
   */
  generateSummary(): string {
    const period = Math.ceil(
      (this._periodEnd.getTime() - this._periodStart.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const growthTrend = this.getGrowthTrend();
    const topChannel = Object.entries(this._metrics.channelBreakdown).sort(
      ([, a], [, b]) => b - a,
    )[0];

    return `
Période analysée : ${period} jour(s)
Total des notifications : ${this._metrics.totalSent}
Taux de livraison : ${this._metrics.deliveryRate.toFixed(1)}%
Canal principal : ${topChannel ? `${topChannel[0]} (${topChannel[1]} notifications)` : "N/A"}
Tendance : ${growthTrend.description}
Temps moyen de livraison : ${(this._metrics.averageDeliveryTime / 1000).toFixed(1)}s
    `.trim();
  }

  // Getters
  getPeriodStart(): Date {
    return new Date(this._periodStart);
  }
  getPeriodEnd(): Date {
    return new Date(this._periodEnd);
  }
  getMetrics(): NotificationMetrics {
    return { ...this._metrics };
  }
  getGeneratedAt(): Date {
    return new Date(this._generatedAt);
  }

  /**
   * Fusionne avec d'autres analytics
   */
  merge(other: NotificationAnalytics): NotificationAnalytics {
    // Période étendue
    const newPeriodStart =
      this._periodStart < other._periodStart
        ? this._periodStart
        : other._periodStart;
    const newPeriodEnd =
      this._periodEnd > other._periodEnd ? this._periodEnd : other._periodEnd;

    // Calcul direct des métriques fusionnées avec taux de livraison
    const totalSent = this._metrics.totalSent + other._metrics.totalSent;
    const totalDelivered =
      this._metrics.totalDelivered + other._metrics.totalDelivered;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    const finalMetrics: NotificationMetrics = {
      totalSent,
      totalDelivered,
      totalFailed: this._metrics.totalFailed + other._metrics.totalFailed,
      totalPending: this._metrics.totalPending + other._metrics.totalPending,
      deliveryRate,
      averageDeliveryTime:
        (this._metrics.averageDeliveryTime +
          other._metrics.averageDeliveryTime) /
        2,
      channelBreakdown: this.mergeRecords(
        this._metrics.channelBreakdown,
        other._metrics.channelBreakdown,
      ),
      statusBreakdown: this.mergeRecords(
        this._metrics.statusBreakdown,
        other._metrics.statusBreakdown,
      ),
      hourlyDistribution: this.mergeRecords(
        this._metrics.hourlyDistribution,
        other._metrics.hourlyDistribution,
      ),
      dailyTrend: [
        ...this._metrics.dailyTrend,
        ...other._metrics.dailyTrend,
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };

    return new NotificationAnalytics(
      newPeriodStart,
      newPeriodEnd,
      finalMetrics,
    );
  }

  /**
   * Fusionne deux objets de comptage
   */
  private mergeRecords(
    a: Record<string, number>,
    b: Record<string, number>,
  ): Record<string, number> {
    const result = { ...a };
    Object.entries(b).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
    return result;
  }

  /**
   * Égalité
   */
  equals(other: NotificationAnalytics): boolean {
    return (
      this._periodStart.getTime() === other._periodStart.getTime() &&
      this._periodEnd.getTime() === other._periodEnd.getTime() &&
      JSON.stringify(this._metrics) === JSON.stringify(other._metrics)
    );
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `NotificationAnalytics(${this._periodStart.toISOString()} - ${this._periodEnd.toISOString()})`;
  }
}
