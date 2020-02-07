import "babel-polyfill";
import util from 'util';

const Query = {
    searchPosts: async (parent, args, context, info) => {
        const {email, token, post, author} = args;
        const {client} = context;
        const query = util.promisify(client.query).bind(client);

        const user = await query(`SELECT * FROM users WHERE email = \"${email}\" AND token = \"${token}\"`);

        if(user.length === 0){
            throw new Error(`That user does not exist or is not logged`);
        }

        let result = [];

        if(post && author){
            result = await query(`SELECT * FROM posts WHERE id = \"${post}\" AND author = \"${author}\"`);
        } else if(post){
            result = await query(`SELECT * FROM posts WHERE id = \"${post}\"`);
        } else if(author){
            result = await query(`SELECT * FROM posts WHERE author = \"${author}\"`);
        } else {
            result = await query(`SELECT * FROM posts`);
        }

        return result;
    },
}

export {Query as default};