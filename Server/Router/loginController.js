const express = require("express");
const ejs = require('ejs');
const app = express();
app.use(express.json());
// //데이터베이스 
const models = require("../../models");
const sequelize = require("sequelize"); 
app.set('view engine', 'ejs');

//비밀번호 암호화 bcrypt 
const bcrypt = require("bcrypt");

//세션 
const session = require("express-session");



exports.mainView = function(req, res, next) {
    return res.render('./main/index');
};

exports.joinView = function(req, res, next) {
    return res.render('./join/join');
};

//아이디 중복 체크 
exports.idCheckAction = function(req, res, next) {
    var username = req.body.username;
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

// 회원 가입
exports.joinAction = async function(req, res, next) {
        try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = await models.tb_join.create({
            username: req.body.username,
            password: hash,
            email:req.body.str_email03,
            phone: req.body.phone,
        }).then(result => {
            return res.render('./main/index');
        }).catch(function(err){
            console.log(err)
        });

    }catch(err){
        console.log(err)
    }
    
};

// 로그인 

exports.loginAction = async function(req, res, next) {
    try {
    const newUser = await models.tb_join.findOne({
        where: {username: req.body.username}
    }).then(async result => {

        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            result.password
         );

            if(isPasswordCorrect){
                 req.session.username = result.username;
                 req.session.save(() => {
                    return res.redirect('/user/');
                })
                
            }else{
                return res.render('./main/index')
            }

        // return res.render('./main/index');
    }).catch(function(err){
        console.log(err)
    });

}catch(err){
    console.log(err)
}

};

// 회원 페이지 

exports.userMainView = async function(req, res, next) {
    try {

        const pageInfo = req.query;
    var pageNum = 1;
    var pageSize = 5;
    console.log("pageInfo",pageInfo);
    if(pageInfo.page != null){
         pageNum = parseInt(pageInfo.page);  
    }

    if(pageInfo.pageSize != null){
        if(pageInfo.page != null){
            pageSize = parseInt(pageInfo.pageSize);
    }
   }

    let offset = 0;
    if(pageNum > 1){
        offset = pageSize * (pageNum - 1);
      }
    var userData = await models.tb_join.findAll({
        offset: offset,
        limit: pageSize,
        order: [['idx', 'DESC']],
        raw:true
    });
    var cnt = await models.tb_join.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('idx')), 'cnt'],
            ],
            raw:true
        });
        
        if(req.session){
          return res.render('./user/userList', {
            username: req.session.username,
            data: userData,
            pageNum : pageNum,
            pageSize : pageSize,
            totalCnt : cnt[0].cnt
        });
    }else{
        //로그인 하고 오라고 할 것 
        return res.redirect("/login");
    }
   
}catch(err){
    console.log(err)
}

};



// 회원 상세페이지 

exports.userDetailView = async function(req, res, next) {
    try{
        models.tb_join.findOne({
            where: {idx: req.params.idx}
        }).then(function(result){
            return res.render('./user/userDetail',{data:result.dataValues});
        })

    }catch(err){
        console.log(err);
    }
};

exports.userDetailAction = async function(req, res, next) {
    try{
        models.tb_join.findOne({
            where: {idx: req.params.idx}
        }).then(function(result){
            console.log("reuslt",result);
            // return res.render('./user/userDetail',{data:result});
        })

    }catch(err){
        console.log(err);
    }
 
 };


//로그아웃 
exports.logoutAction = async function(req, res, next) {
    try {

        if(req.session){
            req.session.destroy(()=>{
                res.redirect('/');
            });
        }
   
}catch(err){
    console.log(err)
}

};