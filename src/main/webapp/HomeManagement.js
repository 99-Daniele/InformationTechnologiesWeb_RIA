{
	  let visualizedItemsList, searchedItemList, itemInfo, cartItemsList, cartList, orderList, orders = 0, pageOrchestrator = new PageOrchestrator();

    window.addEventListener("load", () => {
		if (sessionStorage.getItem("user") == null) {
	      window.location.href = "Login.html";
	    } else {
	      pageOrchestrator.start();
	    }
	  }, false);
		

	(function(){
		document.getElementById("keywordInput").addEventListener('keydown', (e) => {
			if(e.key === 'Enter'){
				e.preventDefault();
		    	var form = e.target.closest("form");
				var keyword = form.elements["keywordInput"].value;
		    	if (form.checkValidity()) {
		      		makeCall("POST", 'GetSearchedItems', e.target.closest("form"),
		        		function(x) {
		          			if (x.readyState == XMLHttpRequest.DONE) {
			        			items = JSON.parse(x.responseText);
		            			switch (x.status) {
		              				case 200:
		            					showSearchedItems(keyword, items);
		                				break;
              						case 400:
                						alert("Please insert keyword");
                						break;
              						case 500:
            							alert("ERROR! Can't connect to Database ! Retry later");
                						break;
		            			}
		          			}
		        		});
		    	}
			}
  		});	
	})();
	
	function findItem(item, itemList){
		var pos = 0;
		var find = false;
		for(pos; pos < itemList.length; pos++){
			if(item.itemID === itemList[pos].itemID){
				find = true;
				return pos;
			}
		}
		if(!find)
			return -1;
	}
	
	function addVisualizedItem(item){
		var visualizedItems = JSON.parse(sessionStorage.getItem('visualizedItems'));
		pos = findItem(item, visualizedItems);
		if(pos === -1){
			visualizedItems.pop();
			visualizedItems.unshift(item);
		}
		else{
			visualizedItems.splice(pos, 1);
			visualizedItems.unshift(item);
		}
		if(visualizedItems.length > 5)
			visualizedItems.pop();
		sessionStorage.setItem("visualizedItems", JSON.stringify(visualizedItems));	
		visualizedItemsList.update(visualizedItems);
	}

	function makeVisibleOrInvisible(container, visible){
		
		this.container = container;
		
		if(visible)
			this.container.style.visibility = "visible";
		else
			this.container.style.visibility = "hidden";
	}
	
	function move(container, x, y){
		
		this.container = container;
		
		this.container.style.position = "absolute";
		this.container.style.left = x + "px";
		this.container.style.top = y + "px";
	}
	
	function increaseHeight(container, height, times){
		
		this.container = container;
		
		this.container.style.height = height*times +"px";
	}
	
	function calcNetCost(itemPrices){
				
		var netCost = 0;
		for(let i = 0; i < itemPrices.length; i++){
			netCost += itemPrices[i];
		}
		
		return netCost;
	}
	
	function calcCartAmount(supplierID){
		var cart = JSON.parse(sessionStorage.getItem("cart"));
		var totalAmount = 0;
		if(cart == null)
			return 0;
		cart.forEach(function(supplier){
			if(supplier.supplierID === supplierID){
				isSupplierPresent = true;
				totalAmount = supplier.totalAmount;
			}
		})
		return totalAmount;	
	}
	
	function calcCartCost(supplierID){
		var cart = JSON.parse(sessionStorage.getItem("cart"));
		var totalCost = 0;
		if(cart == null)
			return 0;
		cart.forEach(function(supplier){
			if(supplier.supplierID === supplierID){
				isSupplierPresent = true;
				totalCost = supplier.totalCost;
			}
		})
		return totalCost;	
	}
	
	function addToCart(itemID, itemName, supplierID, supplierName, amount, price){
		var cart = JSON.parse(sessionStorage.getItem("cart"));
		var isSupplierPresent = false;
		var isItemPresent = false;
		var cost = amount*price;
		var shipmentCost = 0;
		if(cart == null){
			makeCall("GET", "GetShipmentCost?supplierID=" + supplierID + "&amount=" + amount + "&cost=" + cost, null,
	        		function(req) {
	          			if (req.readyState == XMLHttpRequest.DONE) {
							switch(req.status){
								case 200:
									shipmentCost = req.responseText;
									let cart = [{
										"supplierID": supplierID,
										"supplierName": supplierName,
										"items": [{
											"itemID": itemID,
											"itemName": itemName,
											"amount": amount,
											"price": price
										}],
										"totalAmount": amount,
										"totalCost": cost,
										"shipmentCost": shipmentCost
									}]
									sessionStorage.setItem("cart", JSON.stringify(cart));
									cartList.update(cart);	
									showCart();
									break;
								case 400:
                					alert("Wrong parameters, please try again");
                					break;
              					case 500:
            						alert("ERROR! Can't connect to Database ! Retry later");
                					break;
							}
			  			}
	   				});
		}
		else{
			cart.forEach(function(supplier){
				if(supplier.supplierID === supplierID){
					var itemArray = supplier.items;
					itemArray.forEach(function(item){
						if(item.itemID === itemID){
							item.amount += amount;
							isItemPresent = true;
						}
					})
					if(!isItemPresent){
						let newItem = {
							"itemID": itemID,
							"itemName": itemName,
							"amount": amount,
							"price": price
						}
						itemArray.unshift(newItem);
					}
					isSupplierPresent = true;
					supplier.totalAmount += amount;
					supplier.totalCost += cost;
					makeCall("GET", "GetShipmentCost?supplierID=" + supplierID + "&amount=" + supplier.totalAmount + "&cost=" + supplier.totalCost, null,
		        		function(req) {
		          			if (req.readyState == XMLHttpRequest.DONE) {
		            			switch(req.status){
									case 200:
										shipmentCost = req.responseText;
										supplier.shipmentCost = shipmentCost;
										sessionStorage.setItem("cart", JSON.stringify(cart));
										cartList.update(cart);	
										showCart();
										break;
									case 400:
	                					alert("Wrong parameters, please try again");
	                					break;
	              					case 500:
	            						alert("ERROR! Can't connect to Database ! Retry later");
	                					break;
								}
				  			}
		   				});
				}
			})
			if(!isSupplierPresent){
				makeCall("GET", "GetShipmentCost?supplierID=" + supplierID + "&amount=" + amount + "&cost=" + cost, null,
		        		function(req) {
		          			if (req.readyState == XMLHttpRequest.DONE) {
		            			switch(req.status){
									case 200:
										shipmentCost = req.responseText;
										let newSupplier = {
											"supplierID": supplierID,
											"supplierName": supplierName,
											"items": [{
												"itemID": itemID,
												"itemName": itemName,
												"amount": amount,
												"price": price
											}],
											"totalAmount": amount,
											"totalCost": cost,
											"shipmentCost": shipmentCost
										}
										cart.unshift(newSupplier);
										sessionStorage.setItem("cart", JSON.stringify(cart));
										cartList.update(cart);	
										showCart();
										break;
									case 400:
	                					alert("Wrong parameters, please try again");
	                					break;
	              					case 500:
	            						alert("ERROR! Can't connect to Database ! Retry later");
	                					break;
								}
				  			}
		   				});
			}
		}
	}
	
	function createOrder(supplierID){
		var cart = JSON.parse(sessionStorage.getItem("cart"));
		var user = JSON.parse(sessionStorage.getItem("user"));
		var userID = user.userID;
		var userAddress = user.address;
		var pos;
		for(let i = 0; i < cart.length; i++){
			var supplier = cart[i];
			if(supplier.supplierID === supplierID){
				makeCall("GET", "CreateNewOrder?userID=" + userID + "&supplierID=" + supplierID + "&items=" + encodeURIComponent(JSON.stringify(supplier.items)) + "&cost=" + supplier.totalCost + "&shipmentCost=" + supplier.shipmentCost + "&address=" + userAddress, null,
		        		function(req) {
		          			if (req.readyState == XMLHttpRequest.DONE) {
								switch(req.status){
									case 200:
										orderList.updateOrders();	
										orders = 1;
										showOrders();
										cartList.update(cart);
										sessionStorage.setItem("cart", JSON.stringify(cart));
										break;
									case 400:
                						alert("Wrong parameters, please try again");
                						break;
              						case 500:
            							alert("ERROR! Can't connect to Database ! Retry later");
                						break;
								}
				  			}
		   				});
				pos = i;		
			}
		}
		cart.splice(pos, 1);
	}
	
	function showHome(){
		makeVisibleOrInvisible(document.getElementById("welcomeMessage"), true);
		makeVisibleOrInvisible(document.getElementById("shortcutMenu"), true);
		move(document.getElementById("shortcutMenu"), 10, 100);
		makeVisibleOrInvisible(document.getElementById("keywordField"), true);
		move(document.getElementById("keywordField"), 10, 160);
		makeVisibleOrInvisible(document.getElementById("itemsMessage"), true);
		makeVisibleOrInvisible(document.getElementById("visualizedItemsTable"), true);
		makeVisibleOrInvisible(document.getElementById("resultMessage"), false);
		makeVisibleOrInvisible(document.getElementById("resultsField"), false);
		makeVisibleOrInvisible(document.getElementById("visualizedItemField"), false);
		makeVisibleOrInvisible(document.getElementById("cartMessage"), false);
		makeVisibleOrInvisible(document.getElementById("cartField"), false);
		makeVisibleOrInvisible(document.getElementById("ordersMessage"), false);
		makeVisibleOrInvisible(document.getElementById("ordersField"), false);
	}
	
	function showSearchedItems(keyword, itemsList){
		
		  searchedItemList = new SearchedItemsList(document.getElementById("keyword"), document.getElementById("n_results"), document.getElementById("searchedItemsTable"), document.getElementById("searchedItemsBody"));
						
		  searchedItemList.update(keyword, itemsList);				
		  makeVisibleOrInvisible(document.getElementById("welcomeMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("shortcutMenu"), true);
		  move(document.getElementById("shortcutMenu"), 10, 50);
		  makeVisibleOrInvisible(document.getElementById("keywordField"), true);
		  move(document.getElementById("keywordField"), 10, 105);
		  makeVisibleOrInvisible(document.getElementById("itemsMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemsTable"), false);
		  makeVisibleOrInvisible(document.getElementById("resultMessage"), true);
          if(itemsList.length > 0)
		  	makeVisibleOrInvisible(document.getElementById("resultsField"), true);
		  else
		  	makeVisibleOrInvisible(document.getElementById("resultsField"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemField"), false)
		  makeVisibleOrInvisible(document.getElementById("cartMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("cartField"), false);
		  makeVisibleOrInvisible(document.getElementById("ordersMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("ordersField"), false);
	}
	
	function showItemInfo(itemID){
		 itemInfo = new ItemInfoAndSuppliersList(document.getElementById("visualizedItemField"), document.getElementById("visualizedItemBody"), document.getElementById("visualizedSuppliersBody"), document.getElementById("visualizedSpendingRangeBody"), document.getElementById("visualizedCartBody"), document.getElementById("orderBody"));
		 itemInfo.show(itemID)
	}
		
	function showCart(){
		  makeVisibleOrInvisible(document.getElementById("welcomeMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("shortcutMenu"), true);
		  move(document.getElementById("shortcutMenu"), 10, 50);
		  makeVisibleOrInvisible(document.getElementById("keywordField"), false);
		  makeVisibleOrInvisible(document.getElementById("itemsMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemsTable"), false);
		  makeVisibleOrInvisible(document.getElementById("resultMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("resultsField"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemField"), false);
		  makeVisibleOrInvisible(document.getElementById("ordersMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("ordersField"), false);
		  var cart = sessionStorage.getItem("cart");
		  if(cart != null && JSON.parse(cart).length > 0){
			  document.getElementById("cartMessage").textContent = "This is your cart";
			  makeVisibleOrInvisible(document.getElementById("cartMessage"), true);
			  makeVisibleOrInvisible(document.getElementById("cartField"), true);
		  }
	      else{
			  document.getElementById("cartMessage").textContent = "Your cart is empty";
			  makeVisibleOrInvisible(document.getElementById("cartMessage"), true);
			  makeVisibleOrInvisible(document.getElementById("cartField"), false);
		  }
	}
	
	function showOrders(){
		  makeVisibleOrInvisible(document.getElementById("welcomeMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("shortcutMenu"), true);
		  move(document.getElementById("shortcutMenu"), 10, 50);
		  makeVisibleOrInvisible(document.getElementById("keywordField"), false);
		  makeVisibleOrInvisible(document.getElementById("itemsMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemsTable"), false);
		  makeVisibleOrInvisible(document.getElementById("resultMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("resultsField"), false);
		  makeVisibleOrInvisible(document.getElementById("visualizedItemField"), false);
		  makeVisibleOrInvisible(document.getElementById("cartMessage"), false);
		  makeVisibleOrInvisible(document.getElementById("cartField"), false);
		  if(orders.length == 0){
				document.getElementById("ordersMessage").textContent = "You haven't scheduled any orders yet";
				makeVisibleOrInvisible(document.getElementById("ordersMessage"), true);
		  		makeVisibleOrInvisible(document.getElementById("ordersField"), false);
		  }
		  else{
				document.getElementById("ordersMessage").textContent = "List of your orders";
				makeVisibleOrInvisible(document.getElementById("ordersMessage"), true);
		  		makeVisibleOrInvisible(document.getElementById("ordersField"), true);	
		}	
	}

	function PersonalMessage(name, nameContainerID) {
		
	    this.name = name;
	    nameContainerID.textContent = this.name;
	}

	function VisualizedItemsList(itemsContainerID, itemsContainerBodyID) {
		
		this.itemsContainerID = itemsContainerID;
		this.itemsContainerBodyID = itemsContainerBodyID;

	    this.reset = function() {
			var self = this;
			makeCall("GET", "GetCasualItems", null,
	        		function(req) {
	          			if (req.readyState == XMLHttpRequest.DONE) {
	            			if (req.status == 200) {
	              				visualizedItems = JSON.parse(req.responseText);
	              				sessionStorage.setItem('visualizedItems', JSON.stringify(visualizedItems));
						        self.update(visualizedItems);
	       						makeVisibleOrInvisible(self.itemsContainerID, true);
	          				}
							switch(req.status){
									case 200:
										visualizedItems = JSON.parse(req.responseText);
	              						sessionStorage.setItem('visualizedItems', JSON.stringify(visualizedItems));
						        		self.update(visualizedItems);
	       								makeVisibleOrInvisible(self.itemsContainerID, true);
										sessionStorage.setItem("cart", JSON.stringify(cart));
										break;
              						case 500:
            							alert("ERROR! Can't connect to Database ! Retry later");
                						break;
								}
			  			}
	        		});
	    }

	    this.update = function(arrayItems) {
	        var row, idCell, nameCell, priceCell;
	        var self = this;
	        this.itemsContainerBodyID.innerHTML = "";
	        arrayItems.forEach(function(item) {
		        row = document.createElement("tr");
				row.classList.add("cell");
		        idCell = document.createElement("td");
		        idCell.textContent = item.itemID;
				idCell.classList.add("cell");
		        row.appendChild(idCell);
		        nameCell = document.createElement("td");
		        nameCell.textContent = item.name;
				nameCell.classList.add("cell");
		        row.appendChild(nameCell);
		        priceCell = document.createElement("td");
		        priceCell.textContent = item.price + " €";
				priceCell.classList.add("cell");
		        row.appendChild(priceCell);
		        self.itemsContainerBodyID.appendChild(row);
	       });
	    }
	  }
	
	
	function SearchedItemsList(keywordID, n_resultID, itemsContainerID, itemsContainerBodyID) {
		
		this.keywordID = keywordID;
		this.n_resultID = n_resultID;
		this.itemsContainerID = itemsContainerID;
		this.itemsContainerBodyID = itemsContainerBodyID;
		
		this.update = function(keyword, arrayItems) {
	        var row, idCell, nameCell, priceCell;
	        var self = this;
	        this.itemsContainerBodyID.innerHTML = "";
			this.keywordID.textContent = keyword;
			if(arrayItems.length > 0)
				this.n_resultID.textContent = arrayItems.length;
			else
				this.n_resultID.textContent = "No ";	
	        arrayItems.forEach(function(item) {
		        row = document.createElement("tr");
				row.classList.add("cell");
		        idCell = document.createElement("td");
		        idCell.textContent = item.itemID;
				idCell.classList.add("cell");
		        row.appendChild(idCell);
		        nameCell = document.createElement("td");
		        nameCell.textContent = item.name;
				nameCell.classList.add("cell");
				nameCell.classList.add("clickable");
				nameCell.setAttribute("itemID", item.itemID);
				nameCell.addEventListener('click', () => {
					 addVisualizedItem(item);
					 showItemInfo(item.itemID);
				});
		        row.appendChild(nameCell);
		        priceCell = document.createElement("td");
		        priceCell.textContent = item.price;
				priceCell.classList.add("cell");
		        row.appendChild(priceCell);
		        self.itemsContainerBodyID.appendChild(row);
	       });
	   }
	}
	
	function ItemInfoAndSuppliersList(itemsFieldID, itemsContainerBodyID, suppliersContainerBodyID, spendingRangeContainerBodyID, cartContainerBodyID, orderContainerBodyID) {
		
		this.itemsFieldID = itemsFieldID;
		this.itemsContainerBodyID = itemsContainerBodyID;
		this.suppliersContainerBodyID = suppliersContainerBodyID;
		this.spendingRangeContainerBodyID = spendingRangeContainerBodyID;
		this.cartContainerBodyID = cartContainerBodyID;
		this.orderContainerBodyID = orderContainerBodyID;
		
		this.reset = function(){
			makeVisibleOrInvisible(self.itemsFieldID, false);
		}
		
		this.show = function(itemID) {
			var self = this;
			var itemList, supplierList, spendingRangeList;
			makeCall("GET", "GetItemInfo?itemID="+ itemID, null,
	        		function(req) {
	          			if (req.readyState == XMLHttpRequest.DONE) {
	            			if (req.status == 200) {
	              				itemList = JSON.parse(req.responseText);
								makeCall("GET", "GetSupplierInfo?itemID="+ itemID, null,
		        					function(req) {
		          						if (req.readyState == XMLHttpRequest.DONE) {
		            						if (req.status == 200) {
		              							supplierList = JSON.parse(req.responseText);
												makeCall("GET", "GetSpendingRangeInfo?itemID="+ itemID, null,
		        									function(req) {
	          											if (req.readyState == XMLHttpRequest.DONE) {
															switch(req.status){
																case 200:
		              												spendingRangeList = JSON.parse(req.responseText);
																	self.update(itemList, supplierList, spendingRangeList);
						 											makeVisibleOrInvisible(self.itemsFieldID, true);
																	break;
																case 400:
								                					alert("Wrong parameters, please try again");
								                					break;
								              					case 500:
								            						alert("ERROR! Can't connect to Database ! Retry later");
								                					break;
															}
			  											}
	        										});
	          								}
											else if(req.status == 400)
				                					alert("Wrong parameters, please try again");
				              				else if(req.status ==500)
				            						alert("ERROR! Can't connect to Database ! Retry later");
			  							}
	        						});
	          				}
							else if(req.status == 400)
                					alert("Wrong parameters, please try again");
              				else if(req.status ==500)
            						alert("ERROR! Can't connect to Database ! Retry later");
			  			}
	        		});
	    }
		
		this.update = function(itemList, supplierList, spendingRangeList){
			var itemRow, supplierRow, spendingRangeRow, cartRow, orderRow, itemIDCell, itemNameCell, itemDescriptionCell, itemCategoryCell, itemImageCell, itemPriceCell, supplierNameCell, supplierScoreCell, supplierThresholdCell, spendingRangeCell, spendingRangeCostCell, cartAmountCell, cartCostCell, orderCell;
			var self = this;
	        this.itemsContainerBodyID.innerHTML = "";
			for(let i = 0; i < itemList.length; i++){
				itemRow = document.createElement("tr");
				itemRow.classList.add("cell");
				if(i == 0){
					itemIDCell = document.createElement("td");
					itemIDCell.textContent = itemList[0].itemID;
					itemIDCell.classList.add("cell");
					itemIDCell.rowSpan = "0";
					itemRow.appendChild(itemIDCell);
					itemNameCell = document.createElement("td");
					itemNameCell.textContent = itemList[0].name;
					itemNameCell.classList.add("cell");
					itemNameCell.rowSpan = "0";
					itemRow.appendChild(itemNameCell);
					itemDescriptionCell = document.createElement("td");
					itemDescriptionCell.textContent = itemList[0].description;
					itemDescriptionCell.classList.add("cell");
					itemDescriptionCell.rowSpan = "0";
					itemRow.appendChild(itemDescriptionCell);
					itemCategoryCell = document.createElement("td");
					itemCategoryCell.textContent = itemList[0].category;
					itemCategoryCell.classList.add("cell");
					itemCategoryCell.rowSpan = "0";
					itemRow.appendChild(itemCategoryCell);
					itemImageCell = document.createElement("td");
					var itemImage = new Image(120);
					itemImage.src = itemList[0].image;
					itemImageCell.rowSpan = "0";
					itemImageCell.appendChild(itemImage);
					itemRow.appendChild(itemImageCell);
				}
				itemPriceCell = document.createElement("td");
				itemPriceCell.textContent = itemList[i].price + " €";
				itemPriceCell.classList.add("cell");
				itemRow.appendChild(itemPriceCell);
				increaseHeight(itemRow, 35.4, spendingRangeList[i].length);
		        self.itemsContainerBodyID.appendChild(itemRow);
			}
	        this.suppliersContainerBodyID.innerHTML = "";
			for(let i = 0; i < supplierList.length; i++){
				supplierRow = document.createElement("tr");
				supplierRow.classList.add("cell");
				supplierNameCell = document.createElement("td");
				supplierNameCell.textContent = supplierList[i].name;
				supplierNameCell.classList.add("cell");
				supplierRow.appendChild(supplierNameCell);
				supplierScoreCell = document.createElement("td");
				supplierScoreCell.textContent = supplierList[i].score + " / 5";
				supplierScoreCell.classList.add("cell");
				supplierRow.appendChild(supplierScoreCell);
				supplierThresholdCell = document.createElement("td");
				if(supplierList[i].threshold > 0)
					supplierThresholdCell.textContent = supplierList[i].threshold + " €";
				else	
					supplierThresholdCell.textContent = "-";
				supplierThresholdCell.classList.add("cell");
				supplierRow.appendChild(supplierThresholdCell);
				increaseHeight(supplierRow, 35.4, spendingRangeList[i].length);
				self.suppliersContainerBodyID.appendChild(supplierRow);	
			}
	        this.spendingRangeContainerBodyID.innerHTML = "";
			spendingRangeList.forEach(function(spendingRange){
				for(let i = 0; i < spendingRange.length; i++){
					spendingRangeRow = document.createElement("tr");
					spendingRangeRow.classList.add("cell");
					spendingRangeCell = document.createElement("td");
					if(i === spendingRange.length - 1)
						spendingRangeCell.textContent = "more than " + spendingRange[i].min;	
					else if(i === 0)
						spendingRangeCell.textContent = "up to " + (spendingRange[i+1].min-1);
					else	
						spendingRangeCell.textContent = spendingRange[i].min + " to " + spendingRange[i+1].min;
					spendingRangeCell.classList.add("cell");
					spendingRangeRow.appendChild(spendingRangeCell);
					spendingRangeCostCell = document.createElement("td");
					if(spendingRange[i].price > 0)
						spendingRangeCostCell.textContent = spendingRange[i].price + " €";
					else
						spendingRangeCostCell.textContent = "free";	
					spendingRangeCostCell.classList.add("cell");
					spendingRangeRow.appendChild(spendingRangeCostCell);
					self.spendingRangeContainerBodyID.appendChild(spendingRangeRow);
				}
			})
			this.cartContainerBodyID.innerHTML = "";
			for(let i = 0; i < supplierList.length; i++){
				cartRow = document.createElement("tr");
				cartRow.classList.add("cell");
				cartAmountCell = document.createElement("td");
				cartAmountCell.classList.add("cell");
				cartAmountCell.classList.add("clickable");
				cartCostCell = document.createElement("td");
				cartCostCell.classList.add("cell");
				var cartAmount = calcCartAmount(supplierList[i].supplierID);
				var cartCost = calcCartCost(supplierList[i].supplierID);
				cartAmountCell.textContent = cartAmount;
				cartAmountCell.addEventListener('mouseover', (e) => {
					cartItemsList = new CartDetailsList(document.getElementById("cartDetailsTable"), document.getElementById("cartDetailsBody"));
					var cart = JSON.parse(sessionStorage.getItem("cart"));
					cartItemsList.update(supplierList[i].supplierID, cart, e.clientX, e.clientY);
				});
				cartAmountCell.addEventListener('mouseout', () => makeVisibleOrInvisible(document.getElementById("cartDetailsTable"), false))
				cartRow.appendChild(cartAmountCell);
				if(cartCost == 0)
					cartCostCell.textContent = "-";
				else
					cartCostCell.textContent = cartCost + " €";
				cartRow.appendChild(cartCostCell);
				increaseHeight(cartRow, 35.4, spendingRangeList[i].length);
				self.cartContainerBodyID.appendChild(cartRow);	
			}
			this.orderContainerBodyID.innerHTML = "";
			for(let i = 0; i < supplierList.length; i++){
				orderRow = document.createElement("tr");
				orderRow.classList.add("cell");
				orderCell = document.createElement("td");
				orderCell.classList.add("cell");
				var amount = document.createElement("input");
				amount.type = "number";
				amount.min = 1;
				amount.max = 999;
				amount.name = "itemAmount";
				amount.required = true;
				orderCell.appendChild(amount);
				var cartButton = document.createElement("button");
				cartButton.name = "cartButton";
				cartButton.innerHTML = "PUT IN THE CART";
				cartButton.addEventListener('click', (e) => {
					var amount = document.querySelectorAll("input[type='number']")[i];
					if(amount.value <= 0)
						alert("Please select positive amount");
					else if(isNaN(amount.value))
						alert("Insert a positive number");	
					else{
					 	addToCart(itemList[0].itemID, itemList[0].name, supplierList[i].supplierID, supplierList[i].name, parseInt(amount.value, 10), itemList[i].price);
					}
				});
				orderCell.appendChild(cartButton);
				orderRow.appendChild(orderCell);
				increaseHeight(orderRow, 35.4, spendingRangeList[i].length);
				self.orderContainerBodyID.appendChild(orderRow);	
			}
		}	
	}
	
	function CartItemsList(cartItemsBodyID, cartSuppliersBodyID, cartCostsBodyID){
		
		this.cartItemsBodyID = cartItemsBodyID;
		this.cartSuppliersBodyID = cartSuppliersBodyID;
		this.cartCostsBodyID = cartCostsBodyID;
		
		this.update = function(cart){
			var itemRow, supplierRow, costRow, itemNameCell, itemAmountCell, itemPriceCell, supplierNameCell, netCostCell, shipmentCostCell, totalCostCell, orderCell;
			var self = this;
			this.cartItemsBodyID.innerHTML = "";
			cart.forEach(function(supplier){
				for(let i = 0; i < supplier.items.length; i++){
					itemRow = document.createElement("tr");
					itemRow.classList.add("cell");
					itemNameCell = document.createElement("td");
					itemNameCell.textContent = supplier.items[i].itemName;
					itemNameCell.classList.add("cell");
					itemRow.appendChild(itemNameCell);
					itemAmountCell = document.createElement("td");
					itemAmountCell.textContent = supplier.items[i].amount;
					itemAmountCell.classList.add("cell");
					itemRow.appendChild(itemAmountCell);
					itemPriceCell = document.createElement("td");
					itemPriceCell.textContent = supplier.items[i].price + " €";
					itemPriceCell.classList.add("cell");
					itemRow.appendChild(itemPriceCell);
					increaseHeight(itemRow, 38, 1);
					self.cartItemsBodyID.appendChild(itemRow);
				}
			})
			this.cartSuppliersBodyID.innerHTML = "";
			cart.forEach(function(supplier){
				supplierRow = document.createElement("tr");
				supplierRow.classList.add("cell");
				supplierNameCell = document.createElement("td");
				supplierNameCell.textContent = supplier.supplierName;
				supplierNameCell.classList.add("cell");
				supplierRow.appendChild(supplierNameCell);
				increaseHeight(supplierRow, 38, supplier.items.length);
				self.cartSuppliersBodyID.appendChild(supplierRow);
				
			})
			this.cartCostsBodyID.innerHTML = "";
			cart.forEach(function(supplier){
				costRow = document.createElement("tr");
				costRow.classList.add("cell");
				netCostCell = document.createElement("td");
				netCostCell.textContent = supplier.totalCost + " €";
				netCostCell.classList.add("cell");
				costRow.appendChild(netCostCell);
				shipmentCostCell = document.createElement("td");
				shipmentCostCell.textContent = supplier.shipmentCost + " €";
				shipmentCostCell.classList.add("cell");
				costRow.appendChild(shipmentCostCell);
				totalCostCell = document.createElement("td");
				totalCostCell.textContent = parseInt(supplier.totalCost) + parseInt(supplier.shipmentCost) + " €";
				totalCostCell.classList.add("cell");
				costRow.appendChild(totalCostCell);
				orderCell = document.createElement("td");
				orderCell.classList.add("cell");
				var orderButton = document.createElement("button");
				orderButton.name = "orderButton";
				orderButton.innerHTML = "ORDER";
				orderButton.addEventListener('click', (e) => {
					createOrder(supplier.supplierID);
				});
				orderCell.appendChild(orderButton);
				costRow.appendChild(orderCell);
				increaseHeight(costRow, 38, supplier.items.length);
				self.cartCostsBodyID.appendChild(costRow);
			})
		}
	}
	
	function CartDetailsList(cartDetailsTableID, cartDetailsBodyID){
		this.cartDetailsTableID = cartDetailsTableID;
		this.cartDetailsBodyID = cartDetailsBodyID;
		
		this.update = function(supplierID, cart, x, y){
			if(cart == null)
				return;					
			var itemRow, itemIDCell, itemNameCell, itemAmountCell, itemPriceCell;
			var self = this;
			this.cartDetailsBodyID.innerHTML = "";
			cart.forEach(function(supplier){
				var sefl = this;
				if(supplier.supplierID === supplierID){
					for(let i = 0; i < supplier.items.length; i++){
						itemRow = document.createElement("tr");
						itemRow.classList.add("cell");
						itemIDCell = document.createElement("td");
						itemIDCell.textContent = supplier.items[i].itemID;
						itemIDCell.classList.add("cell");
						itemRow.appendChild(itemIDCell);
						itemNameCell = document.createElement("td");
						itemNameCell.textContent = supplier.items[i].itemName;
						itemNameCell.classList.add("cell");
						itemRow.appendChild(itemNameCell);
						itemAmountCell = document.createElement("td");
						itemAmountCell.textContent = supplier.items[i].amount;
						itemAmountCell.classList.add("cell");
						itemRow.appendChild(itemAmountCell);
						itemPriceCell = document.createElement("td");
						itemPriceCell.textContent = supplier.items[i].price + " €";
						itemPriceCell.classList.add("cell");
						itemRow.appendChild(itemPriceCell);
						self.cartDetailsBodyID.appendChild(itemRow);
					}
					move(cartDetailsTableID, x, y);
					makeVisibleOrInvisible(cartDetailsTableID, true);
				}
			})
		}
	}

	function OrderList(userID, ordersBodyID, ordersItemBodyID, ordersSuppliersBodyID) {
		
		this.orderBodyID = ordersBodyID;
		this.ordersItemBodyID = ordersItemBodyID;
		this.ordersSuppliersBodyID = ordersSuppliersBodyID;
		
	    this.updateOrders = function() {
			var self = this;
			makeCall("GET", "GetOrders?userID="+userID, null,
	        	function(req) {
	          		if (req.readyState == XMLHttpRequest.DONE) {
	            			switch(req.status){
								case 200:
	              					orders = JSON.parse(req.responseText);
					        		self.update(orders);
									break;
								case 400:
                					alert("Wrong parameters, please try again");
                					break;
              					case 500:
            						alert("ERROR! Can't connect to Database ! Retry later");
                					break;
						}
			  		}
	        	});
	    }

	    this.update = function(orders) {
	        var orderRow, itemRow, supplierRow, orderIDCell, itemNameCell, itemAmountCell, supplierNameCell, netCostCell, shipmentCostCell, totalCostCell, dateCell, addressCell;
	        var self = this;
			if(orders.length > 0){
	        	self.orderBodyID.innerHTML = "";
	        	self.ordersItemBodyID.innerHTML = "";
	        	self.ordersSuppliersBodyID.innerHTML = "";
	        	orders.forEach(function(order) {
			        orderRow = document.createElement("tr");
					orderRow.classList.add("cell");
			        orderIDCell = document.createElement("td");
			        orderIDCell.textContent = order.orderID;
					orderIDCell.classList.add("cell");
			        orderRow.appendChild(orderIDCell);
					increaseHeight(orderRow,  35.4, order.itemIDs.length);
			        self.orderBodyID.appendChild(orderRow);
					for(let i = 0; i < order.itemIDs.length; i++){
				        itemRow = document.createElement("tr");
						itemRow.classList.add("cell");
				        itemNameCell = document.createElement("td");
				        itemNameCell.textContent = order.itemNames[i];
						itemNameCell.classList.add("cell");
				        itemRow.appendChild(itemNameCell);
				        itemAmountCell = document.createElement("td");
				        itemAmountCell.textContent = order.itemAmounts[i];
						itemAmountCell.classList.add("cell");
				        itemRow.appendChild(itemAmountCell);
				        self.ordersItemBodyID.appendChild(itemRow);
					}
					supplierRow = document.createElement("tr");
					supplierRow.classList.add("cell");
			        supplierNameCell = document.createElement("td");
			        supplierNameCell.textContent = order.supplierName;
					supplierNameCell.classList.add("cell");
			        supplierRow.appendChild(supplierNameCell);
			        netCostCell = document.createElement("td");
					netCostCell.textContent = calcNetCost(order.prices) + " €";
					netCostCell.classList.add("cell");
			        supplierRow.appendChild(netCostCell);
			        shipmentCostCell = document.createElement("td");
			        shipmentCostCell.textContent = order.shipmentCost + " €";
					shipmentCostCell.classList.add("cell");
			        supplierRow.appendChild(shipmentCostCell);
			        totalCostCell = document.createElement("td");
			        totalCostCell.textContent = calcNetCost(order.prices) +  order.shipmentCost + " €";
					totalCostCell.classList.add("cell");
			        supplierRow.appendChild(totalCostCell);
			        dateCell = document.createElement("td");
			        dateCell.textContent = order.date;
					dateCell.classList.add("cell");
			        supplierRow.appendChild(dateCell);
			        addressCell = document.createElement("td");
			        addressCell.textContent = order.userAddress;
					addressCell.classList.add("cell");
			        supplierRow.appendChild(addressCell);
					increaseHeight(supplierRow,  35.4, order.itemIDs.length);
			        self.ordersSuppliersBodyID.appendChild(supplierRow);
	       });
			}
	    }
	  }

	function PageOrchestrator() {
		
	    this.start = function() {
			var user = JSON.parse(sessionStorage.getItem("user"));
			var cart = localStorage.getItem("cart_"+user.userID);
			var lastVisualizedItems = localStorage.getItem("visualizedItems_"+user.userID);
			personalMessage = new PersonalMessage(user.name + " " + user.surname, document.getElementById("name"));
			visualizedItemsList = new VisualizedItemsList(document.getElementById("visualizedItemsTable"), document.getElementById("visualizedItemsBody"));
			if(lastVisualizedItems == null)
				visualizedItemsList.reset();
			else{
				visualizedItemsList.update(JSON.parse(lastVisualizedItems));
				sessionStorage.setItem("visualizedItems", lastVisualizedItems);
			}
			cartList = new CartItemsList(document.getElementById("cartItemsBody"), document.getElementById("cartSuppliersBody"), document.getElementById("cartCostsBody"));
			if(cart != null){
				cartList.update(JSON.parse(cart));	
				sessionStorage.setItem("cart", cart);
			}	
	    	orderList = new OrderList(user.userID, document.getElementById("ordersBody"), document.getElementById("orderItemsBody"), document.getElementById("orderSuppliersBody"));
		  	orderList.updateOrders();	
			showHome();
			document.getElementById("home").addEventListener("click", () => showHome());
			document.getElementById("cart").addEventListener("click", () => showCart());
			document.getElementById("orders").addEventListener("click", () => showOrders());		
		}
	}
}