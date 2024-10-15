const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Configuración del transporte de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM, // Tu dirección de correo de Gmail
        pass: process.env.EMAIL_PASSWORD, // Contraseña o Contraseña de aplicaciones de Gmail
    },
});

// Función para enviar el correo de restablecimiento de contraseña
const sendPasswordResetEmail = async (email, resetCode) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Solicitud de restablecimiento de contraseña | Foodco',
        text: `Está recibiendo esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.
            Utilice el siguiente código para completar el proceso dentro de una hora de haberlo recibido:
            ${resetCode}
            Si no lo solicitó, ignore este correo electrónico y su contraseña permanecerá sin cambios.`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .code-box {
                    background-color: #f4f4f4;
                    color: #333333;
                    font-size: 24px;
                    letter-spacing: 5px;
                    padding: 15px;
                    margin: 20px auto;
                    border-radius: 5px;
                    border: 1px solid #cccccc;
                    display: inline-block;
                    width: 200px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>Está recibiendo esto porque usted (u otra persona) ha solicitado el restablecimiento de la contraseña de su cuenta.</p>
                <p>Utilice el siguiente código para completar el proceso dentro de una hora de haberlo recibido:</p>
                <div class="code-box">${resetCode}</div>
                <p>Si no lo solicitó, ignore este correo electrónico y su contraseña permanecerá sin cambios.</p>
                <div class="footer">Este es un correo automático, por favor no responda.</div>
            </div>
        </body>
        </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de restablecimiento enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento:', error);
    }
};

const sendPasswordChangeConfirmationEmail = async (email) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Confirmación de cambio de contraseña | Foodco',
        text: `Hola,

        Esta es una confirmación de que la contraseña de tu cuenta ha sido cambiada exitosamente.

        Si no solicitaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.

        Gracias,
        El equipo de Foodco`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Tu contraseña ha sido cambiada</h2>
                <p>Hola,</p>
                <p>Esta es una confirmación de que la contraseña de tu cuenta ha sido cambiada exitosamente.</p>
                <p>Si no solicitaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.</p>
                <div class="footer">
                    <p>Gracias,<br>El equipo de Foodco</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación de cambio de contraseña enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de confirmación:', error);
    }
};

const sendRegister = async (username, email, password) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Bienvenido a Foodco',
        text: `Hola ${username},

Gracias por ser parte de Foodco. Aquí están los detalles de tu cuenta:

Usuario: ${username}
Correo electrónico: ${email}
Contraseña: ${password}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .button {
                    display: inline-block;
                    background-color: #28a745;
                    color: #ffffff;
                    padding: 15px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p><strong>Hola ${username},</strong></p>
                <p>Gracias por ser parte de Foodco. Aquí están los detalles de tu cuenta:</p>
                <p>Usuario: ${username}<br/>Correo electrónico: ${email}<br/>Contraseña: ${password}</p>
                <a class="button" href="https://google.cl">Ingresar a mi panel de control</a>
                <p>Si tiene problemas para hacer clic en el botón, copie y pegue la siguiente URL en su navegador:</p>
                <p>https://google.cl</p>
                <div class="footer">Este es un correo automático, por favor no responda.</div>
            </div>
        </body>
        </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de registro enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de registro:', error);
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendRegister,
    sendPasswordChangeConfirmationEmail
};
