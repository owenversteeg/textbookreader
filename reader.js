//Globals
var jsessionID;
var userGUID;
var userRole;
var showingLogin = 1;
var cPage = 0;

//BrowserDetect functions
var BrowserDetect = {
   init: function () {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent)
      || this.searchVersion(navigator.appVersion)
      || "an unknown version";
      this.OS = this.searchString(this.dataOS) || "an unknown OS";
   },
   searchString: function (data) {
      for (var i=0;i<data.length;i++)  {
         var dataString = data[i].string;
         var dataProp = data[i].prop;
         this.versionSearchString = data[i].versionSearch || data[i].identity;
         if (dataString) {
            if (dataString.indexOf(data[i].subString) != -1)
               return data[i].identity;
         }
         else if (dataProp)
            return data[i].identity;
      }
   },
   searchVersion: function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index == -1) return;
      return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
   },
   dataBrowser: [
   {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
   },
   {  string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
   },
   {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
   },
   {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
   },
   {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
   },
   {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
   },
   {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
   },
   {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
   },
   {     // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
   },
   {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
   },
   {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
   },
   {     // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
   }
   ],
   dataOS : [
   {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
   },
   {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
   },
   {
      string: navigator.userAgent,
      subString: "iPhone",
      identity: "iPhone/iPod"
   },
   {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
   }
   ]

};
BrowserDetect.init();

//Onload
$(document).ready(function() {
   gLIP();
   mixpanel.people.increment("readerloads");
   console.log('identified');
   $("#book").css("height", $(window).height() - 64);
});

$(document).resize(function () {
	$("#book").css("height", $(window).height() - 64);
});

//http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function romanize (num) {
	if (!+num)
		return false;
	var	digits = String(+num).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
		       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
		       "","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	return Array(+digits.join("") + 1).join("M") + roman;
}

function deromanize (str) {
	var	str = str.toUpperCase(),
		validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/,
		token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g,
		key = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
		num = 0, m;
	if (!(str && validator.test(str)))
		return false;
	while (m = token.exec(str))
		num += key[m[0]];
	return num;
}

function pageToStr(page) {
	var preStart   = 0;
	var aboutStart = 37;
	var stratStart = 84;
	var bodyStart  = 118;
	var refStart   = 1224;

	if (typeof page !== "number") //Non-number values are disregarded
		return "C";

	if (page === 0) //Page 0 is the cover
		return "C";
	if (page > refStart) //Reference pages
		return "R" + (page - refStart);
	if (page > bodyStart) //Body pages
		return (page - bodyStart).toString();
	if (page > stratStart) //Strategies
		return "S" + (page - stratStart);
	if (page > aboutStart)
		return "A" + (page - aboutStart);
	if (page > preStart)
		return romanize(page - preStart).toLowerCase();
	return "C"; //At this point, the page is probably -1 or something. Just give them the cover.
}

function strToPage(str) {
	var cover = 0;
	var preStart   = 0;
	var aboutStart = 37;
	var stratStart = 84;
	var bodyStart  = 118;
	var refStart   = 1224;

	if (typeof str === "number") //Number values are body page numbers
		return str + bodyStart;
	if (typeof str !== "string") //Non-string values are disregarded
		return cover;

	if (str.length < 1) //Null checking
		return cover;
	if (parseInt(str) === 0) //Page 0 is the cover
		return cover;
	if (str.toLowerCase() === "cover")
		return cover;

	var prefix = str.substring(0, 1).toUpperCase();
	var stripped = parseInt(str.substring(1));
	if (prefix === "C")
		return cover;
	if (prefix === "R")
		return stripped + refStart;
	if (prefix === "S")
		return stripped + stratStart;
	if (prefix === "A")
		return stripped + aboutStart;
	if (prefix === "X" || prefix === "V" || prefix === "I")
		return deromanize(str) + preStart;

	return parseInt(str) + bodyStart; //At this point, it's a body page
}

function goToPg(where, type) {
   console.log($('#book')[0].contentWindow.location);
   mixpanel.people.increment("pagesviewed");
   if (where == "prev")
      cPage --;
   else if (where == "next")
      cPage ++;
   else
      cPage = where;

   if (cPage < 0)
	   cPage = 0;
   if (cPage > 1382)
   	cPage = 1382;


/*
 Page nos:
 Cover: page_cover
 About: A1-A47
 Strategies: S1-S34
 Body: 1-1106
 Reference: R1-R148
 */
 	var currentPage = pageToStr(cPage);

   mixpanel.track("goToPg", {"where": where, "name": name, "page": currentPage, "type": type});

   $('.pagenum').val(currentPage);

   $('#book')[0].src="getPage.php?page="+currentPage+"&jsessionid="+jsessionID+"&userrole="+userRole+"&userguid="+userGUID;
}

//Keyboard navigation
var leftKey = 37;
var rightKey = 39;

$(document).keydown(function(e){
   //Two cases we don't want arror-nav for
   if (showingLogin || $(".pagenum").is(":focus"))
      return true;
   if (e.keyCode == leftKey) {
      goToPg("prev", "key");
      return false;
   } else if (e.keyCode == rightKey) {
      goToPg("next", "key");
      return false;
   }
});

//Owen's analytics functions (left intact)
function gLIP() {
   $.getJSON("http://www.bigrectangle.com/scripts/getip.php",
      function(data){ ip=data.ip.toString();
         console.log(ip);
         mixpanel.track("pageload",
         {
                    "name": name,
                  "ipaddr": ip.toString(),
            "screenheight": screen.height,
             "screenwidth": screen.width,
               "useragent": navigator.userAgent,
            "windowheight": $(window).height(),
             "windowwidth": $(window).width(),
                 "browser": BrowserDetect.browser,
              "browsernum": BrowserDetect.version,
                      "os": BrowserDetect.OS
         });
         mixpanel.people.set({
                    "$last_login": new Date(),
                          "$name": name,
                       "$last_ua": navigator.userAgent,
                       "$last_ip": ip.toString(),
                  "$last_browser": BrowserDetect.browser,
              "$last_browser_num": BrowserDetect.version,
            "$last_screen_height": screen.height,
             "$last_screen_width": screen.width,
            "$last_window_height": $(window).height(),
             "$last_window_width": $(window).width(),
                       "$last_os": BrowserDetect.OS,
                      "$referrer": document.referrer
         });

      });
}

//Hammer integration
//Hammer is undefined!
// var hammer = new Hammer(document.getElementById("top"));
// hammer.onswipe = function(ev) {
//    if (ev.direction == "left") {
//       goToPg("next",'swipe');
//    }
//    if (ev.direction == "right") {
//       goToPg("prev",'swipe');
//    }
// };

var firstTOC = true, tocSubpage = false;
var tocArray, tocTable, tocContent, tocOverlay;
var rowTemplate = "<tr><td><a href=\"#\" onclick=\"tocSection({0});\">{1}</a></td></tr>";
var subRowTemplate = "<tr><td><a href=\"#\" onclick=\"hideToC(); goToPg(strToPage('{0}'), 'toc');\">{1}</a></td></tr>";

function showToC() {
	if (tocTable == null) {
		tocContent = $("<div class=\"tocscroll\">");
		tocTable = $("<table id=\"tocTable\" class=\"table table-striped table-bordered\">");
		tocTable.width("350");
		tocTable.append(
		   rowTemplate.format("", "Loading...")
		);
		tocContent.append(tocTable);
		$("#toc").popover({
			html: true,
			title: "Table of Contents",
			content: tocContent
		});
	}
	tocSubpage = false;
	if (firstTOC) {
	   $.getJSON("getTOC.php?jsessionid=" + jsessionID + "&userguid=" + userGUID + "&userrole=" + userRole,
	      function (data) {
	      	var err = data.error;
	      	if (err == 0) {
	      		tocArray = data;
	      		firstTOC = false;

	      		showToC();
	      	}
	      });
	} else {
		tocTable.empty();
		for (var i = 0; i < tocArray.pages; i ++) {
			tocTable.append(
			   rowTemplate.format(i, tocArray.titles[i])
			);
		};

		var popover = $(".popover:has(#tocTable)");
		var origwidth = popover.width();
		popover.css("z-index", 10000);
		popover.width(350);
		popover.offset({
			left: popover.offset().left - ((350 - origwidth) / 2)
		});
		$("#toc").popover("show");
	}
}

function hideToC() {
	$("#toc").popover("hide");
}

function tocSection(section) {
	tocSubpage = true;
	tocTable.empty();
	var subarray = tocArray.subpages[section];
	for (var i = 0; i < subarray.pages; i ++) {
		var text = subarray.titles[i];
		var start = text.indexOf("Page: ");
		var title = text.substr(0, start);
		var page = text.substr(start + "Page: ".length);
		tocTable.append(
		   subRowTemplate.format(page, title)
		);
	};
}

function setLoginState(state) {
   $("#loginsubmit").attr("disabled", (state == 0 ? null : "disabled"));
   $("#loginusername").attr("disabled", (state == 0 ? null : "disabled"));
   $("#loginpassword").attr("disabled", (state == 0 ? null : "disabled"));
   $("#loginsubmit").val(state == 0 ? "Log In" : "Logging in...");
}

function sendLogin() {
   if ($("#loginusername").val() == "" || $("#loginpassword").val() == "") {
      //TODO: Display an error
      alert("Please enter all fields!");
      return;
   }
   setLoginState(1);
   $.getJSON("getLogin.php?username=" + $("#loginusername").val() + "&password=" + $("#loginpassword").val(),
      function (data) {
         var err = data.error;
         var result = data.result;
         if (err != null || result == null) {
            //TODO: Display an error
            alert("Error on login!");
            console.log("Login error! Err: " + err + " result: " + result);
			   setLoginState(0);
            return;
         }
         //It worked...
         console.log("Result: " + result);
         if (result == null) {
            //TODO: Display an error
            alert("Invalid username or password!");
			   setLoginState(0);
         } else {
            //Set globals
            jsessionID = result.jsessionID;
            userGUID   = result.userGuid;
            userRole   = result.userRole;
            //Display success
            $("#loginsubmit").val("Logged In!");
            setTimeout("closeLogin();", 1000);
         }
      });
}

function closeLogin() {
   setTimeout("$(\".login\").css(\"display\", \"none\");", 1000);
   $(".login").css("opacity", 0);
   showingLogin = 0;
}

function openLogin() {
   $(".login").css("display", "initial");
   $(".login").css("opacity", 1);
   $(".loginuser").focus();
   showingLogin = 1;
}

//http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery/1038930#1038930
String.prototype.format = String.prototype.f = function() {
	var s = this,
	i = arguments.length;

	while (i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};
