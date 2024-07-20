import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { CategoryRoutes } from "./category/route";
import { FileUploadRoutes } from "./file-upload/route";
import { ImageRoutes } from "./images/routes";
import { ProductRoutes } from "./products/route";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Definir las rutas
    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/categories", CategoryRoutes.routes);
    router.use("/api/products", ProductRoutes.routes);
    router.use("/api/upload", FileUploadRoutes.routes);
    router.use("/api/images", ImageRoutes.routes);

    return router;
  }
}
