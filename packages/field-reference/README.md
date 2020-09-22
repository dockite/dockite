# Field Reference

> Field Reference handles the referencing of another document within the application. This allows for the defining and creation of relationships across/within schemas and creation of tree structures.

### Caveats

Due to the cost of fetching references for a table view, references will store the last known identifier of the document that they refer to within the field for display which may become outdated if the referenced document is updated without updating the referrer.

### Input

The reference field requires an input containing the id and schemaId of the document.

```json
{
  "id": "the-document-id",
  "schemaId": "the-schema-id"
}

```

### Output

The output type will vary based on the schema the referenced document belongs to containing it's set of fields. An example output for a document referencing the same schema can be seen below:

```json
{
  "id": "000-000-000",
  "name": "A blog post",
  "slug": "a-blog-post",
  "relatedPost": {
    "id": "111-111-111",
    "name": "My second post",
    "slug": "my-second-post",
  }
}

### Configuration

The reference field takes a set of schemaId's to specify which documents can be chosen to refer to, additionally the fields to display in the selection modal.

Finally the optional constraints can be provided to further restrict the items that can be selected in the selection modal, useful in cases where you need to dynamically restrict the selection based on document data.

```json
{
  // The schemas to include for selection
  "schemaIds": ["111-111-111", "222-222-222"],
  // The fields to display in the reference modal (OPTIONAL)
  "fieldsToDisplay": ["name", "title", "link"],
  // The constraints to apply to the document selection modal query
  // can use data on a document with mustache syntax (OPTIONAL)
  "constraints": [
    {
      "name": "type",
      "opertator": "$eq",
      "value": "{{ data.type }}"
    },
    {
      "name": "url",
      "opertator": "$like",
      "value": "https://example.com"
    }
  ]
}
```

