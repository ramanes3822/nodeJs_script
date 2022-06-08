var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ramanes3822@gmail.com',
    pass: 'xxxxx'
  }
});

var mailOptions = {
  from: 'ramanes3822@gmail.com',
  to: 'ramanes38@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
