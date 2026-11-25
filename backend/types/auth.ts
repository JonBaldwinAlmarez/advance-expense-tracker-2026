import type { Request } from "express";

// Info your auth middleware attaches to the request
export type AuthUser = {
  id: string;
};

// Express Request plus the optional `user` set by the auth middleware.
// Generics let each controller still type its params, response, and body
export type AuthRequest<P = {}, ResBody = any, ReqBody = any> = Request<
  P,
  ResBody,
  ReqBody
> & {
  user?: AuthUser;
};

// What we put inside the JWT when it is created (see createToken)
export type TokenPayload = {
  id: string;
};
