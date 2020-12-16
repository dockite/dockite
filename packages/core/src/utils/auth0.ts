import { v4 as uuidV4 } from 'uuid';

export const auth0UserIdToUuid = (userId: string): string => {
  const seed = Uint8Array.from(userId.split('').map(x => String(x).charCodeAt(0)));

  return uuidV4({
    random: seed.slice(0, 16),
  });
};
