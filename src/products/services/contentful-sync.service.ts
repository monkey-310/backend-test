import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ProductsService } from '../products.service';

@Injectable()
export class ContentfulSyncService {
  private readonly logger = new Logger(ContentfulSyncService.name);

  constructor(private readonly productsService: ProductsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Starting Contentful sync...');

    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const environmentId = process.env.CONTENTFUL_ENVIRONMENT;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const contentType = process.env.CONTENTFUL_CONTENT_TYPE;

    if (!spaceId || !environmentId || !accessToken || !contentType) {
      this.logger.error('Missing Contentful configuration');
      return;
    }

    const url = 
      `https://cdn.contentful.com/spaces/${spaceId}` + 
      `/environments/${environmentId}` + 
      `/entries?access_token=${accessToken}&content_type=${contentType}`;
    
    try {
      const { data } = await axios.get(url);
      const entries = data.items ?? [];

      for (const entry of entries) {
        await this.productsService.upsertFromContentful(entry);
      }

      this.logger.log(`Contentful sync completed. Synced ${entries.length} items.`);
    } catch (err) {
      this.logger.error('Error syncing Contentful data', err);
    }
  }
}
