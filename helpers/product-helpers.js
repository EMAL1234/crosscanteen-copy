var db=require('../config/connection')
var collection=require('../config/collection');
const { response } = require('../app');
var objectid=require('mongodb').ObjectId
//var myId= JSON.parse(req.body.product_id);
module.exports={
    addproduct:(product,callback)=>
    {
        console.log(product);
        db.get().collection('products').insertOne(product).then((data)=>
        {
            callback(true)
        })
    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>
        {
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(product_id)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectid(product_id)}).then((response)=>
            {
                console.log(response)
                resolve(response);
            }
            )
        })
    },

    getProductDetails:(product_id)=>{
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectid(product_id)}).then((product)=>
            {
                resolve(product)
            })
        })

    },
    updateProduct:(product_id,product_details)=>
    {
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectid(product_id)},{
              $set:{
                Name:product_details.Name,
                Description:product_details.Description,
                Price:product_details.Price,
                Category:product_details.Category

              }  
            }
            ).then((response)=>
            {
                resolve()
            })
        })
    }

}