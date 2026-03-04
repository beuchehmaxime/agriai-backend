import { Request } from "express";
import { User } from "@prisma/client";

export interface AuthRequest extends Request {
    user?: User; // Using Prisma's User type
    file?: Express.Multer.File; // For single file uploads
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }; // For multiple files
}
