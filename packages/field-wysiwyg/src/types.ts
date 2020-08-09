import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

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

export interface DockiteFieldWysiwygEntity extends Field {
  settings: WysiwygFieldSettings & Field['settings'];
}
