import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  sys_id: string;

  @Column({ nullable: true })
  sku: string | null;

  @Column({ nullable: true })
  name: string | null;

  @Column({ nullable: true })
  brand: string | null;

  @Column({ nullable: true })
  model: string | null;

  @Column({ nullable: true })
  color: string | null;

  @Column()
  category: string;

  @Column({ type: 'numeric', nullable: true })
  price: number | null;

  @Column({ nullable: true })
  currency: string | null;

  @Column({ type: 'numeric', nullable: true })
  stock: number | null;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
