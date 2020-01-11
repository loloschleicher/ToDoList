var express = require('express');
var app = express();
const mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/public'));
var mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
app.set('view engine', 'html' );
const passport = require('passport');

const auth = require("./auth");
auth(passport);
app.use(passport.initialize());

const dotenv = require('dotenv').config();

app.set('views', __dirname + '/views');


var task = [];

task.push({
    "task": "task1",
    "position": 0,
},
{
    "task": "task2",
    "position": 1,
},
{
    "task": "task3",
    "position": 2,
}); 

app.get('/', function(req, res){
    task.reverse();
    res.render('index.html', {data: task});
});

app.get('/api/tareas', function(req, res){
    let query = "SELECT tareaId, descripcion, orden FROM tareasdb.tareas ORDER BY orden ASC";
    db.query(query, (err, result) => {
        if(err){
            res.redirect('/error');
        }

        res.send(result);
    })
  
});

app.delete('/api/tareas/:tareaId', function(req, res){
    var idTarea = req.params.tareaId;
    let query = "DELETE FROM tareas WHERE TareaId="+idTarea;
    db.query(query, (err, result) => {
        if(err){
            res.redirect('/error');
        }

        res.send(result);
    })
  
});

app.get('/ajax', function(req, res){
    
    res.render("homeAjax.html");
});

app.get('/logingoogle', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/login/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {}
);


app.post('/api/tareas', function(req, res){
    var task = req.body;
    task.push(task);
});


app.post('/', function(req, res){

    if(req.body.action == "delete"){
        var position = 0;  
        task.splice(req.body.position,1);
        task.forEach(element => {
            element.position = position;
            position++
        });
        res.render('index.html', {data: task});
        
    }else if(req.body.action == "down"){
        var thisTask = task[req.body.position];
        task.splice(req.body.position,1);
        task.splice(parseInt(req.body.position)+1,0, thisTask);
        task[parseInt(req.body.position)].position = parseInt(req.body.position);
        task[parseInt(req.body.position)+1].position = parseInt(req.body.position)+1;  
        res.render('index.html', {data: task});
    }else if(req.body.action == "up"){
        var thisTask = task[parseInt(req.body.position)];
        task.splice(req.body.position,1);
        task.splice(parseInt(req.body.position)-1,0, thisTask);
        task[parseInt(req.body.position)].position = parseInt(req.body.position);
        task[parseInt(req.body.position)-1].position = parseInt(req.body.position)-1;  
        res.render('index.html', {data: task});
    }
    else{
        var flag = 0;
        if(task.length == 0){
            task.push({
                "task": req.body.action,
                "position": task.length
            });  
        }else{
            task.forEach(element => {
                if(req.body.action == element.task){
                    flag = 1;          
                }
                
            });
            if(flag == 0){
                task.push({
                    "task": req.body.action,
                    "position": task.length
                }); 
            } 
        }
        res.render('index.html', {data: task});
      
    }    
    
    
    
});




var port = Number(process.env.PORT || 3000);

app.listen(port, function(){
    console.log(port);
});