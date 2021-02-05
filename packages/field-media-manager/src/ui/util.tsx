export const getSHA256ChecksumFromFile = async (file: File): Promise<string> => {
  const checksumeArrayBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    await file.arrayBuffer(),
  );

  const checksum = Array.from(new Uint8Array(checksumeArrayBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return checksum;
};

export const isImage = (filename: string): boolean => {
  const extension = filename.split('.').pop();

  if (!extension) {
    return false;
  }

  return ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(`.${extension.toLowerCase()}`);
};

export const isVideo = (filename: string): boolean => {
  const extension = filename.split('.').pop();

  if (!extension) {
    return false;
  }

  return ['.webm', '.mp4', '.mov', '.mkv'].includes(`.${extension.toLowerCase()}`);
};

export const copyToClipboard = (content: string): boolean => {
  const textarea = document.createElement('textarea');

  textarea.style.cssText = 'position: fixed; top: 0; left: 0; z-index: -1; opacity: 0;';

  textarea.value = content;

  document.body.appendChild(textarea);

  textarea.select();

  let success = false;

  try {
    success = document.execCommand('copy');
  } catch (_) {
    success = false;
  }

  document.body.removeChild(textarea);

  return success;
};
