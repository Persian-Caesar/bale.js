const { RESTManager } = require("../../dist/index");

require("dotenv").config();

(async () => {
    const rest = new RESTManager(process.env.BALE_TOKEN);
    const me = await rest.getMe();
    console.log(me);
})();