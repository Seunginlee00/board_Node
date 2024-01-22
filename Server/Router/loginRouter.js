const express = require('express');
const controller = require("./loginController");
const router = express.Router();


const { body, header, query } = require("express-validator");
const { validateError } = require("../config/validationResult");

// 메인
router.get('/',controller.mainView);

//로그인

//회원가입
router.get('/join',controller.joinView);
router.post('/idCheck',controller.idCheckAction);
router.post('/join', controller.joinView);

module.exports = router;