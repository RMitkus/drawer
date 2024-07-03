import express = require('express');
import { NextFunction, Request, Response } from 'express';
import drawerRoutes from './routes/drawerRoutes';
import { HttpError } from 'http-errors';
import asyncHandler from './utils/asyncHandler';
import cors from 'cors';

import createHttpError from 'http-errors';
import userRoutes from './routes/userRoutes';
import pool from './mysql/mysql';
import rateLimit from 'express-rate-limit';


const app = express();
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
}));


// security middleware
app.use('*', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [userResult] = await pool.query(
            `
                SELECT 
                id
                FROM users
                WHERE id = ? AND secret = ?
            `,
            [req.headers['drawer-user-id'], req.headers['drawer-secret']]
        );

        if (Array.isArray(userResult) && userResult.length === 0) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // @ts-ignore
        req.userId = req.headers['drawer-user-id'];
        next();
    } catch (error) {
        console.error('Middleware auth error: ', error);
        next(createHttpError(500, 'Internal Server Error'));
    }
}));



app.use('/drawer', drawerRoutes);
app.use('/users', userRoutes)

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    res.json({
        status: err.status,
        message: err.message
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
}
);