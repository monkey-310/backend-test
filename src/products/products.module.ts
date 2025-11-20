import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ContentfulSyncService } from './services/contentful-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ContentfulSyncService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
