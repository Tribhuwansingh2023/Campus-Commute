// Quick test of the live Railway OTP endpoint
const https = require('https');

const body = JSON.stringify({ email: "webosingh93@gmail.com" });

const options = {
  hostname: 'campus-commute.up.railway.app',
  path: '/user/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.emailFailed) {
        console.log('\n❌ DIAGNOSIS: EMAIL SENDING FAILED on Railway server.');
        console.log('   Reason: EMAIL/EMAIL_PASS env vars are NOT set on Railway.');
        console.log('   The backend fell back to on-screen OTP:', parsed.otp);
        console.log('\n✅ FIX: Set EMAIL and EMAIL_PASS in Railway dashboard environment variables.');
      } else if (parsed.success) {
        console.log('\n✅ Email was sent successfully on Railway! Check your inbox.');
      } else {
        console.log('\n⚠️  Unexpected response from server.');
      }
    } catch(e) {
      console.log('Non-JSON response (Railway parse error):', data);
    }
  });
});

req.on('error', (e) => console.error('Connection error:', e.message));
req.write(body);
req.end();
