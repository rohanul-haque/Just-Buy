/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { z } from "zod";

/**
 * Type
 */
import type { NextFunction, Request, Response } from "express";

export type ValidationSource = "body" | "params" | "query";

/**
 * Validate Middleware
 * Validates request body, params, or query using Zod schema
 */
const validation =
  (schema: z.ZodType, source: ValidationSource = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (source === "body") {
      req.body = result.data;
    }

    if (source === "params") {
      Object.assign(req.params, result.data);
    }

    if (source === "query") {
      const data = result.data as Record<string, any>;
      Object.keys(data).forEach((key) => {
        Object.defineProperty(req.query, key, {
          value: data[key],
          writable: true,
          enumerable: true,
          configurable: true,
        });
      });
    }

    try {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    } catch {
      Object.assign(req[source], result.data);
    }
    next();
  };

export const validateParams = (schema: z.ZodType) =>
  validation(schema, "params");
export const validateQuery = (schema: z.ZodType) => validation(schema, "query");

export default validation;
