const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const _ = require('underscore');

const port = process.env.PORT || parseInt(process.argv.pop()) || 3002;

server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

const PengOrder = require("./PengAssignment2Order");
const e = require('express');
const { exception } = require('console');
const { PhoneNumberContext } = require('twilio/lib/rest/lookups/v1/phoneNumber');

// Create a new express application instance

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("www"));

let oSockets = {};
let oOrders = {};
app.post("/payment/:phone", (req, res) => {
  // this happens when the order is complete
  sFrom = req.params.phone;
  const aReply = oOrders[sFrom].handleInput(req.body);

  const oSocket = oSockets[sFrom];
  // send messages out of turn
  for (let n = 0; n < aReply.length; n++) {
    if (oSocket) {
      const data = {
        message: aReply[n]
      };
      oSocket.emit('receive message', data);
    } else {
      throw new Exception("twilio code would go here");
    }
  }
  if (oOrders[sFrom].isDone()) {
    delete oOrders[sFrom];
    delete oSockets[sFrom];
  }
  res.end("ok");
});

app.get("/payment/:phone", (req, res) => {
  // this happens when the user clicks on the link in SMS
  const sFrom = req.params.phone;
  if (!oOrders.hasOwnProperty(sFrom)) {
    res.end("order already complete");
  } else {
    res.end(oOrders[sFrom].renderForm());
  }
});

app.post("/sms", (req, res) => {
  // turn taking SMS
  const price = req.body.price;
  let sFrom = req.body.From || req.body.from;
  let sUrl = `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.headers.host}${req.baseUrl}`;
  if (!oOrders.hasOwnProperty(sFrom)) {
    oOrders[sFrom] = new PengOrder(sFrom, sUrl, price);
  }
  if (oOrders[sFrom].isDone()) {
    delete oOrders[sFrom];
  }
  let sMessage = req.body.Body || req.body.body;
  let aReply = oOrders[sFrom].handleInput(sMessage);
  res.setHeader('content-type', 'text/xml');
  let sResponse = "<Response>";
  for (let n = 0; n < aReply.length; n++) {
    sResponse += "<Message>";
    sResponse += aReply[n];
    sResponse += "</Message>";
  }
  res.end(sResponse + "</Response>");
});

io.on('connection', function (socket) {
  // when the client emits 'receive message', this listens and executes
  socket.on('receive message', function (data) {
    // set up a socket to send messages to out of turn
    const sFrom = _.escape(data.from);
    oSockets[sFrom] = socket;
  });
});


app.post("/payment", (req, res) => {
  // turn taking SMS

  const phoneNumber = req.body.telephone;
  const price = req.body.price;

  res.end(`<!DOCTYPE html>
  
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
  </head>
  
  <body>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script
      src="https://www.paypal.com/sdk/js?client-id=AXNM_SrtJZyppHxW6U4J24u_BmxKmfYKS0LYg8Yoi41ScD-s6lkCbjtBfrjjHRQ7XaT1g5sWN_st3sDQ"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
    </script>
    Thank you ${phoneNumber} for your order of $${price}.
    <div id="paypal-button-container"></div>

    <script>
      paypal.Buttons({
          createOrder: function(data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '${price}'
                }
              }]
            });
          },
          onApprove: function(data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function(details) {             
              // This function shows a transaction success message to your buyer.
              $.post(".", details, ()=>{               
                window.open("", "_self");
                window.close(); 
              });
            });
          }
      
        }).render('#paypal-button-container');
      // This function displays Smart Payment Buttons on your web page.
    </script>
  
  </body>
  `);
});