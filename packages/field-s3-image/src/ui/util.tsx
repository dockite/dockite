import slugify from 'slugify';

import { S3ImageFieldSettings } from '../types';

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

export const getImageConstraints = (settings: S3ImageFieldSettings): string[] => {
  const constraints: string[] = [];

  if (settings.maxSizeKB) {
    constraints.push(`must be a file smaller than ${settings.maxSizeKB / 1000} MB`);
  }

  if (settings.minWidth && settings.maxWidth && settings.minWidth === settings.maxWidth) {
    constraints.push(`must be ${settings.minWidth} px wide`);
  } else {
    if (settings.minWidth) {
      constraints.push(`must be at least ${settings.minWidth} px wide`);
    }

    if (settings.maxWidth) {
      constraints.push(`must be at most ${settings.maxWidth} px wide`);
    }
  }

  if (settings.minHeight && settings.maxHeight && settings.minHeight === settings.maxHeight) {
    constraints.push(`must be ${settings.minHeight} px tall`);
  } else {
    if (settings.minHeight) {
      constraints.push(`must be at least ${settings.minHeight} px tall`);
    }

    if (settings.maxHeight) {
      constraints.push(`must be at most ${settings.minHeight} px tall`);
    }
  }

  if (settings.ratio) {
    constraints.push(`must maintain a ${settings.ratio} aspect ratio (width ÷ height)`);
  }

  return constraints;
};

export const slugifyFileName = (fileName: string): string => {
  const [ext, ...rest] = fileName.split('.').reverse();

  const joined = rest.reverse().join('.');

  const slugified = slugify(joined, {
    lower: true,
    remove: /[^\sA-Za-z0-9-_]/g,
  });

  return `${slugified}.${ext}`;
};
