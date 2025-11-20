import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { FilterProductsDto } from './dto/filter-products.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertFromContentful', () => {
    it('should create a new product if it does not exist', async () => {
      const entry = {
        sys: {
          id: 'sys-123',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        fields: {
          sku: 'SKU-001',
          name: 'Test Product',
          brand: 'Test Brand',
          model: 'Model-1',
          category: 'Electronics',
          color: 'Black',
          price: 99.99,
          currency: 'USD',
          stock: 10,
        },
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ sys_id: 'sys-123' });
      mockRepository.save.mockResolvedValue({ id: 'uuid', ...entry.fields });

      const result = await service.upsertFromContentful(entry);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { sys_id: 'sys-123' },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should not update a deleted product', async () => {
      const entry = {
        sys: {
          id: 'sys-123',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        fields: { sku: 'SKU-001', name: 'Updated Name' },
      };

      const deletedProduct = {
        id: 'uuid',
        sys_id: 'sys-123',
        deleted: true,
        deleted_at: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(deletedProduct);

      const result = await service.upsertFromContentful(entry);

      expect(result).toEqual(deletedProduct);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update an existing non-deleted product', async () => {
      const entry = {
        sys: {
          id: 'sys-123',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        fields: {
          sku: 'SKU-001',
          name: 'Updated Product',
          brand: 'Brand',
          model: 'Model',
          category: 'Category',
          color: 'Color',
          price: 199.99,
          currency: 'USD',
          stock: 5,
        },
      };

      const existingProduct = {
        id: 'uuid',
        sys_id: 'sys-123',
        deleted: false,
        name: 'Old Name',
      };

      mockRepository.findOne.mockResolvedValue(existingProduct);
      mockRepository.save.mockResolvedValue({
        ...existingProduct,
        name: 'Updated Product',
      });

      const result = await service.upsertFromContentful(entry);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Product');
    });
  });

  describe('findPublic', () => {
    it('should return paginated products with max 5 items per page', async () => {
      const filter: FilterProductsDto = { page: 1, limit: 10 };
      const mockProducts = Array(3)
        .fill(null)
        .map((_, i) => ({ id: `id-${i}`, name: `Product ${i}` }));

      mockRepository.findAndCount.mockResolvedValue([mockProducts, 3]);

      const result = await service.findPublic(filter);

      expect(result.limit).toBe(5);
      expect(result.items).toHaveLength(3);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        }),
      );
    });

    it('should filter by name', async () => {
      const filter: FilterProductsDto = { page: 1, limit: 5, name: 'Test' };
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPublic(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.anything(),
          }),
        }),
      );
    });

    it('should filter by category', async () => {
      const filter: FilterProductsDto = {
        page: 1,
        limit: 5,
        category: 'Electronics',
      };
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPublic(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Electronics',
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      const filter: FilterProductsDto = {
        page: 1,
        limit: 5,
        minPrice: 10,
        maxPrice: 100,
      };
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findPublic(filter);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should mark product as deleted', async () => {
      const product = { id: 'uuid', deleted: false };
      mockRepository.findOne.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue({
        ...product,
        deleted: true,
        deleted_at: new Date(),
      });

      await service.softDelete('uuid');

      expect(product.deleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should not throw if product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).resolves.not.toThrow();
    });
  });
});
