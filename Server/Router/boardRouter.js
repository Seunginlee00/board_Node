const express = require('express');
const controller = require("./boardController");
const router = express.Router();

//유효성 검사 
//https://goodmemory.tistory.com/136
const { body, param, validationResult } = require('express-validator');

const validationFunc = (req,res,next)=>{
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).json(error);
    next();
}

// 메인
router.get('/',controller.mainView);

//캡차 글쓰기
router.get('/pre-create',controller.preCreateView);
router.post('/pre-create',
function(req,res){
    controller.preCreateAction(req,res)
});


//글쓰기
router.get('/create',controller.createView);
router.post('/create',
function(req,res){
    controller.createAction(req,res)
});

// 상세 보기 
router.get('/details/:bbsNo',controller.detailsView);

//글수정
router.get('/modify/:bbsNo',controller.modfiyView);
router.post('/modify/:bbsNo', function(req,res){
    controller.modifyAction(req,res)
});

//글삭제
router.get('/delete/:bbsNo', function(req,res){
    controller.deleteAction(req,res)
});





module.exports = router;


