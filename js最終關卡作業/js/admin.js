let orderData=[];
const orderList=document.querySelector(".js-orderList")
function init(){
    getOrderList();    
}
init();
function renderC3(){
  //物件資料收集
  let total={};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
    if(total[productItem.category]==undefined){
      total[productItem.category]=productItem.price*productItem.quantity;
    }else{
      total[productItem.category]+=productItem.price*productItem.quantity;
    }  
    })
  })
console.log(total);
//做出資料關聯
let categoryAry=Object.keys(total);
console.log(categoryAry);
let newData=[];
categoryAry.forEach(function(item){
  let ary=[];
  ary.push(item);
  ary.push(total[item]);
  newData.push(ary);
})
console.log(newData);

  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        
    },
});
}
function renderC3_lv2(){
  //資料蒐集
  let obj={};
  item.products.forEach(function(productItem){
    if(obj[productItem.title]===undefined){
      obj[productItem.title]=productItem.quantity*productItem.price;
    }else{
      obj[productItem.title]+=productItem.quantity*productItem.price;
    }
  });
  console.log(obj);
//拉出資料關聯
let originAry=Object.keys(obj);
console.log(originAry);
let rankSortAry=[];
rankSortAry.forEach(function(item){
  let ary=[];
  ary.push(item);
  ary.push(obj[item]);
  rankSortAry.push(ary);
})
}
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            "Authorization":token,
        }
    })
    .then(function (response) {
        orderData=response.data.orders;
        
        
        //組訂單字串
        let str="";
        orderData.forEach(function(item){
          //組時間字串
          const thisStamp= new Date(item.createdAt*1000);//需轉換成毫秒13碼
          const orderTime=`${thisStamp.getFullYear()}/${thisStamp.getMonth()+1}/${thisStamp.getDate()}`;
          
            //組產品字串
          let productStr="";  
          item.products.forEach(function(productItem){
            productStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
          })
          //判斷訂單狀態
          let orderStatus="";
          if(item.paid==true){
            orderStatus="未處理"
          }else{
            orderStatus="已處理"
          }

          //組訂單字串
            str+=`  <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
              <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>
        `
        })
        orderList.innerHTML=str;
        renderC3();
    })
}

//處理按鍵 未處理 刪除建

orderList.addEventListener("click",function(e){
  e.preventDefault();
  const targetClass=e.target.getAttribute("class");
  // console.log(targetClass);
  let id= e.target.getAttribute("data-id");
  if(targetClass=="delSingleOrder-Btn js-orderDelete"){
    deleteOrderItem(id);//執行刪除訂單函式
    return;
  }
  if(targetClass=="orderStatus"){
    let status= e.target.getAttribute("data-status");
   
    changeOrderStatus(status,id)//感變指定狀態+ID
    return;
  }
})

//感變特定品項
function changeOrderStatus(status,id){
console.log(status,id);
//處理轉換  ?疑問這裡應該要寫false才對 只有未處理可以轉乘已處理
let newStatus;
if(status==true){
  newStatus=false;
}else{
  newStatus=true;
}
axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
  "data": {
    "id": id,
    "paid": newStatus
  }
},{
  headers:{
      "Authorization":token,
  }
})
.then(function(response){//變更訂單狀態
  alert("修改訂單狀態成功");
  getOrderList();
})
}
//刪除訂單
function deleteOrderItem(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            "Authorization":token,
        }
    })
    .then(function(response){
      alert("刪除訂單成功")
      getOrderList();
    })
}
//修改日期 2020/12/3
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,{
        headers:{
            "Authorization":token,
        }
    })
    .then(function(response){
      alert("刪除全部訂單成功")
      getOrderList();
    })
})


