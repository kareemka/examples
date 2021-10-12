var cookieParser = require('cookie-parser');
var express = require('express');
var app = express();
var PORT = 500;

app.use(cookieParser());

app.get('/', function (req, res) {
    req.signedCookies.title='GeeksforGeeks';
    console.log(req.signedCookies);
    if(req.cookies.type === "user"){
        console.log("true")
    }else {
        console.log("false")
    }


    res.send();
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
