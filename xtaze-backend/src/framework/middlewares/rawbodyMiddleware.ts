// middleware/rawBody.ts
import { Request, Response, NextFunction } from "express";

export function saveRawBody(req: Request, res: Response, next: NextFunction) {
  if (req.headers["content-type"] === "application/json") {
    let data = Buffer.from("");
    req.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    req.on("end", () => {
      (req as any).rawBody = data; // Attach raw body to request
      next();
    });
  } else {
    next();
  }
}