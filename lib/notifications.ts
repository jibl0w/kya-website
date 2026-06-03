function emailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>KYA Digital Services</title>
</head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A2540 0%,#0D1420 100%);border-radius:16px 16px 0 0;padding:36px 40px;border-bottom:2px solid #C9A84C;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:32px;font-weight:900;color:#E8E0D0;letter-spacing:-0.02em;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></span>
                  <p style="margin:4px 0 0;font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.15em;">Digital Services</p>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#4A5568;text-transform:uppercase;letter-spacing:0.1em;">Trade Infrastructure</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- GOLD LINE -->
        <tr>
          <td style="background:#C9A84C;height:2px;padding:0;line-height:2px;font-size:0;">&nbsp;</td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#0D1420;padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="background:#0D1420;padding:0 40px;">
            <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
          </td>
        </tr>

        <!-- DISCLAIMER -->
        <tr>
          <td style="background:#0D1420;padding:20px 40px;">
            <p style="margin:0;font-size:11px;color:#4A5568;line-height:1.7;">
              <strong style="color:#6B7280;">Important:</strong> KYA Digital Services Ltd does not hold, transfer, or process customer funds. All financial activities are conducted exclusively by licensed banking and settlement partners.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0D1420 0%,#080C14 100%);border-radius:0 0 16px 16px;padding:28px 40px;border-top:1px solid rgba(201,168,76,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#4A5568;line-height:1.8;">
                    <strong style="color:#6B7280;">KYA Digital Services Ltd</strong><br/>
                    CAC Registered &nbsp;&middot;&nbsp; Lagos, Nigeria<br/>
                    Not a PSP &nbsp;&middot;&nbsp; Not a Bank &nbsp;&middot;&nbsp; Trade Infrastructure Platform
                  </p>
                </td>
                <td align="right" valign="top">
                  <a href="${APP_URL}" style="font-size:12px;color:#C9A84C;text-decoration:none;font-weight:600;">kya.ng</a><br/>
                  <a href="mailto:info@kya.ng" style="font-size:11px;color:#4A5568;text-decoration:none;">info@kya.ng</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
  `;
}