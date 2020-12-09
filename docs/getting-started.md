# Getting Started

The best way to get up and running with Dockite is via the Dockite CLI as follows:

1. Install the Dockite CLI `yarn global add @dockite/cli`
2. Create a new project `dockite new <project-name>`
3. Build the Admin UI `dockite build`
4. Run the server `node server.js`

## Installation Requirements

Dockite requires that the following be installed on the system prior to running the commands shown above:

- NodeJS (Latest LTS)
- Postgres > 9.5

NodeJS is used for running the server and compiling the Admin UI whilst Postgres is used as the storage layer for Dockite.

## Configuration

The `.dockiterc` file is responsible for the configuration of Dockite, by default the `.dockiterc` file provided when using the Dockite CLI will contain all currently implemented fields as well as placeholder connection information.

Following the creation of a new project you will need to update the `.dockiterc` file to include the connection details for Postgres in addition to any other hosting requirements you may have.