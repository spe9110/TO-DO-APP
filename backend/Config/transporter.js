import nodemailer from 'nodemailer';
import { EMAIL_USER } from './keys.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: "ztwqdwaxeswkfaaa"
    },
    tls: {
        rejectUnauthorized: false // ⚠️ désactive la vérification SSL
    }
});