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
  }producthelpers.getAllproducts().then((products)=>
  {
    res.render('partials/user-view', {products,admin:false,user,cartCount});
    //console.log(products)
    //res.render('/index',{admin:true,products})
  })
  

  // let products=
  // [
  //    {
  //     id: 1,
  //     name:'Tea',
  //     price:'Rs.20',
  //     categoty:"Breakfast",
  //     image:"https://img.freepik.com/premium-photo/traditional-indian-drink-masala-tea-light-background-with-spices-copy-space_163994-466.jpg?w=900"
  //   },
  //   {
  //     id: 2,
  //     name:'Coffee',
  //     price:'Rs.15',
  //     categoty:"Breakfast",
  //     image:"https://img.freepik.com/free-photo/cup-coffee-with-heart-drawn-foam_1286-70.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 3,
  //     name:'Dosa',
  //     price:'Rs.20',
  //     categoty:"Breakfast",
  //     image:"https://img.freepik.com/premium-photo/masala-dosa-is-south-indian-meal-served-with-sambhar-coconut-chutney-selective-focus_466689-22958.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 4,
  //     name:'Chappathi',
  //     price:'Rs.20',
  //     categoty:"Breakfast",
  //     image:"https://img.freepik.com/free-photo/indian-tasty-roti-composition_23-2149073358.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 5,
  //     name:'Biriyani',
  //     price:'Rs.130',
  //     categoty:"Lunch",
  //     image:"https://img.freepik.com/free-photo/indian-chicken-biryani-served-terracotta-bowl-with-yogurt-white-background-selective-focus_466689-72554.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 6,
  //     name:'Veg Meals',
  //     price:'Rs.60',
  //     categoty:"Lunch",
  //     image:"https://img.freepik.com/free-photo/sambar-rice-sambar-sadam-one-pot-meal-from-south-indian-state-tamil-nadu-kerala_466689-75220.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 7,
  //     name:'Porotta',
  //     price:'Rs.20',
  //     categoty:"Lunch",
  //     image:"https://img.freepik.com/premium-photo/porotta-paratha-layered-flat-bread-made-using-all-purpose-wheat-flour-arranged-wooden-base_527904-3572.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 8,
  //     name:'Roti',
  //     price:'Rs.25',
  //     categoty:"Lunch",
  //     image:"https://img.freepik.com/premium-photo/indian-cuisine-tandoori-roti-wooden-background_55610-461.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 9,
  //     name:'Mango Juice',
  //     categoty:"Juice",
  //     price:'Rs.50',
  //     image:"https://img.freepik.com/free-photo/mango-juice-wooden-floor-table_1150-9676.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 10,
  //     name:'Pappya Juice',
  //     price:'Rs.50',
  //     categoty:"Juice",
  //     image:"https://img.freepik.com/free-photo/glass-papaya-juice-put-white-marble-floor_1150-28077.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 11,
  //     name:'Orange Juice',
  //     price:'Rs.50',
  //     categoty:"Juice",
  //     image:"https://img.freepik.com/free-photo/fresh-orange-juice-glass-dark-background_1150-45560.jpg?size=626&ext=jpg"
  //   },
  //   {
  //     id: 12,
  //     name:'Apple Juice',
  //     price:'Rs.50',
  //     categoty:"Juice",
  //     image:"https://img.freepik.com/free-photo/side-view-apple-juice-with-red-apples-white-wooden-table_176474-1044.jpg?size=626&ext=jpg"
  //   },
    
   

  // ]
  //res.render('index', {products,admin:false,user,cartCount});
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
   
    req.session.user=response
    req.session.loggedIn=true
    res.redirect('/')

  })
})
router.post('/login',(req,res)=>
{
  userhelpers.dologin(req.body).then((response)=>{
  if(response.status){
    
    req.session.user=response.user
    req.session.loggedIn=true
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
// router.post('/changeQuantity',async(req,res,next)=>{
//   // console.log(req.body)
//  await userhelpers.changeProductQuantity(req.body).then((response)=>{
//   console.log(req.body)
//    res.json(response)
//   })
// })
router.post('/changeQuantity',async(req,res,next)=>{
  // console.log(req.body)
 await userhelpers.changeProductQuantity(req.body).then((response)=>{
  console.log(req.body)
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
  console.log(req.body)
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
  let orders=await userhelpers.getUserOrders(req.session.user._id)
  //console.log('userid in orders'+ req.session.user._id)
  res.render('partials/orders',{user:req.session.user,orders})
})
router.get('/test/:id',async(req,res)=>{
  let products=await userhelpers.getOrderProducts(req.params.id)
  res.render('partials/test',{user:req.session.user,products})
})
router.get('/test',(req,res)=>
{
  res.render('partials/test')
})
// router.get('/deleteCartProduct',(req,res)=>
// {
//      let product_id=req.params.id
//      console.log(product_id)
//      userhelpers.deleteCartProduct(product_id).then((response)=>
//      {
//       res.redirect('/cart')
//      })
// })
router.post('/deleteCartProduct',async(req,res,next)=>{
  // console.log(req.body)
 await userhelpers.deleteCartProduct(req.body).then((response)=>{
  //console.log(req.body)
   res.json(response)
  })
})


module.exports = router;
