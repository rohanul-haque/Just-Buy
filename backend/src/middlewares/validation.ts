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

    // If validation fails, pass the error to the global error handler
    if (!result.success) {
      next(result.error);
      return;
    }

    // Replace the validated data in the request
    if (source === "body") {
      req.body = result.data;
    }

    // Replace the validated data in the request
    if (source === "params") {
      Object.assign(req.params, result.data);
    }

    // Replace the validated data in the request
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

    // Replace the validated data in the request
    try {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    } catch {
      Object.assign(req[source], result.data);
    }

    // Move to the next middleware
    next();
  };

/**
 * Validate request params
 */
export const validateParams = (schema: z.ZodType) =>
  validation(schema, "params");
/**
 * Validate request query
 */
export const validateQuery = (schema: z.ZodType) => validation(schema, "query");

/**
 * Export default validation
 */
export default validation;
