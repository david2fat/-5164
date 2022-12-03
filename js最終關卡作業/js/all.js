// 取得產品列表

const productsList=document.querySelector(".productWrap");
//產品列表
const cartList=document.querySelector(".shoppingCart-tableList");
function init() {
    getProductList();
    getCartList() 
}
init();
const productselect =document.querySelector(".productSelect");
let productsData=[];
let cartData=[];
function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
      .then(function (response) {
        productsData=response.data.products;
        renderProductList();
       
      })
      .catch(function(error){
        console.log(error.response.data)
      })
  }//從外部取得產品資訊
  //監聽寫外成 innterHTML寫內層
function  combinProductHTMLItem(item){
return `<li class="productCard">
<h4 class="productType">新品</h4>
<img src="${item.images}" alt="">
<a href="#"   id="addCardBtn"  class="js-addCart" data-id="${item.id}">加入購物車</a>
<h3>${item.title}</h3>
<del class="originPrice">NT$${toThousands(item.origin_price)}</del>
<p class="nowPrice">NT$${toThousands(item.price)}</p>
</li>`
} //整理重複片段  //取得產品id加入data-id
function renderProductList(){
    let str="";
    productsData.forEach(function(item){
        str+=combinProductHTMLItem(item);
    })
    productsList.innerHTML=str;
}  

productselect.addEventListener("change",function(e){
    const category=e.target.value; //category 類別
    if(category=="全部"){
    renderProductList();
    return;
    }
    let str="";
    productsData.forEach(function(item){
    if(item.category==category){
        str+=combinProductHTMLItem(item);
        } 
    })
    productsList.innerHTML=str;
    }) //下拉式選單反映

productsList.addEventListener("click",function(e){
    e.preventDefault();//取消預設錨點
    //優化點擊反應 搭配27行 ID class
    let addCardClass=e.target.getAttribute("class");
    if(addCardClass!=="js-addCart"){
       
        return;
    }
    //下列帶進post請求
    let productId=e.target.getAttribute("data-id");
    console.log(productId);

    let numCheck=1; 
    cartData.forEach(function(item){
      if(item.product.id===productId){
        numCheck=item.quantity+=1; //當點選購物車時如果資料庫有重複則品項+1
      }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
              "productId": productId,
              "quantity": numCheck
            }
            
    }).then(function(response){
      alert("加入購物車") 
      getCartList();
    })
})    

function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      document.querySelector(".js-total").textContent=
      toThousands(response.data.finalTotal);
      cartData=response.data.carts;
      let str="";
      cartData.forEach(function(item){
      str +=`<tr>
      <td>
          <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
          </div>
      </td>
      <td>NT$${toThousands(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${toThousands(item.product.price*item.quantity)}</td>
      <td class="discardBtn">
          <a href="#" class="material-icons"  data-id="${item.id}">
              clear
          </a>
      </td>
  </tr>`  
      });
    
    cartList.innerHTML=str;
     
    })
    .catch(function(error){
     
    });
    
}
cartList.addEventListener("click",function(e){
  e.preventDefault();
  console.log(e.target);
  const cardId=e.target.getAttribute("data-id");
  if(cardId==null){
    alert("請正確點擊按鈕");
    return
  }
  console.log(cardId);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cardId}`)
  .then(function(response){
   alert("刪除單筆購物車成功");
   getCartList(); 
  })
})
//刪除全部購物車流程
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){
    alert("刪除整筆購物車成功");
    getCartList(); 
  })
  .catch(function(response){
    alert("購物車已經清空,請勿重複點擊");
    
  })
})
//送出訂單
const orderInfoBtn=document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault();
  //驗證是否購物車有商品
  if(cartData.length==0){
    alert("加入購物車");
    return;
  }else{
    // alert("你的購物車有資料")
  }
  //資料內的值
  const customerName=document.querySelector("#customerName").value;
  const customerPhone=document.querySelector("#customerPhone").value;
  const customerEmail=document.querySelector("#customerEmail").value;
  const customerAddress=document.querySelector("#customerAddress").value;
  const customerTradeWay=document.querySelector("#tradeWay").value;

  if(customerName==""|| customerPhone==""|| customerEmail==""|| customerAddress==""|| customerTradeWay==""){
   alert("請輸入訂單清單");
   return;
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
  {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  })
  .then(function(response) {
    alert("訂單建立成功");
    document.querySelector("#customerName").value="";
    document.querySelector("#customerPhone").value="";
    document.querySelector("#customerEmail").value="";
    document.querySelector("#customerAddress").value="";
    document.querySelector("#tradeWay").value="ATM";
    getCartList();
  })
  .catch(err => {
    console.error(err); 
  })
})


function toThousands(e){
  let parts=e.toString().split(".");
  parts[0]=parts[0].replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
