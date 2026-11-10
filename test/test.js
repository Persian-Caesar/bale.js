const { RESTManager } = require("../dist/index");

(async () => {
    const rest = new RESTManager('YOUR_TOKEN');
    const me = await rest.getMe();
    console.log(me);
})();