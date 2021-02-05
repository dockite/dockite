import gql from 'graphql-tag';

export const PRESIGN_S3_OBJECT_MUTATION = gql`
  mutation PresignS3Object($input: PresignInput!) {
    presignS3Object(input: $input) {
      presignedUrl
      expiry
    }
  }
`;

export interface PresignS3ObjectMutationResponse {
  data: {
    presignS3Object: {
      presignedUrl: string;
      expiry: number;
    };
  };
}

export const DELETE_S3_OBJECT_MUTATION = gql`
  mutation DeleteS3Object($input: DeleteS3ObjectInput!) {
    deleteS3Object(input: $input)
  }
`;

export interface DeleteS3ObjectMutation {
  data: {
    deleteS3Object: boolean;
  };
}
