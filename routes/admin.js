var express = require('express');
const { helpers } = require('handlebars');
const { response } = require('../app');
var router = express.Router();
var producthelpers=require('../helpers/product-helpers')
/* GET users listing. */
router.get('/', function(req, res, next) {
producthelpers.getAllproducts().then((products)=>
{
  console.log(products)
  res.render('admin/admin-view',{admin:true,products})
})





});
router.get('/add-product',function(req,res)
{
  res.render('admin/add-product')
})
router.post('/add-product',function(req,res){
  //console.log(req.body);
  console.log(req.files.image);
  producthelpers.addproduct(req.body,(body)=>
  {
    res.render('admin/add-product',{admin:true})
  })
})
router.get('/delete-product/:id',(req,res)=>
{
     let product_id=req.params.id
     console.log(product_id)
     producthelpers.deleteProduct(product_id).then((response)=>
     {
      res.redirect('/admin/')
     })
})
router.get('/edit-product/:id',async (req,res)=>{
    let product= await producthelpers.getProductDetails(req.params.id)
    console.log(product)
    res.render('admin/admin-editproduct',{product})
})
router.post('/edit-product/:id',(req,res)=>
{
  producthelpers.updateProduct(req.params.id,req.body).then(()=>{
     res.redirect('/admin')
  })
})
router.get('/orderinfo',async(req,res)=>{
  //console.log(user)
  let orders=await producthelpers.getAdminAllOrders(req.user)
  //console.log('userid in orders'+ req.session.user._id)
  res.render('admin/order-info',{user:req.user,orders,admin:true})
})


module.exports = router;
