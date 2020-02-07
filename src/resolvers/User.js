import "babel-polyfill";
import util from "util";

const User = {
    posts: async (parent, args, context, info) => {
        const {client} = context;

        const query = util.promisify(client.query).bind(client);
        const result = await query(`SELECT * FROM posts WHERE author = \"${parent.id}\"`);

        return result;
    }
}

export {User as default};