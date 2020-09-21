# Field Unique

> Field Unique handles managing unique validation across groups of fields. To do this the field will perform a CONCAT each field in the database and run a DISTINCT query.

### Caveats

All fields will be cast to text for unique validation as it is the easiest way to handle concatenating and comparing of varying JSON blobs. If a field relies on a subfield for correct unique validation it is recommended to provide it using dot notation.

### Input

No input type is required for field unique as it is a functional field that requires no storage mechanism.

### Output

No output type is required for field unique as it is a functional field that requires no storage mechanism.

### Configuration

The unique field takes a set of validation groups that will be used to perform unique validation based on the fields provided. Each item within the group must contain the field names that will used for concatentation. Nested items within the document can be accessed using dot notation.

Any items provided that don't exist on the document to be validated will be inputted as an empty string rather than throw an error, this is due to the way that handling occurs in Postgres.

The example configuration below is provided for context on how to configure the field.

```json
{
  // Takes a set of groups which contain the fields to be used for unique validation
  "validationGroups": [
    ["name", "slug"], // Will test for uniqueness based on (name + slug)
    ["identifier", "type", "onSale"], // Will also test for uniqueness based on (identifier + type + onSale)
  ]
}
```

