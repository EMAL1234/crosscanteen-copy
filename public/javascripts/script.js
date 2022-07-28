function addToCart(product_id)
{
  $.ajax({
    
    url:'/add-to-cart/' + product_id,
    method:'GET',   
    success:(response)=>{
        if(response.res){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $("#cart-count").html(count)
        }
      
    }
  })
}