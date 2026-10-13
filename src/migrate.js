import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const db=new pg.Pool({connectionString:process.env.DATABASE_URL});
try {
 await db.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
 if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){if(process.env.ADMIN_PASSWORD.length<12)throw Error('Admin password must contain at least 12 characters');await db.query("INSERT INTO users(id,email,password,role) VALUES($1,$2,$3,'admin') ON CONFLICT(email) DO NOTHING",[randomUUID(),process.env.ADMIN_EMAIL.toLowerCase(),await bcrypt.hash(process.env.ADMIN_PASSWORD,12)]);}
 console.log('Schema ready. Existing accounts and passwords preserved.');
}finally{await db.end();}
