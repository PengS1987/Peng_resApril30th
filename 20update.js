const Order = require("./Order");
const PouchDB = require('pouchdb');

// const OrderState = Object.freeze({
//   WELCOMING:   Symbol("welcoming"),
//   ITEMCHOOSE:  Symbol("choose"),
//   SIZE:   Symbol("size"),
//   TOPPINGS:   Symbol("toppings"),
//   DRINKS:  Symbol("drinks"),
//   PAYMENT: Symbol("payment")
// });

// let Total = 0;
// let FOurOz = 8;
// let SixOz = 10;
// let EightOz = 12;
// let DrinkPrice = 5;
// let address = "";

module.exports = class PengOrder extends Order{
    constructor(sNumber, sUrl){
      super(sNumber, sUrl);
      this.stateCur = OrderState.WELCOMING;
      this.sChoose="";
      this.sSize = "";
      this.sToppings = "";
      this.sDrinks = "";
}
    // handleInput(sInput){
    //     let aReturn = [];
    //     switch(this.stateCur){
    //         case OrderState.WELCOMING:
    //             this.stateCur = OrderState.ITEMCHOOSE;
    //             aReturn.push("Welcome to Peng's fast-food resturant.");
    //             aReturn.push("Which would you like? Sandwich or Hamburger?");
    //             break;
    //             case OrderState.ITEMCHOOSE:
    //               if(sInput.toLowerCase()=="sandwich"||sInput.toLowerCase()=="hamburger"){
    //                 this.stateCur = OrderState.SIZE
    //                 this.sChoose = sInput;
    //                 aReturn.push("Which size would you like? 4oz 6oz or 8oz?");
    //               }
    //               else{
    //                 aReturn.push("Please choose Sandwich or Hamburger.")
    //               }
    //                 break;
    //             case OrderState.SIZE:
    //               if(sInput.toLowerCase()=="4oz"||sInput.toLowerCase()=="6oz"||sInput.toLowerCase()=="8oz"){
    //                 this.stateCur = OrderState.TOPPINGS
    //                 this.sSize = sInput;
    //                 switch(sInput){
    //                   case "4oz":
    //                       Total = FOurOz;
    //                       break;
    //                   case "6oz":
    //                       Total = SixOz;
    //                       break;
    //                   case "8oz":
    //                       Total = EightOz;
    //                       break;
    //               }
    //                 aReturn.push("What toppings would you like?");
    //               }
    //                 else{
    //                   aReturn.push("Please choose your size from 4oz, 6oz and 8oz.")
    //                 }
    //                 break;
    //             case OrderState.TOPPINGS:
    //                 this.stateCur = OrderState.DRINKS
    //                 this.sToppings = sInput;
    //                 aReturn.push("Would you like drinks with that?");
    //                 break;
    //             case OrderState.DRINKS:
    //                 this.stateCur = OrderState.PAYMENT;
    //                 if(sInput.toLowerCase() != "no"){
    //                     this.sDrinks = sInput;
    //                     Total = Total + DrinkPrice;
    //                 }
    //                 aReturn.push("Thank-you for your order of");
    //                 aReturn.push(`${this.sSize} ${this.sChoose} with ${this.sToppings}`);
    //                 if(this.sDrinks){
    //                     aReturn.push(this.sDrinks);
    //                 }
    //                 aReturn.push(`Please pay for your order here. $${Total} in Total.`);
    //                 aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
    //                 break;
    //             case OrderState.PAYMENT:
    //                 console.log(sInput);
    //                 this.isDone(true);
    //                 let d = new Date();
    //                 d.setMinutes(d.getMinutes() + 20);
    //                 aReturn.push(`Your order will be delivered at ${d.toTimeString()}, the address is ${address}`);
    //                 break;
    //         }
    //         return aReturn;
    //     }
    renderForm(){
      // your client id should be kept private
      const sClientID = process.env.SB_CLIENT_ID || "AXNM_SrtJZyppHxW6U4J24u_BmxKmfYKS0LYg8Yoi41ScD-s6lkCbjtBfrjjHRQ7XaT1g5sWN_st3sDQ"
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
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