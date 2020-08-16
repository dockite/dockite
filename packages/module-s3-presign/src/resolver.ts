import { GlobalContext } from '@dockite/types';
import { Client, BucketItem } from 'minio';
import {
  Arg,
  Ctx,
  Field,
  Float,
  ForbiddenError,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

@ObjectType()
class PresignResponse {
  @Field(_type => String)
  public presignedUrl!: string;

  @Field(_type => Float)
  public expiry!: number;
}

@InputType()
class PresignInput {
  @Field(_type => String)
  public accessKey!: string;

  @Field(_type => String)
  public secretAccessKey!: string;

  @Field(_type => String)
  public endpoint!: string;

  @Field(_type => String)
  public bucket!: string;

  @Field(_type => String)
  public object!: string;

  @Field(_type => Boolean, { defaultValue: false })
  public public!: boolean;
}

@InputType()
class DeleteS3ObjectInput extends PresignInput {
  @Field(_type => Boolean, { defaultValue: false })
  recursive!: boolean;
}

@Resolver()
export class PresignResolver {
  @Query(_returns => String)
  public hello(): string {
    return 'world';
  }

  @Mutation(_returns => PresignResponse)
  public async presignS3Object(
    @Arg('input', _type => PresignInput)
    input: PresignInput,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<PresignResponse> {
    if (!ctx.user) {
      throw new ForbiddenError();
    }

    const client = new Client({
      accessKey: input.accessKey,
      secretKey: input.secretAccessKey,
      endPoint: input.endpoint,
    });

    const params: Record<string, string> = {};

    if (input.public) {
      params['x-amz-acl'] = 'public-read';
    }

    const presignedUrl = await client.presignedUrl(
      'PUT',
      input.bucket,
      input.object,
      60 * 15,
      params,
    );

    return {
      presignedUrl,
      expiry: Date.now() + 60 * 60,
    };
  }

  @Mutation(_returns => Boolean)
  public async deleteS3Object(
    @Arg('input', _type => DeleteS3ObjectInput)
    input: DeleteS3ObjectInput,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    if (!ctx.user) {
      throw new ForbiddenError();
    }

    try {
      const client = new Client({
        accessKey: input.accessKey,
        secretKey: input.secretAccessKey,
        endPoint: input.endpoint,
      });

      if (input.recursive) {
        console.log('is recursive');

        const items = await new Promise<BucketItem[]>((resolve, reject) => {
          const bucketItems: BucketItem[] = [];

          client
            .listObjectsV2(input.bucket, input.object, true)
            .on('data', item => bucketItems.push(item))
            .on('error', () => reject())
            .on('end', () => resolve(bucketItems));
        });

        console.log({ items });

        await client.removeObjects(
          input.bucket,
          items.map(x => x.name),
        );
      } else {
        await client.removeObject(input.bucket, input.object);
      }

      return true;
    } catch (_) {
      return false;
    }
  }
}
