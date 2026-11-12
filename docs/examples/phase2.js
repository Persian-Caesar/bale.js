const { RESTManager } = require("@persian-caesar/bale.js");

require("dotenv").config();

(async () => {
    const rest = new RESTManager(process.env.BALE_TOKEN);
    const me = await rest.getMe();
    console.log(me);
})();