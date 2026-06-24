import "fabric";

declare module "fabric" {
  interface FabricObject {
    id?: string;
    name?: string;
    text?: string;
  }

  interface FabricImage {
    id?: string;
  }
}
