/****************************************************************************************
 * @desc 用户表
 * @date 2016/2/25
 * @auther yq
 *
 * @api model层
 * 1.validateUser 验证用户，使用md5算法 ok
 *
 * @api pojo层
 * 1.saveUser - 保存用户，并配置加密算法(md5)ok  -call('err',保存后的user对象)
 *
 * @_api
 * crptoUserPassword 加密用户密码
 ****************************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    objectid = require('objectid');

var activeSchema = new Schema({
    title:String,//活动名称 *
    cate1:{},//类型
    introduce:String,//简介 *
    content:String,//内容 *
    bannerUrl:String,//banner图 *
    convertUrl:String,//封面图 *
    creatTime:{type:Date,default:Date.now},//创建时间 *
    status:Number,//0未开始 1进行中 2活动结束 *
    checkcounts:Number,//关注量 *
    likes:[Schema.Types.ObjectId],//喜欢
    votes:[Schema.Types.ObjectId],//投票
    collects:[Schema.Types.ObjectId],//报名
    actStartTime:Date,//活动开始结束时间
    actOverTime:Date,
    signStarTime:Date,//报名开始结束时间
    signOverTime:Date,
    address:String,//活动地址
    topno:{ type:Number,default:0},
    organize:String,//组织机构
    copyRight:String,//版权所有
    fileUrl:String,//活动附件
    attachment:{ //附件
        url:String,//下载路径
        name:String//文件名
    }
})

var  active = mongoose.model("actives", activeSchema);
module.exports = active;
