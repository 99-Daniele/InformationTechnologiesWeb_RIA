(function() {
    document.getElementById("logout").addEventListener('click', (e) => {
				  
      makeCall("GET", 'Logout', null,
        function(x) {
          if (x.readyState == XMLHttpRequest.DONE) {
            if(x.status == 200) {
				var user = JSON.parse(sessionStorage.getItem("user"));
				var cart = sessionStorage.getItem("cart");
				if(cart != null)
				  	localStorage.setItem("cart_"+user.userID, cart);
				var visualizedItems = sessionStorage.getItem("visualizedItems");
				if(visualizedItems != null)
				  	localStorage.setItem("visualizedItems_"+user.userID, visualizedItems);
				sessionStorage.clear();
                window.location.href = "Login.html";
            }
          }
        }
      );
  });
})();