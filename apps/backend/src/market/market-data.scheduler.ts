import { Injectable, Logger } from '@nestjs/common';
import { FinancialDataService } from './financial-data.service';

@Injectable()
export class MarketDataScheduler {
  private readonly logger = new Logger(MarketDataScheduler.name);
  private readonly isProduction: boolean;
  private readonly updateIntervals = {
    economic: 6 * 60 * 60 * 1000, // 6 hours for economic data
    market: 5 * 60 * 1000,        // 5 minutes for market data during trading hours
  };

  private economicDataTimer?: NodeJS.Timeout;
  private marketDataTimer?: NodeJS.Timeout;

  constructor(
    private financialDataService: FinancialDataService,
  ) {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  startScheduler(): void {
    if (!this.isProduction) {
      this.logger.log('Scheduler disabled in development mode');
      return;
    }

    this.logger.log('Starting market data scheduler...');

    // Schedule economic data updates (every 6 hours)
    this.economicDataTimer = setInterval(async () => {
      await this.updateEconomicData();
    }, this.updateIntervals.economic);

    // Schedule market data updates (every 5 minutes during trading hours)
    this.marketDataTimer = setInterval(async () => {
      if (this.isTradingHours()) {
        await this.updateMarketData();
      }
    }, this.updateIntervals.market);

    // Initial data fetch
    this.performInitialDataFetch();

    this.logger.log('Market data scheduler started successfully');
  }

  stopScheduler(): void {
    if (this.economicDataTimer) {
      clearInterval(this.economicDataTimer);
      this.economicDataTimer = undefined;
    }

    if (this.marketDataTimer) {
      clearInterval(this.marketDataTimer);
      this.marketDataTimer = undefined;
    }

    this.logger.log('Market data scheduler stopped');
  }

  private async performInitialDataFetch(): Promise<void> {
    try {
      this.logger.log('Performing initial data fetch...');
      await Promise.allSettled([
        this.updateEconomicData(),
        this.updateMarketData(),
      ]);
      this.logger.log('Initial data fetch completed');
    } catch (error) {
      this.logger.error('Initial data fetch failed:', error.message);
    }
  }

  private async updateEconomicData(): Promise<void> {
    try {
      this.logger.log('Updating economic indicators...');
      await this.financialDataService.getEconomicIndicators();
      this.logger.log('Economic indicators updated successfully');
    } catch (error) {
      this.logger.error('Failed to update economic data:', error.message);
    }
  }

  private async updateMarketData(): Promise<void> {
    try {
      this.logger.log('Updating market indices...');
      await this.financialDataService.getMarketIndices();
      this.logger.log('Market indices updated successfully');
    } catch (error) {
      this.logger.error('Failed to update market data:', error.message);
    }
  }

  private isTradingHours(): boolean {
    const now = new Date();
    const easternTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    }).formatToParts(now);

    const weekday = easternTime.find(part => part.type === 'weekday')?.value;
    const hour = parseInt(easternTime.find(part => part.type === 'hour')?.value || '0');

    // Skip weekends
    if (weekday === 'Sat' || weekday === 'Sun') {
      return false;
    }

    // US market hours: 9:30 AM - 4:00 PM Eastern Time
    return hour >= 9 && hour <= 16;
  }

  async forceUpdate(): Promise<void> {
    this.logger.log('Forcing market data update...');
    await Promise.allSettled([
      this.updateEconomicData(),
      this.updateMarketData(),
    ]);
    this.logger.log('Forced update completed');
  }

  getSchedulerStatus(): {
    isRunning: boolean;
    isProduction: boolean;
    nextEconomicUpdate: Date | null;
    nextMarketUpdate: Date | null;
  } {
    return {
      isRunning: !!this.economicDataTimer && !!this.marketDataTimer,
      isProduction: this.isProduction,
      nextEconomicUpdate: this.economicDataTimer 
        ? new Date(Date.now() + this.updateIntervals.economic)
        : null,
      nextMarketUpdate: this.marketDataTimer
        ? new Date(Date.now() + this.updateIntervals.market)
        : null,
    };
  }
}