var db = require("../config/connection");
var collection = require("../config/collection");
const {PRODUCT_COLLECTION} = require('../config/collection')
var bcrypt = require("bcrypt");
const  promptSimShell  = require("readline-sync");
const  loginUser  = require("../config/collection");
const { Collection } = require("mongo");
const { response } = require("../app");
const Razorpay=require('razorpay');
const { reset } = require("nodemon");
var objectid=require('mongodb').ObjectId
var instance = new Razorpay({
  key_id: 'rzp_test_vAkOwzK2HBW8V3',
  key_secret: 'o8q42LPRmpVriioqTMr9NUNC',
});

module.exports = {
  doSignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      try {
        userdata.password = await bcrypt.hash(userdata.password, 10);

        db.get().collection(collection.USER_COLLECTION).insertOne(userdata);
        resolve(userdata);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
 dologin:(userdata)=>
 {
    return new Promise(async (resolve,reject)=>
    {
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({
            Email:userdata.Email
               })
        try{
        if(user)
        {
          bcrypt.compare(userdata.Password,user.password, (err, res)=>
          {
          if(res)
               {
                 console.log('success')
                 response.user=user
                 response.status=true
                 resolve(response)
               }
               else{
                 console.log('failed')
                 resolve({res:false})
               }

        
          })
          
        }
        else{
          console.log('failed no account')
          resolve({res:false})
        }
      }catch(e)
      {
        console.log(e)
        next(e)
      }
    })
 },
  addtoCart:(product_id,user_id)=>{
   //console.log("count is"+count)
   let productObject={
    item:product_id,
    quantity:1
   }
  return new Promise(async (resolve,reject)=>{
    let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:user_id})
    if(userCart){
      let productExist=userCart.products.findIndex(products=>products.item==product_id)
      console.log(productExist)
      if(productExist!=-1){
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({user:user_id,'products.item':product_id},
        {
          $inc:{'products.$.quantity':1}
        }
        ).then(()=>{
          resolve()
        })
      }else{ db.get().collection(collection.CART_COLLECTION)
        .updateOne({user:user_id},
          
     {
      
        $push:{products:productObject}
      

      }
   ).then((response)=>{
    resolve()
   })}
        
       
    }
    else{
      let cartObject={
        user:user_id,
        products:[productObject]
      }
      db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response)=>{
        resolve()
      })
    }
  })
 },
   
 getCartProducts:(userid)=>{
  return new Promise(async(resolve,reject)=>{
    let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
      {
        $match:{user:userid}
      },
      {
        $unwind:'$products'
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:PRODUCT_COLLECTION,
          localField:'item',
          foreignField:'id',
          as:'product'
        }
      }
      ,
      {
        $project:{
          item:1,
          quantity:1,
          product:{$arrayElemAt:['$product',0]}
        }
      }

    ]).toArray()
     console.log(cartItems)
    //  console.log(productObject)
   resolve(cartItems)

  })
 
 },
 getCartCount:(userid)=>{
  return new Promise(async(resolve,reject)=>
  {
    let count=0
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:userid})
    if(cart){
      count=cart.products.length
      //console.log("enterd here for cart length")
    }
    console.log(count)
    resolve(count)
  })
 },
//  deleteCartProduct:(product_id)=>
//  {
//   console.log("product id"+product_id)
//      return new Promise((resolve,reject)=>
//      {
//          db.get().collection(collection.CART_COLLECTION).deleteOne({id:product_id}).then((response)=>
//          {
//              console.log(response)
//              resolve(response);
//          }
//          )
//      })
//  },

 changeProductQuantity:(details)=>{
  console.log(details.cart)
  console.log(details.product)
  console.log(details.count)
      details.count=parseInt(details.count)
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:objectid(details.cart),'products.item':details.product},
        {
          $inc:{'products.$.quantity':details.count}
        }
        ).then(()=>{
          resolve()
        })
      })
 },
 deleteCartProduct:(details)=>{
  console.log(details.product)
  console.log(details.cart)
  //details.count=parseInt(details.count)
      return new Promise((resolve,reject)=>{

        
        db.get().collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectid(details.cart) },

          { $pull:
             { 
              products:
             {
               item: details.product
              } 
              } 
            },
        
        ).then(()=>{
          resolve()
        })
      })
 },

 getTotalAmount:(user_id)=>{
    
  return new Promise(async(resolve,reject)=>{
    let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
      {
        $match:{user:user_id}
      },
      {
        $unwind:'$products'
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:PRODUCT_COLLECTION,
          localField:'item',
          foreignField:'id',
          as:'product'
        }
      }
      ,
      {
        $project:{
          item:1,
          quantity:1,
          product:{$arrayElemAt:['$product',0]}
        }
      },
      {
        $group:{
          _id:null,
          total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}    }
      }

    ]).toArray()
     console.log(total)
    //  console.log(productObject)
   resolve(total[0].total)

  })
 
 },
 placeOrder:(order,products,total)=>{
   return new Promise((resolve,reject)=>
   {
      console.log(order,products,total)
      let status=order['payment-method']==='COD'?'placed':'pending'
      orderObject={
        deliveryDetails:{
          mobile:order.mobile,
          address: order.address,
          pincode:order.pincode
        },
        userid:order.userid,
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date:new Date()
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObject).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:order.userid})
           //console.log(order.userid)
          resolve(order.userid)
      })
   })
 },
 getAllproducts:()=>{
  return new Promise(async(resolve,reject)=>
  {
      let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(products)
  })
},
 getCartProductList:(userid)=>{
   return new Promise(async(resolve,reject)=>{
    let cart =await db.get().collection(collection.CART_COLLECTION).findOne({user:userid})
    //console.log(cart)
    resolve(cart.products)
   })
 },
 getUserOrders:(userid)=>
 {
  //console.log("useeridin guo" + userid)
  return new Promise(async(resolve,reject)=>{
    let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userid}).toArray()
   // console.log(orders);
    resolve(orders)
  })
 },
 

 getOrderProducts:(orderid)=>{
  console.log(orderid)
  return new Promise(async(resolve,reject)=>{
    let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
     //console.log('gop'+orderid),
      {
        
        $match:{_id:objectid(orderid)}
      },
      {
        $unwind:'$products'
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:collection.PRODUCT_COLLECTION,
          localField:'item',
          foreignField:'id',
          as:'product'
        }
      }
      ,
      {
        $project:{
          item:1,
          quantity:1,
          product:{$arrayElemAt:['$product',0]}
        }
      }

    ]).toArray()
     //console.log(orderid),
    // console.log(cartItems[0].product)
     console.log(orderItems)
   resolve(orderItems)

  })
 
//  },
//  generateRazorPay:(orderid,total)=>{
//   //console.log("total",total)
//   return new Promise((resolve,reject)=>{
//    var options={
//     amount:total,
//     currency:'INR',
//     reciept:"order"+orderid
//    };
//    instance.orders.create(options,function(err,order){
//     if(err){
//       console.log(err)
//     }
//     console.log("new order:",order)
//     resolve(order)
//    })
//   })
//  }

 },
 
 
}
