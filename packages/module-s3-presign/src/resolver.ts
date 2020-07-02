import { GlobalContext } from '@dockite/types';
import { Client } from 'minio';
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

    const presignedUrl = await client.presignedPutObject(input.bucket, input.object, 60 * 60);

    return {
      presignedUrl,
      expiry: Date.now() + 60 * 60,
    };
  }
}
