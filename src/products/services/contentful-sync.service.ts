import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import { ProductsService } from '../products.service';
import { ContentfulResponse } from '../../types/contentful';

@Injectable()
export class ContentfulSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ContentfulSyncService.name);

  constructor(private readonly productsService: ProductsService) {}

  async onApplicationBootstrap() {
    this.logger.log(
      'Application started - triggering initial Contentful sync...',
    );
    await this.syncFromContentful();
  }

  @Interval(60 * 60 * 1000)
  async handleInterval() {
    this.logger.log('Hourly Contentful sync triggered...');
    await this.syncFromContentful();
  }

  private async syncFromContentful() {
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
      const { data } = await axios.get<ContentfulResponse>(url);
      const entries = data.items ?? [];

      for (const entry of entries) {
        await this.productsService.upsertFromContentful(entry);
      }

      this.logger.log(
        `Contentful sync completed. Synced ${entries.length} items.`,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error('Error syncing Contentful data', errorMessage);
    }
  }
}
