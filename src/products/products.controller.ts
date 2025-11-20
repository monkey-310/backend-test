import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';
import { Product } from './product.entity';

@ApiTags('Public / Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: [Product] })
  async getProducts(@Query() filter: FilterProductsDto) {
    return this.productsService.findPublic(filter);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    await this.productsService.softDelete(id);
  }
}
