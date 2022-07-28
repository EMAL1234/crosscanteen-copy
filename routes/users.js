var express = require('express');
const  response  = require('../app');
var router = express.Router();
var producthelpers=require('../helpers/product-helpers')
var userhelpers=require('../helpers/user-helperssignup')
const verifylogin=(req,res,next)=>
{
  if(req.session.loggedIn)
  { 
    console.log("logged in")
    next()
  }
  else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function(req, res, next) {
   let user=req.session.user
  console.log(user) 
  let cartCount=null
  if(req.session.user){
   cartCount=await userhelpers.getCartCount(req.session.user._id)
   //console.log("get cart count")
  }
  // console.log(req.session.user._id)
  // producthelpers.getAllproducts().then((products)=>
  // {
   
  //   res.render('admin/admin-view',{admin:true,products,user})
  // })

  let products=
  [
     {
      id: 1,
      name:'biriyani',
      categoty:"fastfood",
      image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
    },
    {
      id: 2,
      name:'cutlate',
      categoty:"fastfood",
      image:"https://img.freepik.com/free-photo/bottom-view-chicken-nuggets-lettuce-cherry-tomatoes-cutting-board-dark-table-with-copy-space_140725-112077.jpg?size=626&ext=jpg"
    },
    {
      id: 3,
      name:'burger',
      categoty:"fastfood",
      image:"https://img.freepik.com/free-photo/front-view-tasty-meat-burger-with-cheese-salad-dark-background_140725-89597.jpg?size=626&ext=jpg"
    },
    {
      id: 4,
      name:'vada',
      categoty:"fastfood",
      image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
    },
   

  ]
  res.render('index', {products,admin:false,user,cartCount});
});
router.get('/login',(req,res)=>
{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('partials/login',{"loginError":req.session.loginError})
  req.session.loginError=false
  }

})
router.get('/signup',(req,res)=>
{
  res.render('partials/signup')
})
router.post('/signup',(req,res)=>
{
  //console.log("working")
  userhelpers.doSignup(req.body).then((response)=>
  {
   
    console.log(response);
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')

  })
})
router.post('/login',(req,res)=>
{
  userhelpers.dologin(req.body).then((response)=>{
  if(response.status){
    req.session.loggedIn=true
    req.session.user=response.user
    res.redirect('/')
  }
  else{
    req.session.loginError=true
    res.redirect('/login')
  }
})})

router.get('/cart',verifylogin,async(req,res)=>    
{

  let product=await userhelpers.getCartProducts(req.session.user._id)
  console.log(product)
   res.render('partials/cart',{product})
})
router.get('/add-to-cart/:id',async (req,res)=>{
  console.log("api call")
 await userhelpers.addtoCart(req.params.id,req.session.user._id,).then(()=>{
    //res.json({status:true})
    //console.log("after addtocart")
    
    // res.status(200);
    
    //console.log(req.session.user._id)
    
 })
// res.redirect('/')
res.json({res:true})
   
})
router.post('/change-product-quantity/',(req,res,next)=>{
  console.log(req.body)
  userhelpers.changeProductQuantity(req.body).then(()=>{

  })
})

module.exports = router;
