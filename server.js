const express = require('express');
const app = express();
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const bodyParser = require('body-parser')
require("dotenv").config();
const nodemailer = require("nodemailer");
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 1337;

app.use(express.static(path.join(__dirname,'build')));

app.get('/*',(req,res) => {
	res.sendFile(path.join(__dirname,'build', 'index.html'));
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_LIVE_KEY, 
	key_secret: process.env.RAZORPAY_LIVE_SECRET,
})

//email configuration
app.post("/send_mail",cors(), async (req,res) => {
    let {data} = req.body;
    const transport = nodemailer.createTransport({
        host:  process.env.MAIL_HOST,
        port:  process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })
	try{
        await transport.sendMail({
			from: process.env.MAIL_FROM,
			to:"MKBangWeb@gmail.com",
			subject:"User Details",
			html:`
				<div>
				  <h2>Here is your email</h2>
				  <h3>Course Name:-${data.selectedCourse}</h3>
				  <p>Full Name:-${data.fullName}</p>
				  <p>Sex:-${data.sex}</p>
				  <p>DOB:-${data.dateOfBirth}</p>
				  <p>Father'S Name:-${data.fatherName}</p>
				  <p>Mother's Name:-${data.motherName}</p>
				  <p>Mobile:-${data.mobile}</p>
				  <p>Residential Address:-${data.residentialAddress}</p>
				  <p>Previous School Name:-${data.previousSchoolName}</p>
				  <p>10th Percentage:-${data.tenthPercentage}</p>
				  <p>Resistration Number:-${data.resigstrationNumber}</p>
				  <p>Email:-${data.email}</p>
				</div>
			`
		})
	}catch(error){
		console.log(error);
	}
    
});

//payment configuration


// const instance = new Razorpay({ key_id: 'rzp_test_jRh1ENNPJjyNNO', key_secret: 'XuOSCs8FG5mCv5JcGxFPJV8D', });

app.post('/verification', (req, res) => {
	// do a validation
	const secret = '12345678'

	console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {

	const userData = JSON.parse(req.body.body); 
    const amountPaid = parseInt(userData.amount);
	
	const payment_capture = 1
	const currency = 'INR'

	const options = {
		amount: (amountPaid) * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


app.listen(process.env.PORT || PORT, () => {
	console.log('Listening on 1337')
})

//https://mkbang.herokuapp.com/