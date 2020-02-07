import "babel-polyfill";
import util from "util";
import uuid from "uuid";

const Mutation = {
    register: async (parent, args, context, info) => {
        const {email, password, author} = args;

        const {client} = context;
        const query = util.promisify(client.query).bind(client);

        const id = uuid.v4();

        if((await query(`SELECT * FROM users WHERE email = \"${email}\"`)).length > 0){
            throw new Error(`The email ${email} is already in use`);
        }
        
        await query(`INSERT INTO users (id, email, password, author) VALUES (\"${id}\", \"${email}\", \"${password}\", ${author})`);

        const result = await query(`SELECT * FROM users WHERE id = \"${id}\"`);

        return result[0];
    },

    login: async (parent, args, context, info) => {
        const {email, password} = args;

        const {client} = context;
        const query = util.promisify(client.query).bind(client);
        const newToken = uuid.v4();

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND password = \"${password}\"`);

        if(user.length === 0){
            throw new Error(`That user does not exist`);
        }

        await query(`UPDATE users SET token = \"${newToken}\" WHERE email = \"${email}\"`);

        const result = user[0];
        result.token = newToken;

        setTimeout(() => {
            query(`UPDATE users SET token = ${null} WHERE email = \"${email}\" AND token = \"${newToken}\"`);
        }, 1800000);

        return result;
    },

    logout: async (parent, args, context, info) => {
        const {email, token} = args;

        const {client} = context;
        const query = util.promisify(client.query).bind(client);

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\"`);

        if(user.length === 0){
            throw new Error(`That user does not exist or is not logged`);
        }

        await query(`UPDATE users SET token = ${null} WHERE email = \"${email}\" AND token = \"${token}\"`);

        const result = user[0];
        result.token = null;
        return result;
    },

    publish: async (parent, args, context, info) => {
        const {email, token, title, description} = args;

        const {client, pubsub} = context;
        const query = util.promisify(client.query).bind(client);

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\" AND author = 1`);

        if(user.length === 0){
            throw new Error(`That user does not exist, is not logged or is not an author`);
        }

        const id = uuid.v4();

        await query(`INSERT INTO posts (id, title, description, author) VALUES (\"${id}\", \"${title}\", \"${description}\", \"${user[0].id}\")`);

        const result = await query(`SELECT * FROM posts WHERE id = \"${id}\"`);

        pubsub.publish(user[0].id, {subscribeAuthor: `${user[0].email} has a new post.`});

        return result[0];
    },

    removePost: async (parent, args, context, info) => {
        const {email, token, post} = args;

        const {client} = context;
        const query = util.promisify(client.query).bind(client);

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\" AND author = 1`);

        if(user.length === 0){
            throw new Error(`That user does not exist, is not logged or is not an author`);
        }

        const result = await query(`SELECT * FROM posts WHERE id = \"${post}\" AND author = \"${user[0].id}\"`);

        if(result.length === 0){
            throw new Error(`Post not found or not your post.`);
        }

        await query(`DELETE FROM posts WHERE id = \"${post}\"`);

        return result[0];
    },

    removeUser: async (parent, args, context, info) => {
        const {email, token} = args;

        const {client} = context;
        const query = util.promisify(client.query).bind(client);

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\"`);

        if(user.length === 0){
            throw new Error(`That user does not exist or is not logged`);
        }

        await query(`DELETE FROM users WHERE id = \"${user[0].id}\"`);

        await query(`DELETE FROM posts WHERE author = \"${user[0].id}\"`);

        return user[0];
    },
}

export {Mutation as default};