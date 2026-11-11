import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodIssue, type ZodTypeAny } from "zod";

export interface IRequestValidationSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export type TValidationSchema = ZodTypeAny | IRequestValidationSchema;

const isZodSchema = (value: unknown): value is ZodTypeAny => {
  return (
    typeof value === "object" &&
    value !== null &&
    "safeParseAsync" in value &&
    typeof (value as ZodTypeAny).safeParseAsync === "function"
  );
};

const isUnifiedZodSchema = (value: unknown): value is ZodTypeAny => {
  if (!isZodSchema(value)) return false;
  if (
    "shape" in value &&
    typeof value.shape === "object" &&
    value.shape !== null
  ) {
    const shape = value.shape as Record<string, unknown>;
    const hasTarget = "body" in shape || "params" in shape || "query" in shape;
    const onlyTargets = Object.keys(shape).every((k) =>
      ["body", "params", "query", "headers", "cookies"].includes(k),
    );
    return hasTarget && onlyTargets;
  }
  return false;
};

export type TRequestSource = "body" | "params" | "query";

const assignValidatedProperty = (
  req: Request,
  property: TRequestSource,
  value: unknown,
): void => {
  if (property === "query") {
    Object.defineProperty(req, "query", {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  } else if (property === "params") {
    try {
      req.params = value as typeof req.params;
    } catch {
      Object.defineProperty(req, "params", {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  } else {
    req.body = value;
  }
};

export const validateRequest = (
  schema: TValidationSchema,
  source: TRequestSource = "body",
): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // 1. Unified Zod Schema: z.object({ body: ..., params: ..., query: ... })
      if (isUnifiedZodSchema(schema)) {
        const result = await schema.safeParseAsync({
          body: req.body ?? {},
          params: req.params ?? {},
          query: req.query ?? {},
        });

        if (!result.success) {
          return next(result.error);
        }

        const data = result.data as {
          body?: unknown;
          params?: unknown;
          query?: unknown;
        };

        if (data.body !== undefined) {
          assignValidatedProperty(req, "body", data.body);
        }
        if (data.params !== undefined) {
          assignValidatedProperty(req, "params", data.params);
        }
        if (data.query !== undefined) {
          assignValidatedProperty(req, "query", data.query);
        }

        return next();
      }

      // 2. Direct Standalone Zod Schema with target source
      if (isZodSchema(schema)) {
        const targetData = (req[source] as unknown) ?? {};
        const result = await schema.safeParseAsync(targetData);

        if (!result.success) {
          return next(result.error);
        }

        assignValidatedProperty(req, source, result.data);

        return next();
      }

      // 3. Plain Object Schema Map: { body?: ..., params?: ..., query?: ... }
      const validators = schema as IRequestValidationSchema;
      const allIssues: ZodIssue[] = [];
      const hasMultipleTargets =
        [validators.body, validators.params, validators.query].filter(Boolean)
          .length > 1;

      if (validators.params) {
        const result = await validators.params.safeParseAsync(req.params ?? {});
        if (!result.success) {
          for (const issue of result.error.issues) {
            allIssues.push({
              ...issue,
              path: hasMultipleTargets ? ["params", ...issue.path] : issue.path,
            });
          }
        } else {
          assignValidatedProperty(req, "params", result.data);
        }
      }

      if (validators.query) {
        const result = await validators.query.safeParseAsync(req.query ?? {});
        if (!result.success) {
          for (const issue of result.error.issues) {
            allIssues.push({
              ...issue,
              path: hasMultipleTargets ? ["query", ...issue.path] : issue.path,
            });
          }
        } else {
          assignValidatedProperty(req, "query", result.data);
        }
      }

      if (validators.body) {
        const result = await validators.body.safeParseAsync(req.body ?? {});
        if (!result.success) {
          for (const issue of result.error.issues) {
            allIssues.push({
              ...issue,
              path: hasMultipleTargets ? ["body", ...issue.path] : issue.path,
            });
          }
        } else {
          assignValidatedProperty(req, "body", result.data);
        }
      }

      if (allIssues.length > 0) {
        return next(new ZodError(allIssues));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default validateRequest;
