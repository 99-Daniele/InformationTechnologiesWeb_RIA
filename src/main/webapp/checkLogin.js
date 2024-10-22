(function() {
    document.getElementById("loginButton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'Login', e.target.closest("form"),
        function(x) {
          if (x.readyState == XMLHttpRequest.DONE) {
	        user = x.responseText;
            switch (x.status) {
              case 200:
            	sessionStorage.setItem('user', user);
                window.location.href = "Home.html";
                break;
              case 400:
                alert("Please insert email and password");
                break;
              case 401:
                alert("You have inserted incorrect email or password");
                break;
              case 500:
            	alert("ERROR! Can't connect to Database ! Retry later");
                break;
            }
          }
        }
      );
    } else {
    	 form.reportValidity();
    }
  });
})();