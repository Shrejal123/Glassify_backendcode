const CartItem = require("../models/cartItem.model.js");
const cartService = require("../services/cart.service.js");

const findUserCart = async(req,res)=>{
    const user = req.user;
    try{
        const cart=await cartService.findUserCart(user._id);
        return res.status(200).send(cart);
    } catch(error){
        return res.status(500).send({error:error.message})
    }
}
const addItemToCart = async(req,res)=>{
    const user = req.user;
    try{
        const cartItem=await cartService.addCartItem(user._id,req.body);
        return res.status(200).send(cartItem);
    }
    catch(error){
        return res.status(500).send({error:error.message})
    }
}

module.exports={
    findUserCart,addItemToCart
}


// const CartItem = require("../models/cartItem.model.js");
// const cartService = require("../services/cart.service.js");

// const findUserCart = async (req, res) => {
//     const user = req.user;
//     try {
//         const cart = await cartService.findUserCart(user._id);
//         if (!cart) {
//             return res.status(404).send({ error: "Cart not found" });
//         }
//         return res.status(200).send(cart);
//     } catch (error) {
//         console.error("Error fetching cart: ", error);  // For debugging purposes
//         return res.status(500).send({ error: error.message });
//     }
// }

// const addItemToCart = async (req, res) => {
//     const user = req.user;
  
//     // Check if the user exists in the request
//     if (!user || !user._id) {
//       return res.status(400).send({ error: "User is not authenticated" });
//     }
  
//     try {
//       const cart = await cartService.addCartItem(user._id, req.body);
  
//       // If cart is not found or updated, handle it gracefully
//       if (!cart) {
//         return res.status(400).send({ error: "Error updating cart or item already in cart" });
//       }
  
//       return res.status(200).send(cart); // Return the updated cart data
//     } catch (error) {
//       console.error("Error adding item to cart: ", error); // For debugging purposes
//       return res.status(500).send({ error: error.message });
//     }
//   };
  

// module.exports = {
//     findUserCart,
//     addItemToCart
// }
