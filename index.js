// Imports
const express = require('express');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');

const rooms = require('./routes/rooms');
const show_page = require('./routes/show');
const register = require('./routes/register')
const login = require('./routes/login')
const chat_room = require('./routes/chat_room')
const get_chat_rooms = require('./routes/get_chat_rooms')
const page_a = require('./routes/page_a')
const userInfo = require('./routes/userInfo')


// end imports



const app = express()
const port = 3000

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cookieParser());
// app.use(flash());
// view page

app.use('/rooms' , rooms);
app.use('/show' , show_page);
app.use('/register' , register);
app.use('/login' , login);
app.use('/chat_room' , chat_room);
app.use('/get_chat_rooms' , get_chat_rooms);
app.use('/page_a' , page_a);
app.use('/userInfo' , userInfo);


// end view page
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.set('views', __dirname + '/views');
// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));


// Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    if(req.cookies.type) {
        res.render('index', {da: req.cookies.type})
    }else {
        res.render('login', { text: 'Login'})
    }

});



app.get('/about', (req, res) => {
    res.render('about', { text: 'About Page'})

});


//mysql connect
var mysql      = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'chat'
});







var server = app.listen(3000,function(){
    console.log('Your Server Is runing at http:/localhost:550');
});


const sio = socket(server);




sio.on('connection',function(visitor){

    console.log('we have a new visitor as id=>',visitor.id);
    visitor.on('message',function(data){
        sio.sockets.emit('new_msg',data);

    });


});







// POST /login gets urlencoded bodies
app.post('/ins', urlencodedParser, function (req, res) {




            connection.connect(function(err) {

                var username = req.body.name;
                connection.query("SELECT * FROM users WHERE username = ? ",username, function (error, result, fields) {



                    if (result.length === 0) {

                        var file = req.files.uploaded_image;

                        var img_name = file.name;

                        if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){

                            file.mv('public/img/'+file.name, function(err) {

                        var Data = {
                            username: req.body.name,
                            img: img_name

                        }

                        var query = connection.query('INSERT INTO users SET ?', Data, function (err, rows) {
                            if (!err) {
                                var hour = 3600000;

                                res.cookie(`type`, req.body.name, {
                                    maxAge: 360 * 24 * hour, // one year
                                    // expires works the same as the maxAge
                                    expires: new Date('01 12 2022'),
                                    secure: true,
                                    httpOnly: true,
                                    sameSite: 'lax'
                                });
                                res.cookie(`img_user`, img_name, {
                                    maxAge: 360 * 24 * hour, // one year
                                    // expires works the same as the maxAge
                                    expires: new Date('01 12 2022'),
                                    secure: true,
                                    httpOnly: true,
                                    sameSite: 'lax'
                                });

                                res.redirect('/')
                            }


                        });

                            });

                        };


                    } else {

                        // req.flash('messages','password is error');
                        // res.render('page_a', { messages: req.flash('messages') });

                        res.redirect('register');


                    }




                });
            });


















});









// POST /login gets urlencoded bodies
app.post('/log', urlencodedParser, function (req, res) {

    connection.connect(function(err) {
        var username = req.body.name;
        connection.query("SELECT * FROM users WHERE username = ? ",username, function (error, result, fields) {

            if (result.length > 0) {
                var hour = 3600000;
                res.cookie(`type`,req.body.name,{
                    maxAge: 360 * 24 * hour, // one year
                    // expires works the same as the maxAge
                    expires: new Date('01 12 2022'),
                    secure: true,
                    httpOnly: true,
                    sameSite: 'lax'
                });
                res.redirect('/');
            }else {
                res.redirect('/');
            }




        });

    });
});



app.post('/chat', urlencodedParser, function (req, res) {
    var hour = 3600000;

    res.cookie(`room_id`,req.body.id_room,{
        maxAge: 360 * 24 * hour, // one year
        // expires works the same as the maxAge
        expires: new Date('01 12 2022'),
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });


    res.render('chat_room', { data: req.body.name ,room_id : req.body.id_room,id_user :req.cookies.type , img_src : req.cookies.img_user} );

});





sio.on('connection', function(socket){

    socket.on('message',function(data2) {


        var chat = {
            id_room          : data2.room_id,
            id_users    : data2.username,
            msg          : data2.message

        };

        var query = connection.query('INSERT INTO chat_rooms SET ?', chat,      function(err,rows) {
            if (err)
                console.log("Error inserting : %s ",err );


        });


    });
});



