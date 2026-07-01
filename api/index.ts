import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleChat } from "../server/routes/chat";
import serverless from "serverless-http";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.post("/api/chat", handleChat);

const handler = serverless(app);

export default async (req: any, res: any) => {
  return handler(req, res);
};
