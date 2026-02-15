import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'TrafficPro'

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `${appName} <noreply@trafficpro360.com.br>`,
    to,
    subject: `Redefinir sua senha - ${appName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A0A0B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0B;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#18181B;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;">${appName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#FFFFFF;">Redefinir sua senha</h2>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#A0A0AB;">
                Recebemos uma solicitacao para redefinir a senha da sua conta. Clique no botao abaixo para criar uma nova senha.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#8B5CF6;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
                      Redefinir senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#6B6B7B;">
                Se voce nao solicitou a redefinicao de senha, ignore este e-mail. Sua senha permanecera a mesma.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#6B6B7B;">
                Este link expira em <strong style="color:#A0A0AB;">1 hora</strong>.
              </p>
              <!-- Fallback URL -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#6B6B7B;word-break:break-all;">
                Se o botao nao funcionar, copie e cole este link no navegador:<br/>
                <a href="${resetUrl}" style="color:#8B5CF6;text-decoration:none;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4A4A5A;">
                &copy; ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
