import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  sys_id: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  color: string;

  @Column()
  category: string;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'numeric', nullable: true })
  stock: number;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
