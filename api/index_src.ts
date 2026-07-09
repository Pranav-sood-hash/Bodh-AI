import "../src/polyfill";
import "dotenv/config";

let app: any = null;
let initError: any = null;

async function getApp() {
  if (app) return app;
  try {
    const { createServer } = await import("../server/index.js");
    app = createServer();
    return app;
  } catch (err: any) {
    initError = err;
    console.error("Initialization error:", err);
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (err: any) {
    res.status(500).json({
      error: "Initialization failed",
      message: err.message,
      stack: err.stack,
      initError: initError ? { message: initError.message, stack: initError.stack } : null
    });
  }
}

