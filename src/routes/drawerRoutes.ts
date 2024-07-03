import { Router, NextFunction, Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
    userId: string;
}
import createError from 'http-errors';
import asyncHandler from '../utils/asyncHandler';
import pool from '../mysql/mysql.js';

const drawerRoutes = Router();

const logError = (method: string, route: string, error: any) => {
    console.error(`Error ${method} ${route}`, error);
};

drawerRoutes.get('/all', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId as string;
    try {
        const [result] = await pool.query(
            `
                SELECT 
                item,
                count
                FROM items
                WHERE userId = ?
            `,
            [userId]
        );
        res.json(result);
    } catch (error) {
        logError('GET', '/all', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.get('/item/:item', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { item } = req.params;
    const userId = req.userId as string;
    try {
        const [result] = await pool.query(
            `
                SELECT 
                item,
                count
                FROM items
                WHERE userId = ? AND item = ?
            `,
            [userId, item]
        );

        if (Array.isArray(result) && result.length === 0) {
            return next(createError(404, 'Item not found'));
        }
        res.json(result);
    } catch (error) {
        logError('GET', '/item/:item', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.post('/add', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { item, count } = req.body;
    const userId = req.userId as string;
    try {
        const [insertResult] = await pool.query(
            `
                INSERT INTO items 
                (item, count, userId) 
                VALUES (?, ?, ?)
            `,
            [item, count, userId]
        );

        const [result] = await pool.query(
            `
                SELECT * 
                FROM items 
                WHERE id = ?
            `,
            [(insertResult as any).insertId]
        );
        res.json(result);
    } catch (error: any) {
        logError('POST', '/add', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return next(createError(400, 'Item already exists'));
        }
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.put('/item/:item/add/:count', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { item, count } = req.params;
    const userId = req.userId as string;
    try {
        const [updateResult] = await pool.query(
            `
                UPDATE items
                SET count = count + ?
                WHERE userId = ? 
                AND item = ?
            `,
            [count, userId, item]
        );

        if ((updateResult as any).affectedRows === 0) {
            return next(createError(404, 'Item not found'));
        }

        const [result] = await pool.query(
            `
                SELECT
                item,
                count
                FROM items
                WHERE userId = ? 
                AND item = ?
            `,
            [userId, item]
        );
        res.json(result);
    } catch (error) {
        logError('PUT', '/item/:item/add/:count', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.put('/item/:item/subtract/:count', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { item, count } = req.params;
    const userId = req.userId as string;
    try {
        const [fetchResult] = await pool.query(
            `
                SELECT 
                count
                FROM items
                WHERE userId = ? 
                AND item = ?
            `,
            [userId, item]
        );

        if (Array.isArray(fetchResult) && fetchResult.length === 0) {
            return next(createError(404, 'Item not found'));
        }
        // @ts-ignore
        if (fetchResult[0].count < parseInt(count, 10)) {
            // @ts-ignore
            return next(createError(400, `Not enough items to subtract ${count} from ${fetchResult[0].count}`));
        }

        await pool.query(
            `
                UPDATE items
                SET count = count - ?
                WHERE userId = ? AND item = ?
            `,
            [count, userId, item]
        );

        const [result] = await pool.query(
            `
                SELECT
                item,
                count
                FROM items
                WHERE userId = ? AND item = ?
            `,
            [userId, item]
        );
        res.json(result);
    } catch (error) {
        logError('PUT', '/item/:item/subtract/:count', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.delete('/all-items', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.userId as string;
    try {
        await pool.query(
            `
                DELETE FROM items
                WHERE userId = ?
            `,
            [userId]
        );
        res.json({ success: true });
    } catch (error) {
        logError('DELETE', '/all-items', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

drawerRoutes.delete('/item/:item', asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { item } = req.params;
    const userId = req.userId as string;
    try {
        const [deleteResult] = await pool.query(
            `
                DELETE FROM items
                WHERE userId = ? 
                AND item = ?
            `,
            [userId, item]
        );

        if ((deleteResult as any).affectedRows === 0) {
            return next(createError(404, 'Item not found'));
        }
        res.json({ success: true });
    } catch (error) {
        logError('DELETE', '/item/:item', error);
        next(createError(500, 'Internal Server Error'));
    }
}));

export default drawerRoutes;
