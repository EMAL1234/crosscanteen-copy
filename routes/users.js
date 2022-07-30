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
      name:'Tea',
      price:'Rs.20',
      categoty:"Breakfast",
      image:"https://img.freepik.com/premium-photo/traditional-indian-drink-masala-tea-light-background-with-spices-copy-space_163994-466.jpg?w=900"
    },
    {
      id: 2,
      name:'Coffee',
      categoty:"Breakfast",
      image:"https://img.freepik.com/free-photo/cup-coffee-with-heart-drawn-foam_1286-70.jpg?size=626&ext=jpg"
    },
    {
      id: 3,
      name:'Dosa',
      categoty:"Breakfast",
      image:"https://img.freepik.com/premium-photo/masala-dosa-is-south-indian-meal-served-with-sambhar-coconut-chutney-selective-focus_466689-22958.jpg?size=626&ext=jpg"
    },
    {
      id: 4,
      name:'Chappathi',
      categoty:"Breakfast",
      image:"https://img.freepik.com/free-photo/indian-tasty-roti-composition_23-2149073358.jpg?size=626&ext=jpg"
    },
    {
      id: 5,
      name:'Biriyani',
      categoty:"Lunch",
      image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
    },
    {
      id: 6,
      name:'Veg Meals',
      categoty:"Lunch",
      image:"https://img.freepik.com/free-photo/sambar-rice-sambar-sadam-one-pot-meal-from-south-indian-state-tamil-nadu-kerala_466689-75220.jpg?size=626&ext=jpg"
    },
    {
      id: 7,
      name:'Porotta',
      categoty:"Lunch",
      image:"https://img.freepik.com/premium-photo/porotta-paratha-layered-flat-bread-made-using-all-purpose-wheat-flour-arranged-wooden-base_527904-3572.jpg?size=626&ext=jpg"
    },
    {
      id: 8,
      name:'Roti',
      categoty:"Lunch",
      image:"https://img.freepik.com/premium-photo/indian-cuisine-tandoori-roti-wooden-background_55610-461.jpg?size=626&ext=jpg"
    },
    {
      id: 9,
      name:'Mango Juice',
      categoty:"Juice",
      image:"https://img.freepik.com/free-photo/mango-juice-wooden-floor-table_1150-9676.jpg?size=626&ext=jpg"
    },
    {
      id: 10,
      name:'Pappya Juice',
      categoty:"Juice",
      image:"https://img.freepik.com/free-photo/glass-papaya-juice-put-white-marble-floor_1150-28077.jpg?size=626&ext=jpg"
    },
    {
      id: 11,
      name:'Orange Juice',
      categoty:"Juice",
      image:"https://img.freepik.com/free-photo/fresh-orange-juice-glass-dark-background_1150-45560.jpg?size=626&ext=jpg"
    },
    {
      id: 12,
      name:'Apple Juice',
      categoty:"Juice",
      image:"https://img.freepik.com/free-photo/side-view-apple-juice-with-red-apples-white-wooden-table_176474-1044.jpg?size=626&ext=jpg"
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
  //console.log(product)
  let totalValue= await userhelpers.getTotalAmount(req.session.user._id)
   res.render('partials/cart',{product,totalValue})
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
router.post('/change-product-quantity',async(req,res,next)=>{
  console.log(req.body)
 await userhelpers.changeProductQuantity(req.body).then((response)=>{
   res.json(response)
  })
})
router.get('/delivery',verifylogin,async (req,res)=>
{
let total=await userhelpers.getTotalAmount(req.session.user._id)

  res.render('partials/delivery',{total,user:req.session.user})
})
router.post('/delivery',async (req,res)=>{
  let products=await userhelpers.getCartProductList(req.body.userid)
  let totalprice=await userhelpers.getTotalAmount(req.body.userid)
userhelpers.placeOrder(req.body,products,totalprice).then((orderid)=>{
  console.log(orderid)
  if(req.body['payment-method']=='COD'){
    res.json({status:true})
  }
  else{
userhelpers.generateRazorPay(orderid,totalprice).then((response)=>{
  res.json(response)
})
  }

})

  const obj = JSON.parse(JSON.stringify(req.body));
  console.log(obj)
})
router.get('/confirmation',(req,res)=>
{
  res.render('partials/confirmation',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userhelpers.getUserOrders(req.session.userid)
  res.render('partials/orders',{user:req.session.user,orders})
})
router.get('/view-orders-products/:id',async(req,res)=>{
  let products=await userhelpers.getOrderProducts(req.params.id)
  res.render('partials/view-order-products',{user:req.session.user,products})
})

module.exports = router;
