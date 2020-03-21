import Vue from 'vue';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

Vue.use(VueApollo);

const Client = new ApolloClient({
  // You should use an absolute URL here
  uri: '/dockite/graphql',
});

export default new VueApollo({
  defaultClient: Client,
});
