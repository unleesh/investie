import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class FredService {
  private readonly logger = new Logger(FredService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl = 'https://api.stlouisfed.org/fred';

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  private async getEconomicData(seriesId: string, limit: number = 1) {
    try {
      this.logger.log(`Fetching economic data for series: ${seriesId}`);
      
      const response = await this.httpClient.get('/series/observations', {
        params: {
          series_id: seriesId,
          api_key: this.configService.get('FRED_API_KEY'),
          file_type: 'json',
          limit,
          sort_order: 'desc',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch data for ${seriesId}:`, error.message);
      throw error;
    }
  }

  async getCPI() {
    try {
      const data = await this.getEconomicData('CPIAUCSL');
      const latestObservation = data.observations?.[0];
      
      return {
        value: parseFloat(latestObservation?.value) || 0,
        date: latestObservation?.date,
        series_id: 'CPIAUCSL',
        title: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
      };
    } catch (error) {
      this.logger.error('Failed to fetch CPI data:', error.message);
      throw error;
    }
  }

  async getInterestRate() {
    try {
      const data = await this.getEconomicData('FEDFUNDS');
      const latestObservation = data.observations?.[0];
      
      return {
        value: parseFloat(latestObservation?.value) || 0,
        date: latestObservation?.date,
        series_id: 'FEDFUNDS',
        title: 'Federal Funds Effective Rate',
      };
    } catch (error) {
      this.logger.error('Failed to fetch interest rate data:', error.message);
      throw error;
    }
  }

  async getUnemploymentRate() {
    try {
      const data = await this.getEconomicData('UNRATE');
      const latestObservation = data.observations?.[0];
      
      return {
        value: parseFloat(latestObservation?.value) || 0,
        date: latestObservation?.date,
        series_id: 'UNRATE',
        title: 'Unemployment Rate',
      };
    } catch (error) {
      this.logger.error('Failed to fetch unemployment rate data:', error.message);
      throw error;
    }
  }

  async getAllEconomicIndicators() {
    try {
      const [cpi, interestRate, unemploymentRate] = await Promise.allSettled([
        this.getCPI(),
        this.getInterestRate(),
        this.getUnemploymentRate(),
      ]);

      return {
        cpi: cpi.status === 'fulfilled' ? cpi.value : null,
        interestRate: interestRate.status === 'fulfilled' ? interestRate.value : null,
        unemploymentRate: unemploymentRate.status === 'fulfilled' ? unemploymentRate.value : null,
      };
    } catch (error) {
      this.logger.error('Failed to fetch economic indicators:', error.message);
      throw error;
    }
  }
}