import * as path from 'path';
import * as fs from 'fs';

export const getPackage = (location: string): string => {
  if (fs.existsSync(path.join(process.cwd(), location))) {
    return path.join(process.cwd(), location);
  }

  return location;
};
