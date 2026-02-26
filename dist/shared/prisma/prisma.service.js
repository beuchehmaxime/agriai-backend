"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_libsql_1 = require("@prisma/adapter-libsql");
const config = {
    url: process.env.DATABASE_URL || "file:./dev.db",
};
const adapter = new adapter_libsql_1.PrismaLibSql(config);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
