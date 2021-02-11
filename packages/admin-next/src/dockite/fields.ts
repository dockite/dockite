export const importDockiteFields = async (): Promise<void> => {
  // eslint-disable-next-line
  await Promise.all(
    DOCKITE_FIELDS
  );
};

export default importDockiteFields;
