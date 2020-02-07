import mysql from 'mysql';
import {GraphQLServer, PubSub} from "graphql-yoga";
import Query from './resolvers/Query.js';
import Mutation from './resolvers/Mutation.js';
import Subscription from './resolvers/Subscription.js';
import User from './resolvers/User.js';
import Post from './resolvers/Post.js';
import "babel-polyfill";

const dbConnect = async function() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'prueba',
        password: 'Password99+',
        database: 'test',
    });

    connection.connect();

    return connection;
}

const runGraphQLServer = (context) => {
    const resolvers = {
        Query,
        Mutation,
        Subscription,
        User,
        Post,
    };
    const server = new GraphQLServer({
        typeDefs: './src/schema.graphql',
        resolvers,
        context,
    });
    server.start(() => console.log("Server started"));
};

const runApp = async() => {
    const client = await dbConnect();
    const pubsub = new PubSub();
    try {
        runGraphQLServer({client, pubsub});
    } catch(e) {
        console.log(e);
        client.close();
    }
};

runApp();