import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ProductService } from "../services/productService";
import { ProductController } from "./controller";

export class ProductRoutes {
  static get routes(): Router {
    const router = Router();
    const service = new ProductService();
    const controller = new ProductController(service);

    // Definir las rutas
    router.get("/", controller.getProduct);
    router.post("/", [AuthMiddleware.validateJWT], controller.createProduct);

    return router;
  }
}
