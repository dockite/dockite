export const replaceTemplate = (template: string, replacements: Record<string, string>): string => {
  let newTemplate = template;

  Object.keys(replacements).forEach(replacement => {
    newTemplate = newTemplate.split(`{{ ${replacement} }}`).join(replacements[replacement]);
  });

  return newTemplate;
};
