const express = require("express");
const app = express();
const puppeteer = require('puppeteer');
const cloudflareProtectedDomain = 'URL-HERE'
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
let browser;
let cookies = [ { name: '__cfduid',
    value: '',
    domain: '',
    path: '/',
    expires: 1578864412.897863,
    size: 51,
    httpOnly: true,
    secure: true,
    session: false },
  { name: '',
    value: '',
    domain: '',
    path: '/',
    expires: 1576362412.897796,
    size: 69,
    httpOnly: true,
    secure: false,
    session: false } ];
    (async () => {
         browser = await puppeteer.launch({
         args: ['--no-sandbox']
         //headless: false
        });

      await browser.userAgent(userAgent)  //sets the browser userAgent to a normal browser Cloudflare cannot detect the bot

//your code may vary depending on how the endpoint handles requests
app.get("/api", function(request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    (async () => {
        const page = await browser.newPage();
        await page.setCookie.apply(page, cookies);

        await page.goto(cloudflareProtectedDomain + request.url); //this line of code may vary
        let result = await page.evaluate(() => {
            return (document.getElementsByTagName("body")[0].innerText)
        }); // stores the HTML of the request as text
        console.log(result)
        if(result.includes('DDoS')){
        //checks if cloudflare is actively protecting the site
        await page.waitFor(5050) //if it is, it will wait for a little bit over 5 seconds to trick cloudflare that its not a bot
        result = await page.evaluate(() => {
            return (document.getElementsByTagName("body")[0].innerText)
        console.log(result)
         //returns the response
        });
        }else{
          console.log('we got it already')
          //if cloudflare allows us with our previous verification (stored in a cookie)
          //we don't need to wait
        }
        let convert = JSON.parse(result)
        //console.log(convert)
        response.json(convert)
        cookies = await page.cookies()
        page.close()
    })();
  console.log(request.url)
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

})()
