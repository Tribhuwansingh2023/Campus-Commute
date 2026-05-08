fetch('http://localhost:8000/user/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'webosingh93@gmail.com' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
