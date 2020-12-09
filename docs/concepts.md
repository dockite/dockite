# Concepts

To best utilise Dockite its of great importance to understand the basics in terminology and conepts. Below you will find a brief overview of the core concepts within Dockite and how they are used.

## Basics

#### Schemas

A schema is a content type that contains a set of fields that describe the overall structure of the content within the schema. This is best thought of as a container for the building blocks required for each part of your API.

<details>

<summary>
  Some example schemas include:
</summary>

###### Blog Posts

- Title
- Description
- Content
- Posted On

##### Info Pages

- Title
- Meta Description
- Content
- Images
- Footer

##### Product Listings

- Name
- Price
- Description
- Features
- On Sale

##### Author Profile

- Name
- Date of Birth
- Publisher
- Number of Works
- Biography

</details>

#### Documents

A document belongs to a schema and contains data that corresponds the fields within said schema. If a schema and fields define the implementation, a document is the conrete implementation.

For example you may have a schema for the Stores that your business has which defines the opening hours, location and name of the store. A document would be an entry for the store which contains that data.

#### Fields

A field is a building block for a schema, it contains information on how content is entered and stored, fields can come in all different forms and may or may not require input/output.

A common field that is used is the **string field** which takes in a string output and then returns it when queried from the API. This can be used to set up fields such as: name, title, description, etc.

#### Scopes

A scope refers to a granular permission that may be assigned to a user or role. Scopes by nature are very specific allowing for full control on the actions that a user or role may take.

For example if you have created a schema called **Blog Post** you would then have a set of scopes as follows:

- `schema:blogpost:create`
- `schema:blogpost:read`
- `schema:blogpost:update`
- `schema:blogpost:delete`

From there you may have an editor role who is allowed to create and update blog posts however is not allowed to remove them as that is left for admins or reviewers, in order to stop a user from deleting we would simply not assign the `schema:blogpost:delete` scope to either their user or corresponding role.

#### Roles

A role within Dockite is simply a grouping of scopes, this aims to reduce duplication when setting up entire business units of users or similar. You may have any number of roles within Dockite and user can be assigned to as many as you wish where they will be granted the underlying scopes for that role.

#### Webhooks

A webhook refers to a request that occurs after an action has occurred, for instance you may wish to send a request to your hosting provider to rebuild your website whenever a document is modified. To do this we would create a webhook that sends a valid request to our hosting provider indicating that we wish to perform a rebuild of the site.

## Extensions

#### Fields

Dockite allows for custom fields to be created to support any and all needs of your users. This simply requires creating a package that implements the `@dockite/field` interface and providing a [Vue](https://vuejs.org) component for displaying the user interface for the field which is then registered with Dockite by including it in the `.dockiterc` file.

Fields can implement any form of logic you can think of from image uploads to storing changes between document modifications, fields may also require no input and simply display information based on data for example displaying Google Analytics metrics for a document based on its slug.

#### Modules

Dockite allows for the creation and registration of custom modules that implement any extra functions or business logic required. This may range from accepting payments to calling internal hidden services.

A module within Dockite is at its core a [GraphQL Module](https://graphql-modules.com/) whereby it defines its own GraphQL schema that is then stitched into the main application during runtime.

#### Listeners

Dockite allows for the definition of additional listeners, listeners are ran when certain actions occur within the application such as modifications to schemas, fields and documents. This allows for the running of more complex business logic that a webhook simply can't perform such as triggering database backups modifying internal document data when a condition is met and so forth.