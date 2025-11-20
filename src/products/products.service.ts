import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, Like, IsNull } from 'typeorm';
import { Product } from './product.entity';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async upsertFromContentful(entry: any): Promise<Product> {
    const sysId = entry.sys.id;
    const createdAt = entry.sys.createdAt;
    const updatedAt = entry.sys.updatedAt;
    const fields = entry.fields;

    const sku = fields.sku;
    const name = fields.name;
    const brand = fields.brand;
    const model = fields.model;
    const category = fields.category;
    const color = fields.color;
    const price = fields.price;
    const currency = fields.currency;
    const stock = fields.stock;

    let product = await this.repo.findOne({ where: { sys_id: sysId } });

    if(product && product.deleted) {
      return product;
    }

    if (!product) {
      product = this.repo.create({ sys_id: sysId });
    }

    product.sku = sku
    product.name = name;
    product.brand = brand;
    product.category = category;
    product.price = price;
    product.model = model;
    product.color = color;
    product.currency = currency;
    product.stock = stock;
    product.created_at = createdAt
    product.updated_at = updatedAt
    
    return this.repo.save(product);
  }

  async findPublic(filter: FilterProductsDto) {
    const { page, limit, name, category, minPrice, maxPrice } = filter;

    const where: FindOptionsWhere<Product> = {
      deleted: false,
    };

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (category) {
      where.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = Between(
        minPrice ?? 0,
        maxPrice ?? Number.MAX_SAFE_INTEGER,
      );
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * Math.min(limit, 5),
      take: Math.min(limit, 5),
      order: { created_at: 'DESC' },
    });

    return {
      page,
      limit: Math.min(limit, 5),
      total,
      items,
    };
  }

  async softDelete(id: string): Promise<void> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) return;

    product.deleted = true;
    product.deleted_at = new Date();
    await this.repo.save(product);
  }

  async countAll(): Promise<number> {
    return this.repo.count();
  }

  async countDeleted(): Promise<number> {
    return this.repo.count({ where: { deleted: true } });
  }

  async countNonDeleted(): Promise<number> {
    return this.repo.count({ where: { deleted: false } });
  }

  async countNonDeletedWithPrice(hasPrice: boolean): Promise<number> {
    if (hasPrice) {
      return this.repo.count({
        where: { 
          deleted: false, 
          price: Between(0, Number.MAX_SAFE_INTEGER) 
        },
      });
    } else {
      return this.repo.count({
        where: { 
          deleted: false, 
          price: IsNull() 
        },
      });
    }
  }

  async countNonDeletedInDateRange(from: Date, to: Date): Promise<number> {
    return this.repo.count({
      where: {
        deleted: false,
        created_at: Between(from, to),
      },
    });
  }

  async groupByCategory() {
    return this.repo
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('product.deleted = false')
      .groupBy('product.category')
      .getRawMany();
  }
}
