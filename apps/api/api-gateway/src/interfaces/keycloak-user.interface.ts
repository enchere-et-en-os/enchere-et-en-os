export interface TypedRequest extends Request {
  user: {
    sub: string;
    email?: string;
  };
}
