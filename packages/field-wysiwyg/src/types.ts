import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const AvailableExtensions = [
  'Doc',
  'Paragraph',
  'Text',
  'Heading',
  'Bold',
  'Italic',
  'Underline',
  'Strike',
  'Code',
  'CodeBlock',
  'Blockquote',
  'Link',
  'Image',
  'BulletList',
  'OrderedList',
  'ListItem',
  'TodoList',
  'TodoItem',
  'Iframe',
  'Table',
  'TableHeader',
  'TableRow',
  'TableCell',
  'TextAlign',
  'LineHeight',
  'Indent',
  'HorizontalRule',
  'HardBreak',
  'TrailingNode',
  'History',
  'TextColor',
  'TextHighlight',
  'FormatClear',
  'FontType',
  'FontSize',
  'Preview',
  'SelectAll',
] as const;

export type AvailableExtensionItem = typeof AvailableExtensions[number];

export interface WysiwygFieldSettings extends FieldSettings {
  required: boolean;
  extensions?: AvailableExtensionItem[];
  minLen: number;
  maxLen: number;
}

export interface DockiteFieldWysiwygEntity extends BaseField {
  type: 'wysiwyg';
  settings: WysiwygFieldSettings & BaseField['settings'];
}
