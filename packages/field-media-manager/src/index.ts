import { DockiteField } from '@dockite/field';
import { PresignResolver } from '@dockite/module-s3-presign';
import { GlobalContext, HookContext } from '@dockite/types';
import { GraphQLInputType, GraphQLOutputType } from 'graphql';

import { DEFAULT_OPTIONS, S3Settings, FIELD_TYPE } from './types';

export class DockiteFieldMediaManager extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Media Manager';

  public static description = 'A media manager field.';

  public static defaultOptions = DEFAULT_OPTIONS;

  public async inputType(): Promise<GraphQLInputType> {
    return (null as any) as GraphQLInputType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return (null as any) as GraphQLOutputType;
  }

  public async onSoftDelete(ctx: HookContext): Promise<void> {
    if (ctx.fieldData) {
      const s3Settings = this.getS3Settings();

      if (s3Settings) {
        const resolver = new PresignResolver();

        const prefix = [
          this.schemaField.settings.pathPrefix || (this.schemaField.schema?.name ?? 'Unknown'),
          ctx.fieldData.uid,
        ].join('/');

        await resolver
          .deleteS3Object(
            {
              ...s3Settings,
              object: prefix,
              public: false,
              recursive: true,
            },
            ({ user: true, req: {}, res: {} } as any) as GlobalContext,
          )
          .catch(err => console.log('[ERROR]', err));
      }
    }
  }

  private getS3Settings(): S3Settings | null {
    if (this.schemaField.settings.useSchemaS3Settings && this.schemaField.schema?.settings?.s3) {
      return this.schemaField.schema.settings.s3;
    }

    if (
      this.schemaField.settings.accessKey &&
      this.schemaField.settings.secretAccessKey &&
      this.schemaField.settings.bucket &&
      this.schemaField.settings.endpoint
    ) {
      return {
        accessKey: this.schemaField.settings.accessKey,
        secretAccessKey: this.schemaField.settings.secretAccessKey,
        endpoint: this.schemaField.settings.endpoint,
        bucket: this.schemaField.settings.bucket,
      };
    }

    return null;
  }
}
