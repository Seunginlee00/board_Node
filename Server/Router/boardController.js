const express = require("express");
const ejs = require('ejs');
const app = express();
// 파일 읽기
const fs = require('fs');
// 파일 업로드 
// 다중 업로드 https://wise-computing-life.tistory.com/168
const multer = require('multer'); // upload 모듈
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      var today = new Date();

      console.log("today",today);

      var dir = "public/uploads/" + today
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

        callback(null, dir);
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' +  file.originalname );
    },  
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  
const upload = multer({ storage: storage}).array("myfile");




// //데이터베이스 
const models = require("../../models");
const sequelize = require("sequelize"); 

// allows you to ejs view engine.
app.set('view engine', 'ejs');


// 메인
exports.mainView = async function(req, res, next) {

    //세션 확인 

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
    var bbsData = await models.Bbs.findAll({
        offset: offset,
        limit: pageSize,
        order: [['bbsCreateDate', 'DESC']],
        raw:true
    });
    var cnt = await models.Bbs.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('bbsNo')), 'cnt'],
            ],
            raw:true
        });
        
        var user = JSON.stringify(req.session.username)

        console.log("req.session.username",req.session.username);

        if(req.session){
          return res.render('./main/main', {
            username: req.session.username,
            data: bbsData,
            pageNum : pageNum,
            pageSize : pageSize,
            totalCnt : cnt[0].cnt
        });
        }else{
          return res.render('./main/main', {
            username: null,
            data: bbsData,
            pageNum : pageNum,
            pageSize : pageSize,
            totalCnt : cnt[0].cnt
        });
        }

    
};




//글쓰기
exports.preCreateView = function (req, res) {
        res.render("./create/create");
}

// 글쓰기 복사 > 캡챠 있는고 
exports.preCreateAction = async function (req, res) {
  // 켑챠 값이 true 인경우 아래 함수 호출 
  
      var VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify?";
  
      return fetch(VERIFY_URL + new URLSearchParams({
          secret: '6Lf9Q04pAAAAANHkfgLG9i_ChChggkueUN1e8iQc',
          response: req.body['g-recaptcha-response']}) , {
        method: "POST",
      })
      .then(response => response.json())
      .then(data => {
          console.log("data",data);
          if(data.success){
              models.Bbs.create({
                      bbsWriter : req.body.writer,
                      bbsTitle : req.body.title,
                      bbsContent : req.body.content,
                      bbsCreateDate : sequelize.fn('NOW'),
                      bbsModifyDate : sequelize.fn('NOW'),
                  }).then(function(result){
                      res.redirect('/main/');
                  }).catch(function(err){
                      console.log(err)
                  });
          }else{
              res.send("<script>alert('캡챠를 진행 해주세요.');  window.history.back(); </script>");
          }
  
      });
    }


exports.createView = function (req, res) {
      res.render("./create/test", {username: req.session.username});
}

exports.createAction = async function (req, res) {
  upload(req, res, (err) => {

    console.log("req.session.username",req.session.username);

        if(req.files.length != 0){
          var path = req.files[0].path.split('\\', 3);
          console.log("req.body.title",req.body.title);
          models.Bbs.create({
                  bbsWriter : req.session.username,
                  bbsTitle : req.body.title,
                  bbsContent : req.body.content,
                  bbsCreateDate : sequelize.fn('NOW'),
                  bbsModifyDate : sequelize.fn('NOW'),
              }).then(function(result){
                for(var i=0; i<req.files.length; i++){
                  console.log("req.files[i].originalname", req.files[i].originalname);
                  models.tb_file.create({
                    bbsNo: result.bbsNo,
                    fileName: req.files[i].filename,
                    originalFileName: req.files[i].originalname,
                    filePath: path[2],
                  }).catch(function(err){
                    console.log(err)
                   });   
                }
                return res.redirect('/main/');
               
          });
            }else{
              models.Bbs.create({
                bbsWriter : req.body.writer,
                bbsTitle : req.body.title,
                bbsContent : req.body.content,
                bbsCreateDate : sequelize.fn('NOW'),
                bbsModifyDate : sequelize.fn('NOW'),
            }).then(function(result){
              return res.redirect('/main/');
            }).catch(function(err){
              console.log(err);
          });
      }
  });
};

// 글 보기 
exports.detailsView = function (req, res) {
    const bbsNo = req.params.bbsNo;

    models.Bbs.findOne({
        where: {bbsNo: bbsNo}
      })
      .then(result => {

          models.tb_file.findAll({
            where: {bbsNo: bbsNo}
          }).then(fileInfo => {
            if(fileInfo != null){
              var filePath = [];
              fileInfo.forEach(function(tb_file) {
                var file = "/" + tb_file.dataValues.filePath + "/" + tb_file.dataValues.fileName;
                console.log("file",file);
                filePath.push(file);
                console.log("filepath", filePath);
             });

             return res.render("./details/details", {
                data: result,
                fileList: filePath,
              });
            }
            return res.render("./details/details", {
                data: result,
                fileList: null
              });
            
          })
      })
      .catch( err => {
        console.log(err);
      });
}



//글 수정
exports.modfiyView = function (req, res) {
    const bbsNo = req.params.bbsNo;

    models.Bbs.findOne({
        where: {bbsNo: bbsNo}
      })
      .then(result => {

        models.tb_file.findAll({
          where: {bbsNo: bbsNo}
        }).then(fileInfo => {
          if(fileInfo != null){
            var filePath = [];
              fileInfo.forEach(function(tb_file) {
                var file = "/" + tb_file.dataValues.filePath + "/" + tb_file.dataValues.fileName;
                console.log("file",file);
                filePath.push(file);
                console.log("filepath", filePath);
             });

             return res.render("./modify/modify", {
                data: result,
                fileList: filePath,
              });
          }
          return res.render("./modify/modify", {
              data: result,
              file: null
            });
          
        })
      })
      .catch( err => {
        console.log(err);
      });
}

exports.modifyAction = function (req, res) {
  const bbsNo = req.params.bbsNo;
  upload(req, res, (err) => {
    if(req.files.length != 0){
      var path = req.files[0].path.split('\\', 2);
    models.Bbs.update({
        bbsWriter : req.body.writer,
        bbsTitle : req.body.title,
        bbsContent : req.body.content,
        bbsModifyDate : sequelize.fn('NOW'),
    },{
        where: {bbsNo:bbsNo}
    }).then(function(result){

//삭제
      models.tb_file.destroy({where: {bbsNo:bbsNo}});
//다시 첨부터 입력
        for(var i=0; i<req.files.length; i++){
          console.log("req.files.length",req.files.length);
          models.tb_file.create({
            bbsNo: bbsNo,
            fileName: req.files[i].filename,
            filePath: path[1],
          }).catch(function(err){
            console.log(err)
          });   
        }
        return res.redirect('/main/');

    }).catch(function(err){
        console.log(err)
    });
  }else{

      models.Bbs.update({
        bbsWriter : req.body.writer,
        bbsTitle : req.body.title,
        bbsContent : req.body.content,
        bbsModifyDate : sequelize.fn('NOW'),
    },{
        where: {bbsNo:bbsNo}
    }).then(function(result){
        return res.redirect('/main/');
    }).catch(function(err){
        console.log(err)
    });

    }

  });
    

}

//글 삭제
exports.deleteAction = function (req, res) {
    const bbsNo = req.params.bbsNo;
    models.Bbs.destroy({
        where: {bbsNo:bbsNo}
    }).then(function(result){
        console.log("데이터 삭제 완료");
        res.redirect('/main/');
    }).catch(function(err){
        console.log(err)
    });
}