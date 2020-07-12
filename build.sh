yarn install
yarn lerna bootstrap
yarn lerna run build --ignore @dockite/admin --ignore @dockite/core
yarn lerna run build --scope @dockite/admin --scope @dockite/core
