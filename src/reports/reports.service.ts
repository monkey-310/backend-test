import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReportsService {
  constructor(private readonly productsService: ProductsService) {}

  async getDeletedPercentage() {
    const total = await this.productsService.countAll();
    const deleted = await this.productsService.countDeleted();

    const percentage = total === 0 ? 0 : (deleted / total) * 100;

    return { total, deleted, percentage };
  }

  async getNonDeletedPricePercentage(hasPrice: boolean) {
    const totalNonDeleted = await this.productsService.countNonDeleted();
    const count = await this.productsService.countNonDeletedWithPrice(hasPrice);

    const percentage = totalNonDeleted === 0 ? 0 : (count / totalNonDeleted) * 100;

    return {
      totalNonDeleted,
      count,
      hasPrice,
      percentage,
    };
  }

  async getNonDeletedInDateRange(from: Date, to: Date) {
    const totalNonDeleted = await this.productsService.countNonDeleted();
    const count = await this.productsService.countNonDeletedInDateRange(from, to);
    const percentage = totalNonDeleted === 0 ? 0 : (count / totalNonDeleted) * 100;

    return { totalNonDeleted, from, to, count, percentage };
  }

  async getCategoryReport() {
    const rows = await this.productsService.groupByCategory();
    return rows.map((r) => ({
      category: r.category,
      count: Number(r.count),
    }));
  }
}
