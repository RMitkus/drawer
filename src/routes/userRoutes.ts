import { Router, NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import asyncHandler from '../utils/asyncHandler';
import pool from '../mysql/mysql.js';
import crypto from 'crypto';

const userRoutes = Router();

const generateSecret = (): string => {
    return crypto.randomBytes(16).toString('hex');
};

// Create a new user
userRoutes.post('/create', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name } = req.body;
    const secret = generateSecret();
    try {
        const [insertResult] = await pool.query(
            `
                INSERT INTO users (email, name, secret) 
                VALUES (?, ?, ?)
            `,
            [email, name, secret]
        );

        const [result] = await pool.query(
            `
                SELECT * 
                FROM users 
                WHERE id = ?
            `,
            // @ts-ignore
            [insertResult.insertId]
        );
        res.json(result);
    } catch (error: any) {
        console.log(error);
        if (error.code === 'ER_DUP_ENTRY') {
            next(createError(400, 'Email already exists'));
            return;
        }
        next(createError(500, 'Internal Server Error'));
    }
}));

// Update an existing user
userRoutes.put('/update/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { email, name } = req.body;
    try {
        const [updateResult] = await pool.query(
            `
                UPDATE users
                SET email = ?, name = ?
                WHERE id = ?
            `,
            [email, name, id]
        );
        // @ts-ignore
        if (updateResult.affectedRows === 0) {
            next(createError(404, 'User not found'));
            return;
        }

        const [result] = await pool.query(
            `
                SELECT name, email 
                FROM users 
                WHERE id = ?
            `,
            [id]
        );
        res.json(result);
    } catch (error: any) {
        console.log(error);
        if (error.code === 'ER_DUP_ENTRY') {
            next(createError(400, 'Email already exists'));
            return;
        }
        next(createError(500, 'Internal Server Error'));
    }
}));

// Delete a user
userRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const [deleteResult] = await pool.query(
            `
                DELETE FROM users
                WHERE id = ?
            `,
            [id]
        );
        // @ts-ignore
        if (deleteResult.affectedRows === 0) {
            next(createError(404, 'User not found'));
            return;
        }
        res.json();
    } catch (error) {
        console.error('Database query failed', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

export default userRoutes;
