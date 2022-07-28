var db = require("../config/connection");
var collection = require("../config/collection");
const {PRODUCT_COLLECTION} = require('../config/collection')
var bcrypt = require("bcrypt");
const  promptSimShell  = require("readline-sync");
const  loginUser  = require("../config/collection");
const { Collection } = require("mongo");
const { response } = require("../app");
var objectid=require('mongodb').ObjectId

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
          localField:'products.item',
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
    console.log(cartItems[0].product)
    // console.log(productObject)
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
    resolve(count)
  })
 },
changeProductQuantity(details){
  details.count=parseInt(details.count)
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:details.cart,'products.item':details.product},
        {
          $inc:{'products.$.quantity':details.count}
        }
        ).then(()=>{
          resolve()
        })
  })
}

}