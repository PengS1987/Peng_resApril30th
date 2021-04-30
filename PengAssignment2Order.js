const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING:   Symbol("welcoming"),
  ADDRESS:   Symbol("Address"),
  PAYMENT: Symbol("payment")
});


let address = "";

module.exports = class PengOrder extends Order{
    constructor(sNumber, sUrl, price){
      super(sNumber, sUrl, price);
      this.stateCur = OrderState.WELCOMING;
      // this.sChoose="";
      // this.sSize = "";
      // this.sToppings = "";
      // this.sDrinks = "";
      this.sAddress = "";
}
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.PAYMENT;
                aReturn.push("Thanks for your order.");
                aReturn.push("Please enter your delivery address.");
                break;
                case OrderState.PAYMENT:
                  this.sAddress  = sInput;                  
                  aReturn.push("Please pay the link below");
                  aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                    break;
            }
            return aReturn;
        }
    renderForm(){
      // your client id should be kept private
      //const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=AXNM_SrtJZyppHxW6U4J24u_BmxKmfYKS0LYg8Yoi41ScD-s6lkCbjtBfrjjHRQ7XaT1g5sWN_st3sDQ"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.price}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.price}'
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
  
    }
}