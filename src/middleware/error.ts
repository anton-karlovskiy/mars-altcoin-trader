import {
  Request,
  Response,
  NextFunction
} from 'express';

type ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('err.stack:', err.stack); // Log the error details for debugging

  // Set a default status code (e.g., 500 Internal Server Error)
  res.status(500).send('Something went wrong!');

  // Pass the error to the next middleware (if not already handled)
  next(err);
};

export {
  errorHandler
};