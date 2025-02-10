const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");

// async function createCart(user){
//     try{
//         const cart = new Cart({user});
//         const createdCart = await cart.save();
//         return createdCart;
//     }
//     catch(error){
//     throw new Error(error.message);
//     }
// }
// async function findUserCart(userId){
//     try{
//         let cart=await Cart.findOne({user:userId});
         
//         let cartItems=await CartItem.find({cart:cart._id}).populate("product");
//         cart.cartItems=cartItems;
//         let totalPrice=0;
//         let totalDiscountedPrice=0;
//         let totalItem=0;
        
//         for(let cartItem of cart.cartItems){
//             totalPrice+=cartItem.price;
//             totalDiscountedPrice+=cartItem.discountedPrice;
//             totalItem+=cartItem.quantity;
//         }
//         cart.totalPrice=totalPrice;
//         cart.totalItem=totalItem;
//         cart.discount=totalPrice-totalDiscountedPrice;
//         return cart;
//     }
//     catch(error){
//         throw new Error(error.message)
//     }
// }

async function createCart(user) {
    try {
        const cart = new Cart({ user });
        const createdCart = await cart.save();
        return createdCart;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function findUserCart(userId) {
    try {
        let cart = await Cart.findOne({ user: userId }).lean(); // ✅ Use .lean() for better performance

        if (!cart) {
            return { cartItems: [], totalPrice: 0, totalDiscountedPrice: 0, totalItem: 0, discount: 0 };
        }

        let cartItems = await CartItem.find({ cart: cart._id }).populate("product");

        // 🔹 Convert cart to an updatable object
        cart = { ...cart, cartItems };

        let totalPrice = 0;
        let totalDiscountedPrice = 0;
        let totalItem = 0;

        for (let cartItem of cart.cartItems) {
            totalPrice += cartItem.price * cartItem.quantity;
            totalDiscountedPrice += cartItem.discountedPrice * cartItem.quantity;
            totalItem += cartItem.quantity;
            
        }

        cart.totalPrice = totalPrice;
        cart.totalItem = totalItem;
        cart.discount = totalPrice - totalDiscountedPrice;
        cart.totalDiscountedPrice = totalDiscountedPrice;

        // ✅ Update the cart in the database
        await Cart.findByIdAndUpdate(cart._id, {
            totalPrice,
            totalItem,
            discount: totalPrice - totalDiscountedPrice,
            totalDiscountedPrice
        });

        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
}
async function addCartItem(userId,req){
    try{
        const cart = await Cart.findOne({user:userId});
        const product=await Product.findById(req.productId);
        const isPresent=await CartItem.findOne({cart:cart._id,product:product._id,userId});

        if(!isPresent){
            const cartItem = new CartItem({
                product:product._id,
                cart:cart._id,
                quantity:1,
                userId,
                price:product.price,
                // size:req.size,
                discountedPrice:product.discountedPrice,

            })

            const createdCartItem = await cartItem.save();
            cart.cartItems.push(createdCartItem);
            await cart.save();
            return "Item added to cart";
        }
    }
    catch(error){
        throw new Error(error.message)
    }
}
// async function addCartItem(userId, req) {
//     try {
//         console.log("🟢 Received Request Data:", req);
//         console.log("🟢 User ID:", userId);

//         const cart = await Cart.findOne({ user: userId });
//         console.log("🟢 Found Cart:", cart);

//         if (!cart) {
//             return "Cart not found";  // <-- Return proper error if no cart exists
//         }

//         const product = await Product.findById(req.productId);
//         console.log("🟢 Found Product:", product);

//         if (!product) {
//             throw new Error("Product not found");
//         }

//         const isPresent = await CartItem.findOne({ cart: cart._id, product: product._id, userId });
//         console.log("🟢 Item Already Present:", isPresent);

//         if (!isPresent) {
//             const cartItem = new CartItem({
//                 product: product._id,
//                 cart: cart._id,
//                 quantity: 1,
//                 userId,
//                 price: product.price,
//                 discountedPrice: product.discountedPrice,
//             });

//             const createdCartItem = await cartItem.save();
//             console.log("🟢 Created Cart Item:", createdCartItem);

//             return "Item added to cart";
//         }

//         return "Item already in cart";
//     } catch (error) {
//         console.error("🔴 Error in addCartItem:", error.message);
//         throw new Error(error.message);
//     }
// }


module.exports={createCart,findUserCart,addCartItem}


