/**
 *
 */
export const importDockiteFields = async (): Promise<void> => {
  // eslint-disable-next-line
  await Promise.all<any>(
    DOCKITE_FIELDS
  );
};

export default importDockiteFields;
