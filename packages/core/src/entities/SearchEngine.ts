import { ViewColumn, ViewEntity, Index, ManyToOne, PrimaryColumn } from 'typeorm';

import { Document } from './Document';
import { Schema } from './Schema';
import { Release } from './Release';

@ViewEntity({
  expression: conn =>
    conn
      .createQueryBuilder()
      .select('document.*')
      .addSelect(`to_tsvector('pg_catalog.simple', document.data)`, 'fts')
      .from(Document, 'document'),
})
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

  @ViewColumn()
  public createdAt!: Date;

  @ViewColumn()
  public updatedAt!: Date;

  @ViewColumn()
  public deletedAt?: Date | null;

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

  @ViewColumn()
  public userId?: string | null;

  @ViewColumn()
  @Index()
  public fts!: any;
}
