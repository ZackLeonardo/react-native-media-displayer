

export function isJson(obj){
var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
  return isjson;
};

export function json2Array(json){
 var arrayTmp = new Array();
 for (var item in json){
   arrayTmp.push(json[item]);
 }
 return arrayTmp;
};
