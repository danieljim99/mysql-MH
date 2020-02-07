import "babel-polyfill";
import util from "util";

const Post = {
    author: async (parent, args, context, info) => {
        const {client} = context;

        const query = util.promisify(client.query).bind(client);
        const result = await query(`SELECT * FROM users WHERE id = \"${parent.author}\"`);

        return result[0];
    }
}

export {Post as default};