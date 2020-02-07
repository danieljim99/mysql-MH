import "babel-polyfill";
import util from 'util';

const Subscription = {
    subscribeAuthor: {
        subscribe: async (parent, args, context, info) => {
            const {email, token, author} = args;

            const {pubsub, client} = context;
            const query = util.promisify(client.query).bind(client);

            let find = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\"`);

            if(find.length === 0){
                throw new Error(`That user does not exist or is not logged`);
            }

            find = await query(`SELECT * FROM users WHERE id = \"${author}\" AND author = 1`);

            if(find.length === 0){
                throw new Error(`User not found or is not an author`);
            }

            return pubsub.asyncIterator(author);
        },
    }
}

export {Subscription as default};