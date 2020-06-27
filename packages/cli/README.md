@dockite/cli
============



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@dockite/cli.svg)](https://npmjs.org/package/@dockite/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@dockite/cli.svg)](https://npmjs.org/package/@dockite/cli)
[![License](https://img.shields.io/npm/l/@dockite/cli.svg)](https://github.com/Mythie/dockite/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @dockite/cli
$ dockite COMMAND
running command...
$ dockite (-v|--version|version)
@dockite/cli/0.0.0 linux-x64 node-v12.16.0
$ dockite --help [COMMAND]
USAGE
  $ dockite COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
- [@dockite/cli](#dockitecli)
- [Usage](#usage)
- [Commands](#commands)
  - [`dockite build`](#dockite-build)
  - [`dockite create-app APPNAME`](#dockite-create-app-appname)
  - [`dockite help [COMMAND]`](#dockite-help-command)

## `dockite build`

Build the Admin UI

```
USAGE
  $ dockite build
```

_See code: [lib/commands/build.js](https://github.com/dockite/dockite/blob/v0.0.0/lib/commands/build.js)_

## `dockite create-app APPNAME`

Create a Dockite application

```
USAGE
  $ dockite create-app APPNAME

ARGUMENTS
  APPNAME  The name of the application
```

_See code: [lib/commands/create-app.js](https://github.com/dockite/dockite/blob/v0.0.0/lib/commands/create-app.js)_

## `dockite help [COMMAND]`

display help for dockite

```
USAGE
  $ dockite help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_
<!-- commandsstop -->
