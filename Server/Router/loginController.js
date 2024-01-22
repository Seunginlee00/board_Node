const express = require("express");
const {body, validationResult} = require("express-validator");
const ejs = require('ejs');
const app = express();
app.use(express.json());
// //데이터베이스 
const models = require("../../models");
const sequelize = require("sequelize"); 
app.set('view engine', 'ejs');


exports.mainView = function(req, res, next) {
    return res.render('./main/index');
};

exports.joinView = function(req, res, next) {
    return res.render('./join/join');
};

exports.idCheckAction = function(req, res, next) {
    var username = req.body.username;
    console.log("username",username);
    models.tb_join.findOne({
        where: {username: username}
      }).then(result => {
        var data = 1;
        if(result != null){
            data = 1;
        }else{
            data = 0;
        }
        return res.send(JSON.stringify(data));
      })
    
};

exports.joinAction = function(req, res, next) {
    return res.render('./main/index');
};