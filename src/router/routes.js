import { DetailPage } from "../pages/DetailPage.js";
import { HomePage } from "../pages/Homepage.js";

export const setupRoutes = (router) => {
  router.addRoute("/", async () => {
    return HomePage();
  });
  router.addRoute("/products/:id", async (params) => {
    return DetailPage(params);
  });

  return router;
};
