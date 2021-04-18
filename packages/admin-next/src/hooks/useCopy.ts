/**
 *
 */
export const useCopy = (str: string): void => {
  const textarea = document.createElement('textarea');

  // Assign a random id so concurrent textareas can be inserted
  textarea.id = Math.random()
    .toString(36)
    .slice(2);

  textarea.value = str;

  document.body.appendChild(textarea);

  textarea.select();

  document.execCommand('copy');

  document.body.removeChild(textarea);
};

export default useCopy;
