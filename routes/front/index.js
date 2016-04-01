var express = require('express');
var router = express.Router();
var then = require('thenjs');
var Product = require("../../models/Product");
var Article = require("../../models/Article");
var mongooseUtil = require("../../util/mongooseUtil");
var indexService = require("../../service/indexService");
var Customer = require("../../models/Custom");
var Active = require("../../models/Active");
var Work = require("../../models/Work");
var frontWare = require("./front_ware");
var ArticleComment = require("../../models/ArticleComment");
var activeService = require("../../service/activeService");
var _  = require("underscore");

//创品列表页面
router.get("/prolist",function(req,res){
	mongooseUtil.pagination({
		query:{status:true},
		limit:8,
		skip:0,
		sort:{"topno":-1},
		model:Product,
	},function(err,result){
		console.log(result);
		res.render('front/page/pro_list',{
			products:result.docs,
			total:result.total
		});
	})
});

//发现列表页面
router.get("/artlist",function(req,res){
	Article.find({
		status:3
	}).limit(12).sort({"_id":-1}).exec(function(err,docs){
		err && console.log(err);
		res.render('front/page/art_list',{articles:docs});
	})
});

//异步加载产品请求
router.post("/getProduct",function(req,res){
	mongooseUtil.pagination({
		query:req.body.query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:req.body.sort,
		model:Product,
	},function(err,result){
		!err ? res.json({result:result})
			 : res.json({err: err});
	})
});

//发现瀑布流页面后台接口
router.post('/getArticleList',function(req,res){
	var query = {status:3}
	mongooseUtil.pagination({
		query:query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:req.body.sort,
		model:Article,
	},function(err,result){
		!err ? res.json({result:result})
			: res.json({err: err});
	})
})

//发现列表页面
router.get("/toCusList",function(req,res){
	Customer.find({
		"cate1.cateId":1
	}).limit(8).sort({"topno":-1}).exec(function(err,docs){
		err && console.log(err);
		indexService.getCusAllInfoByCusArray(docs,function(err,docs){
			res.render('front/page/cus_list',{customers:docs});
		});
	})
});

//人物汇聚页面瀑布流接口
router.post('/getUserList',function(req,res){
	var query = req.body.query;
	query["cate1.cateId"] = 1;
	mongooseUtil.pagination({
		query:query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:{"topno":-1},
		model:Customer,
	},function(err,result){
		indexService.getCusAllInfoByCusArray(result,function(err,docs){
			!err ? res.json({result:docs})
				 : res.json({err: err});
		});
	})
})


//活动汇聚页
router.get("/toActiveList",function(req,res){
	Active.find({}).limit(3).sort({"creatTime":-1}).exec(function(err,docs){
		err && console.log(err);
		res.render('front/page/act_list',{actives:docs});
	})
});

//活动汇聚页接口
router.post('/getActiveList',function(req,res){
	var query = req.body.query;
	//query.usertype = 2;
	mongooseUtil.pagination({
		query:query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:{"creatTime":-1},
		model:Active,
	},function(err,result){
			!err ? res.json({result:result})
				: res.json({err: err});
	})
})

//文章详情页页面
router.get("/toArtDetail/:_id"
	,frontWare.increaPojoById(Article,"checkcounts")
	,frontWare.addRandomArt(Article,{"status":3},{"checkcounts":-1},4)
	,function(req,res){
	Article.getLink(req.params._id,function(err,doc){
		res.render('front/page/art_detail',{"article":doc});
	})
});

//文章详情页获取评论接口
router.post('/getArticleComments',function(req,res){
	var query = req.body.query;
	//query.usertype = 2;
	mongooseUtil.pagination({
		query:query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:{"creatTime":-1},
		model:ArticleComment,
	},function(err,result){
		!err ? res.json({result:result})
			: res.json({err: err});
	})
})

//提交文章评论
router.post('/pushArticleComment',function(req,res){
	var pushPojo = req.body.pushPojo;
	Article.addComment(pushPojo,function(err,pojo){
		res.json({"err":err,"result":pojo});
	});
})

//用户喜欢该篇文章
router.post('/increateArtilce',function(req,res){
	var _id = req.body._id;
	var userId = req.session.USER._id;
	mongooseUtil.pushInnerCollectionById(_id,Article,'praiseCounts',userId,function(err,info){
		res.json({"err":err,result:info});
	})
})

//用户取消喜欢该篇文章
router.post('/cancelLikeArt',function(req,res){
	var _id = req.body._id;
	var userId = req.session.USER._id;
	mongooseUtil.pullInnerCollectionById(_id,Article,'praiseCounts',userId,function(err,info){
		res.json({"err":err,result:info});
	})
})


//用户收藏该篇文章
router.post('/collecCurArticle',function(req,res){
	var _ariId = req.body._id;
	var userId = req.session.USER._id;
	Customer.addUserCollecArticle(userId,_ariId,function(err,info){
		res.json({"err":err,"result":'info'});
	})
})

//用户取消收藏该篇文章
router.post('/cancelcollecCurArt',function(req,res){
	var _ariId = req.body._id;
	var userId = req.session.USER._id;
	Customer.removeUserCollecArticle(userId,_ariId,function(err,info){
		res.json({"err":err,"result":'info'});
	})
})

//获取用户和作者之间的状态
router.post('/getAttentionState',function(req,res){
	var authorId = req.body._id;//作者ID
	var userId = req.session.USER._id;//用户ID

	Customer.findOne({"_id":authorId},function(err,doc){
		if(!doc)
			return res.json({"result":false});
		res.json({err:err,result:mongooseUtil.contains(doc.followers,userId)});
	})
})

//用户关注其它用户
router.post('/attentionUser',function(req,res){
	var authorId = req.body._id;//作者ID
	var userId = req.session.USER._id;//用户ID
	Customer.pushAttentions(userId,authorId,function(err,info){
		res.json({err:err,result:info});
	})
})

//用户关注其它用户
router.post('/cancelUserAtten',function(req,res){
	var authorId = req.body._id;//作者ID
	var userId = req.session.USER._id;//用户ID
	Customer.pullAttentions(userId,authorId,function(err,info){
		res.json({err:err,result:info});
	})
})


//通过ID获取用户信息
router.post('/getUserById',function(req,res){
	Customer.findOne({"_id":req.body._id},function(err,doc){
		res.json({err:err,result:doc});
	})
})


//回复用户的评论
router.post('/pushCommentReplay',function(req,res){
	var replay = req.body.pushPojo;
	var commentId = req.body.commentId;
	ArticleComment.pushReplay(commentId,replay,function(err,info){
		res.json({err:err,result:info});
	})
})

//文章详情页页面
router.get("/toActivetail/:_id"
	,frontWare.increaPojoById(Active,"checkcounts")
	,function(req,res){
		var _id = req.params._id;
		Active.findOne({"_id":_id},function(err,doc){
			err && console.log(err);
			console.log(doc,_id);
			res.render('front/page/active_detail',{'active':doc});
		});
});

//名人详情页
router.get("/toCusDetail/:_id"
	,frontWare.increaPojoById(Customer,"checkcounts")
	,function(req,res){
		var _id = req.params._id;
		Customer.findOne({"_id":_id},function(err,doc){
			err && console.log(err);
			var pojo = {"customer":doc};

			if(doc.cate1.cateId === 1)
				return res.render('front/page/cus_detail.ejs',pojo);

			if(doc.cate1.cateId === 2)
				return res.render('front/page/user_detail.ejs',pojo);
		});
	});

//创意人事详情页
router.get('/toArtCusDetail/:_id',function(req,res){
	res.render('front/page/art_cus_detail');
});


//前台获取文章
router.post('/getArticleById',function(req,res){
	var _id = req.body._id;
	Article.findOne({"_id":_id},function(err,doc){
		res.json({"err":err,"result":doc});
	})
})

//进入个人中心页面
router.get('/toUserCenter',function(req,res){
	if(!req.session.USER ||  !req.session.USER._id)
		return res.redirect("/");
	res.render('front/userpage/main');
})


//获取用户的登陆状态
router.post('/getLoginStatu',function(req,res){
	if(req.session.USER){
		return res.json({
			result:{
				_id:req.session.USER._id,
				name:req.session.USER.name,
			}
		});
	}else{
		res.json({result:null});
	}

})

//上传作品页面
router.get('/toUploadWork/:_id',function(req,res){
	if(!req.session.USER ||  !req.session.USER._id)
		return res.redirect("/");
	res.render('front/page/update_work',{activeId:req.params._id});
})

//活动提交报名信息页面
router.get('/toActiveSubForm/:_id',function(req,res){
	res.render('front/page/active_sub_form',{"_id":req.params._id});
});

//提交活动报名表单
router.post('/subActiveForm',function(req,res){
	var pojo = req.body.pushPojo;
	if(pojo){
		req.session.$USER_ACTIVE_FORM = pojo;
		return  res.json({result:"ok"});
	}else{
		return res.json({err:'数据对象为空'});
	}
});

//提交活动报名表单
router.post('/getActiveBaseById',function(req,res){
	var _id = req.body._id;
	Active.findOne({"_id":_id},function(err,doc){
		return res.json({"err":err,"result":doc});
	})
});

//提交活动报名表单
router.post('/subUserWork',function(req,res){
	var work = req.body.pushPojo;
	Active.pushWork(work.actId,work,function(err,doc){
		return res.json({err:err,result:doc});
	})
});

//获取当前活动中用户的作品
router.post('/getWorkByActId',function(req,res){
	var actId = req.body._id;
	var userId = req.session.USER._id;

	Work.findOne({userId:userId,actId:actId},function(err,doc){
		console.log(err,doc);
		return res.json({err:err,result:doc});
	})
});

//获取指定用户的作品
router.post('/getWorkByUserId',function(req,res){
	var userId = req.body._id;
	Work.find({userId:userId},function(err,docs){
		return res.json({err:err,result:docs});
	})
});


//获取指定活动的作品
router.post('/getCurActWorks',function(req,res){
	var actId = req.body._id;
	Work.find({actId:actId},function(err,docs){
		return res.json({err:err,result:docs});
	})
});


//获取作品集合
router.post('/getAllWorks',function(req,res){
	var query = req.body.query;
	//query.usertype = 2;
	mongooseUtil.pagination({
		query:query,
		limit:req.body.limit,
		skip:req.body.skip*req.body.limit,
		sort:{"creatTime":-1},
		model:Work,
	},function(err,result){
		activeService.getAllWorkInfo(result.docs,function(err,docs){
			return res.json({err:err,result:result});
		})
	})
})

//获得指定ID的作品
router.post('/getWorkById',function(req,res){

	Work.findOne({"_id":req.body._id},function(err,doc){
		return res.json({err:err,result:doc});
	})

})

//用户喜欢活动
router.post('/userLikeActive',function(req,res){
	var actId = req.body._id;
	var cusId = req.session.USER._id;

	mongooseUtil.pushInnerCollectionById(actId,Active,'likes',cusId,function(err,info){
		return res.json({err:err,result:info});
	});
})

//用户取消喜欢活动
router.post('/cancelLikeActiveById',function(req,res){
	var actId = req.body._id;
	var cusId = req.session.USER._id;

	mongooseUtil.pullInnerCollectionById(actId,Active,'likes',cusId,function(err,info){
		return res.json({err:err,result:info});
	});
})

//用户收藏活动
router.post('/userCollectActive',function(req,res){
	var actId = req.body._id;
	var cusId = req.session.USER._id;

	Customer.pushActiveCollect(cusId,actId,function(err,info){
		return res.json({err:err,result:info});
	})
})

//用户取消收藏活动
router.post('/cancelUserCollectAct',function(req,res){
	var actId = req.body._id;
	var cusId = req.session.USER._id;

	Customer.pullActiveCollect(cusId,actId,function(err,info){
		return res.json({err:err,result:info});
	})
})

//用户像作品投票
router.post('/userVoteWork',function(req,res){
	var worId = req.body._id;
	var cusId = req.session.USER._id;

	Work.findOne({"_id":worId},function(err,doc){

		if(doc && !mongooseUtil.contains(doc.votes,cusId)){
			mongooseUtil.pushInnerCollectionById(worId,Work,'votes',cusId,function(err,info){
				return res.json({err:err,result:info});
			});
		}else{
			return res.json({err:'已经投过票了'});
		}
	})
})

//作品查看次数
router.post("/addWorkCheckCount/:_id"
	,frontWare.increaPojoById(Work,"checkcounts")
	,function(req,res){
		res.json({err:null});
});


//获取用户所有的收藏
router.post('/getUserAllCollect',function(req,res){
	var cusId = req.body._id || req.session.USER._id;
	Customer.findOne({"_id":cusId}).populate('collecArticles').populate('collectActives').exec(function(err,doc){
		return res.json({err:err,result:doc});
	})
});




module.exports = router;