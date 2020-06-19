import { Connection, LessThan } from 'typeorm';
import { Release, Document } from '@dockite/database';

import { connect } from '../database';
import { ONE_MINUTE } from '../common/constants/base';

let connection: Connection | null = null;

const main = async (): Promise<void> => {
  if (!connection) {
    connection = await connect();
  }

  const releaseRepository = connection.getRepository(Release);
  const documentRepository = connection.getRepository(Document);

  const releases = await releaseRepository.find({
    where: {
      scheduledFor: LessThan(new Date()),
      publishedAt: null,
    },
    relations: ['documents'],
  });

  releases.forEach(async release => {
    /* eslint-disable no-param-reassign */
    const publishPromises = release.documents.map(doc => {
      doc.publishedAt = new Date();
      doc.updatedAt = new Date();
      doc.releaseId = undefined;

      return documentRepository.save(doc);
    });

    await Promise.all(publishPromises);
  });

  setTimeout(() => main(), ONE_MINUTE);
};

main();
