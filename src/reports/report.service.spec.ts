import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ProductsService } from '../products/products.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockProductsService = {
    countAll: jest.fn(),
    countDeleted: jest.fn(),
    countNonDeleted: jest.fn(),
    countNonDeletedWithPrice: jest.fn(),
    countNonDeletedInDateRange: jest.fn(),
    groupByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeletedPercentage', () => {
    it('should calculate deleted percentage correctly', async () => {
      mockProductsService.countAll.mockResolvedValue(100);
      mockProductsService.countDeleted.mockResolvedValue(25);

      const result = await service.getDeletedPercentage();

      expect(result.percentage).toBe(25);
      expect(result.total).toBe(100);
      expect(result.deleted).toBe(25);
    });

    it('should return 0 when total is 0', async () => {
      mockProductsService.countAll.mockResolvedValue(0);
      mockProductsService.countDeleted.mockResolvedValue(0);

      const result = await service.getDeletedPercentage();

      expect(result.percentage).toBe(0);
    });
  });

  describe('getNonDeletedPricePercentage', () => {
    it('should calculate percentage for products with price', async () => {
      mockProductsService.countNonDeleted.mockResolvedValue(80);
      mockProductsService.countNonDeletedWithPrice.mockResolvedValue(60);

      const result = await service.getNonDeletedPricePercentage(true);

      expect(result.percentage).toBe(75);
      expect(result.hasPrice).toBe(true);
    });

    it('should calculate percentage for products without price', async () => {
      mockProductsService.countNonDeleted.mockResolvedValue(80);
      mockProductsService.countNonDeletedWithPrice.mockResolvedValue(20);

      const result = await service.getNonDeletedPricePercentage(false);

      expect(result.percentage).toBe(25);
      expect(result.hasPrice).toBe(false);
    });
  });

  describe('getNonDeletedInDateRange', () => {
    it('should calculate percentage for date range', async () => {
      const from = new Date('2024-01-01');
      const to = new Date('2024-12-31');

      mockProductsService.countNonDeleted.mockResolvedValue(100);
      mockProductsService.countNonDeletedInDateRange.mockResolvedValue(30);

      const result = await service.getNonDeletedInDateRange(from, to);

      expect(result.percentage).toBe(30);
      expect(result.count).toBe(30);
    });
  });

  describe('getCategoryReport', () => {
    it('should return category grouping', async () => {
      mockProductsService.groupByCategory.mockResolvedValue([
        { category: 'Electronics', count: '10' },
        { category: 'Clothing', count: '5' },
      ]);

      const result = await service.getCategoryReport();

      expect(result).toEqual([
        { category: 'Electronics', count: 10 },
        { category: 'Clothing', count: 5 },
      ]);
    });
  });
});
