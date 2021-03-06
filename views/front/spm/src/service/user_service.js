/**
 *@desc 提供用户数据处理接口
 *@auther yq
 *
 * @用户API
 * 1. removeFollows 用户移除粉丝  -call('err',info)
 * 2. getUserFollowsArray 获取用户的粉丝数组  -call('err','result')
 * 3. validateLoginState 检测用户是否登陆，如果登陆了执行回掉方法，否则提示登陆  -call(Function)
 * 4. userLikeActive 用户喜欢指定ID的活动
 * 5. cancelUserCollectActive 用户取消喜欢指定ID的活动
 * 6. userVoteWork 用户给指定作品投票
 * 7. getUserBaseInfo 获取用户的基本信息
 * 8. getUserJobCate 获取用户的职业分类
 * 9. getUserAttentionsArray 获取用户的关注用户数组
 * 10. validateLoginState 验证用户是否登录
 * 11. removeFollows  用户移除指定_id粉丝 -call(err)

 */





var md5 = require('md5');
angular.module('service.user_service',[]).service("user_service",["$http"
    ,function($http){
    		//获取所有数据，利用前台分页
            this.getAllCustomData = function(searchPojo){
                return $http.post('/back/cusGetAllData',{"searchPojo":searchPojo});
            };
            //提交数据
            this.saveCustomer = function(customer){
            	return $http.post('/back/cusSaveCustom',{"pojo":customer});
            };
            //用户提交邮箱注册接口
            this.subEmailRegist = function(pojo){
                return $http.post('/regist/emailRegist',{"pojo":pojo});
            };
            //用户提交手机注册接口
            this.subTelRegist = function(pojo){
                return $http.post('/regist/telRegist',{"pojo":pojo});
            };
            //用户提交登录信息
            this.subLoginInfo = function(pojo){
                return $http.post('/regist/doValiLogin',{"pojo":pojo});
            }

            /**
             * @desc 用户关注接口
             * @desc _id {String} 对方ID
             */
            this.attentionUser = function(_id){
                return $http.post('/front/attentionUser',{"_id":_id});
            };

            /**
             * @desc 用户取消关注接口
             * @desc _id {String} 对方ID
             */
            this.cencalAttentionUser = function(_id){
                return $http.post('/front/cancelUserAtten',{"_id":_id});
            };

            /**
             * @desc 获取用户关注状态
             * @desc _id {String} -对方ID
             * */
            this.getAttentionState = function(_id){
                return $http.post('/front/getAttentionState',{"_id":_id});
            };

            /**
             * @desc 获取作者状态
             * @param _id {String} -作者ID
             */
            this.getCustomById = function(_id){
                return $http.post('/front/getUserById',{"_id":_id});
            }

            /**
             * @desc 获取用户的登陆状态
             */
            this._user_login_state = 'init';
            this._session_user_cache = {};
            this.validateLoginState = function(callback){
                var _this = this;
                if(this._user_login_state === 'init') {
                    $http.post('/front/getLoginStatu')
                        .success(function (data) {
                            _this._user_login_state = data.result ? 'login' : 'noLogin';
                            _this._session_user_cache = data.result;
                            _this.validateLoginState(callback);
                        }).error(function (data) {
                            _this._user_login_state = false;
                        })
                }else if(_this._user_login_state === 'noLogin'){

                    layer.confirm('前往登录？', {
                        title:'提示',
                        btn: ['登录','取消'] //按钮
                    }, function(){
                        var index = layer.open({
                            title:'登录',
                            type:2,
                            content: '/regist/login',
                            maxmin: true
                        });
                        layer.full(index);
                    }, function(){

                    });

                }else if(_this._user_login_state === 'login'){
                    return callback(this._session_user_cache);
                }
            }

            /**
             * @desc 喜欢指定ID的活动
             * @param actId {String} 活动ID
             */
            this.userLikeActive = function(actId,callback){
                $http.post('/front/userLikeActive',{"_id":actId})
                    .success(function(data){
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->userLikeActive:链接出错");
                    })
            }

            /**
             * @desc 取消喜欢指定ID的活动
             * @param actId {String} 活动ID
             */
            this.cancelLikeActiveById = function(actId,callback){
                $http.post('/front/cancelLikeActiveById',{"_id":actId})
                    .success(function(data){
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->cancelLikeActiveById:链接出错");
                    })
            }

            /**
             * @desc 收藏指定ID的活动
             * @param actId {String} 活动ID
             */
            this.userCollectActive = function(actId,callback){
                $http.post('/front/userCollectActive',{"_id":actId})
                    .success(function(data){
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->userCollectActive:链接出错");
                    })
            }

            /**
             * @desc 取消收藏指定ID的活动
             * @param actId {String} 活动ID
             */
            this.cancelUserCollectActive = function(actId,callback){
                $http.post('/front/cancelUserCollectAct',{"_id":actId})
                    .success(function(data){
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->cancelUserCollectActive:链接出错");
                    })
            }

            /**
             * @desc 用户给指定作品投票
             * @param workId {String} 作品ID
             * */
             this.userVoteWork = function(worId,callback){
                 $http.post('/front/userVoteWork',{"_id":worId})
                     .success(function(data){
                         return callback(data.err,data.result);
                     }).error(function(data){
                         alert("user_service->cancelUserCollectActive:链接出错");
                     })
             }

            /**
             * @desc 获取用户所有的集合信息
             * @param cusId {String?} 用户ID 如果没有就获取服务器的session userId
             * @param callback
             */
            this.getUserAllCollect = function(cusId,callback){
                if(arguments.length === 1){
                    callback = cusId;
                    cusId = null;
                }
                $http.post('/front/getUserAllCollect',{"_id":cusId})
                    .success(function(data){
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getUserAllCollect:链接出错");
                    })
            }

            /**
             * @desc 获取用户信息
             * @param _id {String} 用户ID
             * */
            this.getUserBaseInfo = function(userId,callback){
                if(arguments.length === 1){
                    callback = userId;
                    userId = null;
                }
                $http.post('/front/getUsreBaseInfo',{"_id":userId})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getUserBaseInfo:链接出错");
                    })

            }

            /**
             * @desc 获取用户职业分类
             * */
             this.getUserJobCate = function(callback){
                 $http.post('/front/getUserJobCate',{})
                     .success(function(data){
                         data.err &&　console.log(data.err);
                         return callback(data.err,data.result);
                     }).error(function(data){
                         alert("user_service->getUserBaseInfo:链接出错");
                     })
             }

            /**
             * @desc 更新基本用户信息
             */
            this.updateUserInfo = function(user,callback){
                $http.post('/front/updateUserInfo',{updatePojo:user})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getUserBaseInfo:链接出错");
                    })
            }

            /**
             *@desc 更新用户邮箱或者手机号 或者密码 需要验证用户session
             */
            this.updateUserImportInfo = function(pojo,callback){
                $http.post('/front/upUserImportInfo',{updatePojo:pojo})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getUserBaseInfo:链接出错");
                    })
            }

            /***
             * @desc 发送邮箱验证码
             */
            this.sendEmailYzm = function(email,callback){
                $http.post('/front/sendEmailYzm',{email:email})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getUserBaseInfo:链接出错");
                    })
            }

            /**
             * @desc 用户重置密码
             * */
            this.userChangePassword = function(oldPassword,newPassword,callback){
                oldPassword = md5(oldPassword);
                newPassword = md5(newPassword);

                $http.post('/front/userChangePass',{oldPassword:oldPassword,newPassword:newPassword})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->sendEmailYzm:链接出错");
                    })

            }

            //获取用户的粉丝数组
            this.getUserFollowsArray = function(callback){
                $http.post('/front/getCenterFollows',{})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getCenterFollows:链接出错");
                    })
            }

            //获取用户的关注用户数组
            this.getUserAttentionsArray = function(callback){
                $http.post('/front/getUserAttentions',{})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->getCenterFollows:链接出错");
                    })
            }


            //用户移除指定_id粉丝
            this.removeFollows = function(_id,callback){
                $http.post('/front/removeFollows',{_id:_id})
                    .success(function(data){
                        data.err &&　console.log(data.err);
                        return callback(data.err,data.result);
                    }).error(function(data){
                        alert("user_service->removeFollows:链接出错");
                    })
            }

    }]);