import { Index, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

import { Document } from './document';
import { Release } from './release';
import { Schema } from './schema';

@ViewEntity({
  expression: conn =>
    conn
      .createQueryBuilder()
      .select('document.*')
      .addSelect(`jsonb_to_tsvector('english', document.data, '["all"]')`, 'fts')
      .from(Document, 'document'),
})
@Index('view_idx_1', { synchronize: false })
@Index('view_idx_2', { synchronize: false })
@Index('view_idx_3', { synchronize: false })
@Index('view_idx_4', { synchronize: false })
@Index('view_idx_5', { synchronize: false })
export class SearchEngine {
  @ViewColumn()
  @PrimaryColumn()
  public id!: string;

  @ViewColumn()
  public locale!: string;

  @ViewColumn()
  public data!: Record<string, any>; // eslint-disable-line

  @ViewColumn()
  public publishedAt?: Date | null;

  @Index()
  @ViewColumn()
  public createdAt!: Date;

  @Index()
  @ViewColumn()
  public updatedAt!: Date;

  @Index()
  @ViewColumn()
  public deletedAt?: Date | null;

  @Index()
  @ViewColumn()
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.documents,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  public schema!: Schema;

  @Index()
  @ViewColumn()
  public releaseId?: string | null;

  @ManyToOne(
    _type => Release,
    release => release.documents,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  public release!: Release;

  @Index()
  @ViewColumn()
  public userId?: string | null;

  @ViewColumn()
  @Index()
  public fts!: any;
}
