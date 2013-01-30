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
   name = prompt("Enter your ClassZone username - or, if you do not have one, your last name.");
   if (name) mixpanel.identify(name);
   gLIP();
   mixpanel.people.increment("readerloads");
   console.log('identified');

   $("#toc").popover({
      animation: true,
      html: true,
      placement: "right",
   });
});

//Go to page
var cPage = 1;
function goToPg(where, type) {
   console.log($('#book')[0].contentWindow.location);
   mixpanel.people.increment("pagesviewed");
   if (where == "prev")
      cPage --;
   else if (where == "next")
      cPage ++;
   else
      cPage = where;

   mixpanel.track("goToPg",{"where": where, "name": name, "page": cPage, "type": type});

   $('.pagenum').val(cPage);

   $('#book')[0].src="http://www.classzone.com/cz/books/wh_survey05/secured/resources/applications/ebook/accessibility/patterns_survey/page_"+cPage+".pdf";
}

//Keyboard navigation
var leftKey = 37;
var rightKey = 39;

$(document).keydown(function(e){
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
         mixpanel.track("pageload", {"name": name, "ipaddr": ip.toString(), "screenheight":screen.height, "screenwidth":screen.width, "useragent": navigator.userAgent, "windowheight": $(window).height(), "windowwidth": $(window).width(), "browser": BrowserDetect.browser, "browsernum": BrowserDetect.version, "os": BrowserDetect.OS});
         mixpanel.people.set({
            "$last_login": new Date(),
            "$name": name,
            "$last_ua": navigator.userAgent,
            "$last_ip": ip.toString(),
            "$last_browser": BrowserDetect.browser,
            "$last_browser_num": BrowserDetect.version,
            "$last_screen_height":screen.height,
            "$last_screen_width":screen.width,
            "$last_window_height": $(window).height(),
            "$last_window_width": $(window).width(),
            "$last_os": BrowserDetect.OS,
            "$referrer": document.referrer
         });

      });
}

//Hammer integration
var hammer = new Hammer(document.getElementById("top"));
hammer.onswipe = function(ev) {
   if (ev.direction == "left") {
      goToPg("next",'swipe');
   }
   if (ev.direction == "right") {
      goToPg("prev",'swipe');
   }
};

/*
function showToC() {
   $("#toc").popover('show');
   $.ajax({
      url: "http://www.classzone.com/cz/books/wh_survey05/secured/resources/applications/ebook/accessibility/patterns_survey/toc.html?last=1",
      type: "get",
      dataType: 'jsonp',
      jsonp: "callback_jsonp"
      done: function(data, status, jqXHR) {
         alert(data);
      },
      complete: function(jqXHR, status) {
         console.log(status);
      },
      error: function(jqXHR, status, thrown) {
         console.log(status + " " + thrown);
      }
   });
}
*/
