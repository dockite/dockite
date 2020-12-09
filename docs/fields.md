# Fields

Dockite provides many fields by default for providing the core functionality you will need to get you up and running, below you can find a brief overview of each field and how it's used.

All fields implement support for the following options

| Option         | Type    | Description |
| :--------------|:--------|:------------|
| required       | *boolean* | Controls whether the field is required, when enabled the field can't be left blank. |
| default        | *any*     | Controls the default value for the field, when set this will populate the field with the specified value on creation. |
| hidden         | *boolean* | Controls whether the field will be rendered in the Admin UI, this can be used to hide fields that require no user input. |
| showInBulkEdit | *boolean* | Controls whether the field will be rendered in the bulk document editor, useful for fields that are scoped to a document (metadata). |

<!-- Boolean Field -->
## Boolean

The boolean field is responsible for storing `true` / `false` values, this appears as a toggle within the Admin UI.

#### Package

`@dockite/field-boolean`

#### Options

N/A

<!-- Code Field -->
## Code

The code field is responsible for storing information about code including content and language. This appears as a code editor within the Admin UI.

The code field uses [CodeMirror](https://codemirror.net/) for rendering the editor and performing syntax highlighting.

#### Package

`@dockite/field-code`

#### Options

N/A

<!-- Colorpicker Field -->
## Colorpicker

The colorpicker is repsonsible for the storage of color information. This renders as a colorpicker within the Admin UI with the colors hexadecimal code being displayed.

#### Package

`@dockite/field-colorpicker`

#### Options

N/A


<!-- Conditional Field -->
## Conditional Boolean

The conditional boolean stores the same data as the boolean field but additionally can show or hide fields within the Admin UI depending on the current state of the field.

#### Package

`@dockite/field-conditional-boolean`


#### Options

| Option         | Type     | Description |
| :--------------|:---------|:------------|
| fieldsToHide   | *string[]* | The fields to hide when the boolean is `true` |
| groupsToHide   | *string[]* | The groups to hide when the boolean value is `true` |
| fieldsToShow   | *string[]* | The fields to show when the boolean is `true` |
| groupsToShow   | *string[]* | The groups to show when the boolean value is `true` |

<!-- Conditional Field -->
## Conditional Select

The conditional select stores the same data as the select field but additionally can show or hide fields within the Admin UI depending on the currently selected option.

#### Package

`@dockite/field-conditional-select`

#### Options

| Option         | Type                        | Description |
| :--------------|:----------------------------|:------------|
| multiple       | *boolean*                   | Whether to allow multiple values to be selected |
| options        | *ConditionalSelectOption[]* | The individual select item options |

**Conditional Select Option**

| Option         | Type       | Description |
| :--------------|:-----------|:------------|
| label          | *string*   | The label to display for the option within the UI |
| value          | *string*   | The value to store for the option within the database |
| fieldsToHide   | *string[]* | The fields to hide when the boolean is `true` |
| groupsToHide   | *string[]* | The groups to hide when the boolean value is `true` |


<!-- DateTime Field -->
## DateTime

The datetime field is responsible for the storage and management of dates, times and datetimes. This displays as a datetime picker or a subset of depending on the provided settings.

#### Package

`@dockite/field-datetime`

#### Options

| Option   | Type                | Description |
| :--------|:--------------------|:------------|
| date     | *boolean*           | Enables date picker mode, disabling datetime picker mode |
| time     | *boolean*           | Enables time picker mode, disabling datetime picker mode |
| format   | *(optional) string* | The format to use for displaying the current value [[docs]](https://element.eleme.io/#/en-US/component/date-picker#date-formats) |

<!-- Group Field -->
## Group

The group field is responsible for the grouping of fields into a singular object, this is used to provide a clear definition of related fields both within the UI and API. This field displays as a dropdown containing it's child fields within the Admin UI.

#### Package

`@dockite/field-group`

#### Options

| Option     | Type      | Description |
| :----------|:----------|:------------|
| children   | *Field[]* | The child fields to be used within the field |
| repeatable | *boolean* | Whether to allow the group to be repeated transforming it into an array of values |
| minRows    | *number*  | The minimum amount of rows that the group must contain, only valid when in repeatable mode |
| maxRows    | *number*  | The maximum amount of rows that the group can contain, only valid when in repeatable mode |

<!-- Id Field -->
## ID

The ID field is responsible for the storage of a string or numeric ID which is to only be updated via the GraphQL API. This field displays as a readonly text field within the Admin UI.


#### Package

`@dockite/field-id`


#### Options

| Option     | Type                  | Description |
| :----------|:----------------------|:------------|
| type       | *"string" \| "number"* | The type of ID to use |

<!-- Json Field -->
## JSON

The JSON field is responsible for the storage of unstructured JSON data, this can be used to store data that doesn't have a fixed schema without creating and managing a set of varants. This field displays as an editor within the Admin UI with syntax highlighting and linting.

#### Package

`@dockite/field-json`

#### Options

N/A

<!-- Media Field -->
## Media Manager

The media manager is responsible for the storage and management of media specific to a document within an S3 compatible storage provider, this is used to maintain and store any and all related assets that a document requires which can be linked ot in other fields. This field displays as a file upload component within the Admin UI with uploaded items displaying methods of linking to them.

#### Package

`@dockite/field-media-manager`

#### Options

| Option              | Type                  | Description |
| :-------------------|:----------------------|:------------|
| acceptedExtensions  | *string[]*            | The file extensions that can be uploaded |
| maxSizeKB           | *number*              | The max size of an uploaded file in kilobytes |
| max                 | *number*              | The maximum amount of files that can be uploaded |
| useSchemaS3Settings | *boolean*             | Whether to use S3 settings stored on the schema rather than the field |
| accessKey           | *string*              | The access key for S3 compatible storage provider |
| secretAccessKey     | *string*              | The secret access key for S3 compatible storage provider |
| endpoint            | *string*              | The endpoint for S3 compatible storage provider |
| bucket              | *string*              | The bucket name for S3 compatible storage provider |
| pathPrefix          | *(optional) string*   | The path prefix to use for uploaded items |
| overrideBaseUrl     | *(optional) string*   | The base URL to use for uploaded items otherwise returned S3 path will be used |
| public              | *boolean*             | Whether to attach a public-read ACL to the uploaded item. (AWS ONLY) |


<!-- Number Field -->
## Number

The number field is responsible for the storing of numeric values allowing for both integers and floats. This field is displayed as a number input within the Admin UI.

#### Packages

`@dockite/field-number`

#### Options

| Option  | Type       | Description |
| :-------|:-----------|:------------|
| float   | *boolean*  | Whether to allow floating point numbers to be stored |
| min     | *number*   | The minimum number that can be provided as input |
| max     | *number*   | The maximum number that can be provided as input |

<!-- Reference Field -->
## Reference

The reference field is responsible for the management of document references, it allows a document to form relationships with other documents across the same or other schemas. This field displays as a selection component that displays a modal to select a referring document within the Admin UI.

#### Package

`@dockite/field-reference`

#### Options

| Option          | Type                   | Description |
| :---------------|:-----------------------|:------------|
| schemaIds       | *string*               | The ID's of the schemas to allow documents to be selected from |
| fieldsToDisplay | *FieldToDisplayItem[]* | The fields to display within the reference selection table |
| constraints     | *Constraint[]*         | The constraints to apply to the queries to retrieve documents that can be selected |

**Field To Display Item**

| Option  | Type       | Description |
| :-------|:-----------|:------------|
| label   | *string*   | The label to display for the field within the table |
| name    | *string*   | The path to the value to use within the table |

**Constraint**

| Option   | Type       | Description |
| :--------|:-----------|:------------|
| name     | *string*   | The path to the value to apply the operator to |
| operator | *string*   | The operator to apply |
| value    | *string*   | The value that the operator will compare against |

<!-- Reference Field -->
## Reference Of

The reference of field is responsible for identifying documents that reference the current document. This field displays as a table within the Admin UI with table items being referring documents.

#### Package

`@dockite/field-reference-of`

#### Options

| Option    | Type       | Description |
| :---------|:-----------|:------------|
| schemaId  | *string*   | The ID of the schema that will be searched for referring documents |
| fieldName | *string*   | The name of the field that may contain a reference to the document |

<!-- S3 Field -->
## S3 Image

The S3 image is responsible for the storage and management of images which are uploaded to an S3 compatible storage provider. This field displays as an image upload component within the Admin UI.

*This field is dependent on* `@dockite/module-s3-presign`

#### Package

`@dockite/field-s3-image`

#### Options

| Option              | Type                  | Description |
| :-------------------|:----------------------|:------------|
| acceptedExtensions  | *string[]*            | The file extensions that can be uploaded |
| maxSizeKB           | *number*              | The max size of an uploaded file in kilobytes |
| imageValidation     | *boolean*             | Whether to enable image validation within the Admin UI |
| minWidth            | *number*              | The minimum width that an uploaded image may be |
| maxWidth            | *number*              | The maximum width that an uploaded image may be |
| minHeight           | *number*              | The minimum height that an uploaded image may be |
| maxHeight           | *number*              | The maximum height that an uploaded image may be |
| ratio               | *number*              | The aspect ration that an uploaded image must be |
| min                 | *number*              | The maximum amount of files that can be uploaded |
| max                 | *number*              | The maximum amount of files that can be uploaded |
| useSchemaS3Settings | *boolean*             | Whether to use S3 settings stored on the schema rather than the field |
| accessKey           | *string*              | The access key for S3 compatible storage provider |
| secretAccessKey     | *string*              | The secret access key for S3 compatible storage provider |
| endpoint            | *string*              | The endpoint for S3 compatible storage provider |
| bucket              | *string*              | The bucket name for S3 compatible storage provider |
| pathPrefix          | *(optional) string*   | The path prefix to use for uploaded items |
| public              | *boolean*             | Whether to attach a public-read ACL to the uploaded item. (AWS ONLY) |

<!-- Select Field -->
## Select

The select field is responsible for the storage of multiple choice values, it allows for a user to select one or more values from a predefined list of options. This is displayed as a select input within the Admin UI.

#### Package

`@dockite/field-select`

#### Options

| Option         | Type                        | Description |
| :--------------|:----------------------------|:------------|
| multiple       | *boolean*                   | Whether to allow multiple values to be selected |
| options        | *SelectOptionItem[]* | The individual select item options |

**Select Option**

| Option         | Type       | Description |
| :--------------|:-----------|:------------|
| label          | *string*   | The label to display for the option within the UI |
| value          | *string*   | The value to store for the option within the database |

<!-- Slug Field -->
## Slug

The slug field is responsible for the storage and transformation of values into url safe slugs, it allows for fields such as name and title to then be transformed into a slug that can be used for navigation. This displays as a string field within the Admin UI.

#### Package

`@dockite/field-slug`

#### Options

| Option          | Type       | Description |
| :---------------|:-----------|:------------|
| fieldsToSlugify | *string*   | The name of the field to be slugified |
| unique          | *boolean*  | Whether the slug must be unique across all documents within the schema |
| autoIncrement   | *boolean*  | Whether to append a number after the slug to meet unique requirements |
| parent          | *string*   | The name of the reference field that refers to the documents parent, used to scope unique validation to only check the children of the referring document |

<!-- Sort Field -->
## Sort Index

The sort index field is responsible for the automatic computing of a numeric ID that identifies a documents position within a tree based structure, it allows for the management and creation of consistently sorted tree items. This field is not displayed within the Admin UI.

#### Package

`@dockite/field-sort-index`

#### Options

| Option          | Type       | Description |
| :---------------|:-----------|:------------|
| parentField     | *string*   | The name of the reference field that refers to the documents parent |

<!-- String Field -->
## String

The string field is responsible for the storage of string based values. This displays as either a text or textarea field within the Admin UI.

#### Package

`@dockite/field-string`

#### Options

| Option          | Type       | Description |
| :---------------|:-----------|:------------|
| urlSafe         | *boolean*  | Whether to require that the provided input be URL safe |
| textarea        | *boolean*  | Whether to display the field as a textarea |
| minLen          | *string*   | The minimum length that the provided input may be |
| maxLen          | *string*   | The maximum length that the provided input may be |

<!-- Unique Field -->
## Unique

The unique field is responsible for the validating of unique groups. This allows for the validation that a set of fields provided values are unique across the entire schema that they belong to. This field is not displayed in the Admin UI.

#### Package

`@dockite/field-unique`

#### Options

| Option           | Type                | Description |
| :----------------|:--------------------|:------------|
| validationGroups | *ValidationGroup[]* | A set of validation groups to apply uniqueness checks against |
| constraints      | *Constraint[][]*    | A set of constraint sets for providing a set of validation criteria that a unique field must meet before unique validation is applied |

**Validation Group**

| Option   | Type       | Description |
| :--------|:-----------|:------------|
| N/A      | *string[]* | A set of field names that will be used for validation group |

**Constraint**

| Option   | Type       | Description |
| :--------|:-----------|:------------|
| name     | *string*   | The path to the value to apply the operator to |
| operator | *string*   | The operator to apply |
| value    | *string*   | The value that the operator will compare against |

<!-- Variant Field -->
## Variant

The variant field is responsible for the storage and management of varying data, it allows for the definition of several different options which can contain a different field based on the users choice. This is useful for segregating data based on types without requiring that each field be displayed and ignored when it's not relevant to the current document. This displays as a dropdown with several named options within the Admin UI.

#### Package

`@dockite/field-variant`

#### Options

| Option     | Type      | Description |
| :----------|:----------|:------------|
| children   | *Field[]* | The child fields to be used as options for the variant |

<!-- Wysiwyg Field -->
## WYSIWYG

The WYSIWYG field is responsible for the storage of WYSIWYG content in its HTML form, it allows for the usage of a WYSIWYG editor to generate HTML that may be used across client side sites or applications. This is displayed as a WYSIWYG editor within the Admin UI.

#### Package

`@dockite/field-wysiwyg`

#### Options

| Option     | Type       | Description |
| :----------|:-----------|:------------|
| extensions | *string[]* | The list of WYSIWYG extensions to be enabled within the UI |
| minLen     | *number*   | The minimum length that the provided input may be |
| maxLen     | *number*   | The maximum length that the provided input may be |

<details style="padding-top: 1rem">

<summary style="font-size: 1rem; font-weight: bold;">
  Available Extensions:
</summary>

- Doc
- Paragraph
- Text
- Heading
- Bold
- Italic
- Underline
- Strike
- Code
- CodeBlock
- Blockquote
- Link
- Image
- BulletList
- OrderedList
- ListItem
- TodoList
- TodoItem
- Iframe
- Table
- TableHeader
- TableRow
- TableCell
- TextAlign
- LineHeight
- Indent
- HorizontalRule
- HardBreak
- TrailingNode
- History
- TextColor
- TextHighlight
- FormatClear
- FontType
- FontSize
- Preview
- SelectAll

</details>