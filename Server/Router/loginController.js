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

// node 메일..
const nodemailer = require("nodemailer");



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
            data = "T"; // 중복
        }else{
            data = "F"; // 미중복
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

//아이디 찾기
exports.idFindView = function(req, res, next) {
   res.render("./find/idFind");
};

exports.idFindAction = async function(req, res) {
  
        var email = req.body.email;
        console.log("email",email);
        var phoneNum = req.body.phoneNum;
        console.log("phoneNum",phoneNum);
        if(email == "" && phoneNum != null){
            // 휴대폰 선택시
            models.tb_join.findOne({
                where: {phone: phoneNum}
            }).then(function(result){

                if(result != null){
                    console.log("들어옴",result.username);
                    return res.render('./find/idFindPg',{
                        data:result.username,
                    });
                }else{
                    return res.render('./find/idFindPg',{
                        data:"null",
                    });
                }

            }).catch(function(err){
                console.log(err);
            });

        }else{


            //이메일 선택시 
            models.tb_join.findOne({
                where: {email: email}
            }).then(function(result){
                if(result != null){
                    console.log("들어옴",result.username);
                    return res.render('./find/idFindPg',{
                        data:result.username,
                    });
                }else{
                    return res.render('./find/idFindPg',{
                        data:"null",
                    });
                }
            }).catch(function(err){
                console.log(err);
            });

         }

        // return res.render('./find/idFindPg',{
        //     data:"null",
        // });

        
 };

// 비밀번호 찾기


  // 랜덤 생성
  function generateRandomPassword() {
    return Math.floor(Math.random() * 10 ** 8)
      .toString()
      .padStart("0", 8);
  }

  exports.pwFindView = async function(req, res) {
    res.render('./find/pwFind', {error:"기본값"});
  }

  
  exports.pwFindAction = async function(req, res) {

    const randomPassword = generateRandomPassword();
    let phoneNum = req.body.phoneNum;
    let email = req.body.email;

    // 계정 정보
    let transporter = nodemailer.createTransport({
        service: 'gmail',	//gmail service 사용
        port: 465,	//465 port를 통해 요청 전송
        secure: true,
        auth: {
            user: "seunginlee0713@gmail.com",
            pass: "hxby smcb xgxt dcya",
        },
        });

        let mailOptions = {
        from: "seunginlee0713@gmail.com", //보내는 사람 메일주소
        to: "", //받는 사람 메일주소
        subject: 'Password 찾기',
        html: "", // 메일내용
        };


    if(phoneNum != ""){
        //휴대폰 번호로 찾기 
        var num = models.tb_join.findOne({where: { phone: phoneNum },
        })
        .then(function(data){

            if(data != ""){
                // 입력한 번호로 가입된 계정이 있는 경우 

                // 1. 메일 전송

                mailOptions.to = data.email; // 이메일 변경 
                mailOptions.html = `<p>${data.email} 계정의 임시 비밀번호는 <strong>${randomPassword}<strong>입니다.</p>`
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                        return next(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                      return res.status(200).json({ success: true });
                    }
                  });


                // 2. 번호 비교를 위한 번호 리턴! 

                return res.render('./find/pwFindPg',{randomPassword : randomPassword,
                                                    username : data.username});

            }else{
                // 입력한 번호로 가입된 계정이 없는 경우 
                return res.status(200).json({ '넌 번호 틀림' : false });
            }

        })
        .catch(function(err){
            console.log(err);
        });

    }else{

        // 메일로 찾기 

console.log("email",email);

var num = models.tb_join.findOne({where: { email: email },
})
.then(function(data){

    console.log("data" , data);

            if(data == null){
                 // 입력한 번호로 가입된 계정이 없는 경우 
                return res.render('./find/pwFind', {error: '가입된 내역이 없습니다.'});
                

            }else{
               
              // 입력한 번호로 가입된 계정이 있는 경우 

                // 1. 메일 전송

                mailOptions.to = data.email; // 이메일 변경 
                mailOptions.html = `<p>${data.email} 계정의 임시 비밀번호는 <strong>${randomPassword}<strong>입니다.</p>`
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                    console.log(error);
                        return next(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ success: true });
                    }
                });


                // 2. 번호 비교를 위한 번호 리턴! 

                return res.render('./find/pwFindPg',{randomPassword : randomPassword,
                                                    username : data.username});
            }

        })
        .catch(function(err){
            console.log(err);
        });

    }

    
  };

// 비밀번호 변경 

  exports.pwNewView = async function(req, res) {
    res.render('./find/pwNewChange', {username:req.body.username});
  }

  exports.pwNewAction = async function(req, res) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    console.log("비밀번호 변경", req.body.username);
    console.log("비밀번호 변경", req.body.password); 
    models.tb_join.update({
        password:hash,
    },
        {where : {username : req.body.username}})
    .then(function(data){

        return res.render('./main/index');

    })
    .catch({

    });

  };

  // 남은거 
  // 이메일 적용  
  // 시간초 제한 

            // 이메일/휴대폰 번호 제한
  // 김꼬미 귀엽다
  
  
  // 로직좀 생각 해보자 
  // 일단 시간초 10분이고 그거 끝나면 > 번호 다시 보내기를 하고 싶어 
  // 일단 그럴려면 