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



//    let products=
//    [
//     {
//      name:'biriyani',
//      categoty:"fastfood",
//      image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
//    },
//    {
//      name:'cutlate',
//      categoty:"fastfood",
//      image:"https://img.freepik.com/free-photo/bottom-view-chicken-nuggets-lettuce-cherry-tomatoes-cutting-board-dark-table-with-copy-space_140725-112077.jpg?size=626&ext=jpg"
//    },
//    {
//      name:'burger',
//      categoty:"fastfood",
//      image:"https://img.freepik.com/free-photo/front-view-tasty-meat-burger-with-cheese-salad-dark-background_140725-89597.jpg?size=626&ext=jpg"
//    },
//    {
//      name:'vada',
//      categoty:"fastfood",
//      image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
//    },
  

//  ]


});
router.get('/add-product',function(req,res)
{
  res.render('admin/add-product')
})
router.post('/add-product',function(req,res){
  console.log(req.body);
  console.log(req.files.image);
  producthelpers.addproduct(req.body,(body)=>
  {
    res.render('admin/add-product')
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



module.exports = router;
