import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findPublic: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products', async () => {
      const filter: FilterProductsDto = { page: 1, limit: 5 };
      const mockResult = { page: 1, limit: 5, total: 10, items: [] };
      
      mockProductsService.findPublic.mockResolvedValue(mockResult);

      const result = await controller.getProducts(filter);

      expect(result).toEqual(mockResult);
      expect(service.findPublic).toHaveBeenCalledWith(filter);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockProductsService.softDelete.mockResolvedValue(undefined);

      await controller.deleteProduct('uuid');

      expect(service.softDelete).toHaveBeenCalledWith('uuid');
    });
  });
});