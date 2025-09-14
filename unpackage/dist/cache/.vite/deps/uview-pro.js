import {
  __publicField
} from "./chunk-TYRVL62N.js";

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/queryParams.ts
function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets") {
  const prefix = isPrefix ? "?" : "";
  const _result = [];
  if (!["indices", "brackets", "repeat", "comma"].includes(arrayFormat))
    arrayFormat = "brackets";
  for (const key in data) {
    const value = data[key];
    if (["", void 0, null].includes(value)) {
      continue;
    }
    if (Array.isArray(value)) {
      switch (arrayFormat) {
        case "indices":
          for (let i = 0; i < value.length; i++) {
            _result.push(`${key}[${i}]=${value[i]}`);
          }
          break;
        case "brackets":
          value.forEach((_value) => {
            _result.push(`${key}[]=${_value}`);
          });
          break;
        case "repeat":
          value.forEach((_value) => {
            _result.push(`${key}=${_value}`);
          });
          break;
        case "comma":
          let commaStr = "";
          value.forEach((_value) => {
            commaStr += (commaStr ? "," : "") + _value;
          });
          _result.push(`${key}=${commaStr}`);
          break;
        default:
          value.forEach((_value) => {
            _result.push(`${key}[]=${_value}`);
          });
      }
    } else {
      _result.push(`${key}=${value}`);
    }
  }
  return _result.length ? prefix + _result.join("&") : "";
}
var queryParams_default = queryParams;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/route.ts
var Router = class {
  // route: (options?: string | RouterConfig, params?: Record<string, any>) => Promise<void>;
  constructor() {
    __publicField(this, "config");
    this.config = {
      type: "navigateTo",
      url: "",
      delta: 1,
      // navigateBack页面后退时,回退的层数
      params: {},
      // 传递的参数
      animationType: "pop-in",
      // 窗口动画,只在APP有效
      animationDuration: 300,
      // 窗口动画持续时间,单位毫秒,只在APP有效
      intercept: false
      // 是否需要拦截
    };
    this.route = this.route.bind(this);
  }
  // 判断url前面是否有"/"，如果没有则加上，否则无法跳转
  addRootPath(url2) {
    return url2[0] === "/" ? url2 : `/${url2}`;
  }
  // 整合路由参数
  mixinParam(url2, params) {
    url2 = url2 && this.addRootPath(url2);
    let query = "";
    if (/.*\/.*\?.*=.*/.test(url2)) {
      query = uni.$u.queryParams(params, false);
      return url2 + "&" + query;
    } else {
      query = uni.$u.queryParams(params);
      return url2 + query;
    }
  }
  /**
   * 路由跳转主方法
   * @param options 跳转配置或url字符串
   * @param params 跳转参数
   */
  async route(options = {}, params = {}) {
    let mergeConfig = {};
    if (typeof options === "string") {
      mergeConfig.url = this.mixinParam(options, params);
      mergeConfig.type = "navigateTo";
    } else {
      mergeConfig = uni.$u.deepMerge(this.config, options);
      mergeConfig.url = this.mixinParam(options.url || "", options.params || {});
    }
    if (params.intercept) {
      this.config.intercept = params.intercept;
    }
    mergeConfig.params = params;
    mergeConfig = uni.$u.deepMerge(this.config, mergeConfig);
    if (uni.$u.routeIntercept && typeof uni.$u.routeIntercept === "function") {
      const isNext = await new Promise((resolve) => {
        uni.$u.routeIntercept(mergeConfig, resolve);
      });
      isNext && this.openPage(mergeConfig);
    } else {
      this.openPage(mergeConfig);
    }
  }
  // 执行路由跳转
  openPage(config2) {
    const { url: url2 = "", type = "", delta = 1, animationDuration = 300 } = config2;
    if (type == "navigateTo" || type == "to") {
      uni.navigateTo({ url: url2, animationDuration });
    }
    if (type == "redirectTo" || type == "redirect") {
      uni.redirectTo({ url: url2 });
    }
    if (type == "switchTab" || type == "tab") {
      uni.switchTab({ url: url2 });
    }
    if (type == "reLaunch" || type == "launch") {
      uni.reLaunch({ url: url2 });
    }
    if (type == "navigateBack" || type == "back") {
      uni.navigateBack({ delta });
    }
  }
};
var route_default = new Router().route;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/timeFormat.ts
if (!String.prototype.padStart) {
  String.prototype.padStart = function(maxLength, fillString = " ") {
    if (Object.prototype.toString.call(fillString) !== "[object String]")
      throw new TypeError("fillString must be String");
    let str = this;
    if (str.length >= maxLength)
      return String(str);
    let fillLength = maxLength - str.length, times = Math.ceil(fillLength / fillString.length);
    while (times >>= 1) {
      fillString += fillString;
      if (times === 1) {
        fillString += fillString;
      }
    }
    return fillString.slice(0, fillLength) + str;
  };
}
function timeFormat(dateTime = null, fmt = "yyyy-mm-dd") {
  if (!dateTime)
    dateTime = Number(/* @__PURE__ */ new Date());
  if (typeof dateTime === "number" || typeof dateTime === "string") {
    if (dateTime.toString().length == 10)
      dateTime = Number(dateTime) * 1e3;
  }
  const date2 = new Date(dateTime);
  let ret;
  const opt = {
    "y+": date2.getFullYear().toString(),
    // 年
    "m+": (date2.getMonth() + 1).toString(),
    // 月
    "d+": date2.getDate().toString(),
    // 日
    "h+": date2.getHours().toString(),
    // 时
    "M+": date2.getMinutes().toString(),
    // 分
    "s+": date2.getSeconds().toString()
    // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
    }
  }
  return fmt;
}
var timeFormat_default = timeFormat;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/timeFrom.ts
function timeFrom(dateTime = null, format = "yyyy-mm-dd") {
  if (!dateTime)
    dateTime = Number(/* @__PURE__ */ new Date());
  if (typeof dateTime === "number" || typeof dateTime === "string") {
    if (dateTime.toString().length == 10)
      dateTime = Number(dateTime) * 1e3;
  }
  const timestamp = +new Date(Number(dateTime));
  const timer2 = (Number(/* @__PURE__ */ new Date()) - timestamp) / 1e3;
  let tips = "";
  switch (true) {
    case timer2 < 300:
      tips = "刚刚";
      break;
    case (timer2 >= 300 && timer2 < 3600):
      tips = parseInt(String(timer2 / 60)) + "分钟前";
      break;
    case (timer2 >= 3600 && timer2 < 86400):
      tips = parseInt(String(timer2 / 3600)) + "小时前";
      break;
    case (timer2 >= 86400 && timer2 < 2592e3):
      tips = parseInt(String(timer2 / 86400)) + "天前";
      break;
    default:
      if (format === false) {
        if (timer2 >= 2592e3 && timer2 < 365 * 86400) {
          tips = parseInt(String(timer2 / (86400 * 30))) + "个月前";
        } else {
          tips = parseInt(String(timer2 / (86400 * 365))) + "年前";
        }
      } else {
        tips = timeFormat_default(timestamp, format);
      }
  }
  return tips;
}
var timeFrom_default = timeFrom;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/colorGradient.ts
function colorGradient(startColor = "rgb(0, 0, 0)", endColor = "rgb(255, 255, 255)", step = 10) {
  const startRGB = hexToRgb(startColor, false);
  const [startR, startG, startB] = startRGB;
  const endRGB = hexToRgb(endColor, false);
  const [endR, endG, endB] = endRGB;
  const sR = (endR - startR) / step;
  const sG = (endG - startG) / step;
  const sB = (endB - startB) / step;
  const colorArr = [];
  for (let i = 0; i < step; i++) {
    const hex = rgbToHex(`rgb(${Math.round(sR * i + startR)},${Math.round(sG * i + startG)},${Math.round(sB * i + startB)})`);
    colorArr.push(hex);
  }
  return colorArr;
}
function hexToRgb(sColor, str = true) {
  const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  sColor = sColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = "#";
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    const sColorChange = [parseInt("0x" + sColor.slice(1, 3)), parseInt("0x" + sColor.slice(3, 5)), parseInt("0x" + sColor.slice(5, 7))];
    if (!str) {
      return sColorChange;
    } else {
      return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
    }
  } else if (/^(rgb|RGB)/.test(sColor)) {
    const arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
    return arr.map((val) => Number(val));
  } else {
    return sColor;
  }
}
function rgbToHex(rgb) {
  const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (/^(rgb|RGB)/.test(rgb)) {
    const aColor = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
    let strHex = "#";
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16);
      hex = hex.length == 1 ? "0" + hex : hex;
      strHex += hex;
    }
    if (strHex.length !== 7) {
      strHex = rgb;
    }
    return strHex;
  } else if (reg.test(rgb)) {
    const aNum = rgb.replace(/#/, "").split("");
    if (aNum.length === 6) {
      return rgb;
    } else if (aNum.length === 3) {
      let numHex = "#";
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += aNum[i] + aNum[i];
      }
      return numHex;
    }
  } else {
    return rgb;
  }
  return rgb;
}
function colorToRgba(color2, alpha = 0.3) {
  color2 = rgbToHex(color2);
  const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  let sColor = color2.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = "#";
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    const sColorChange = [parseInt("0x" + sColor.slice(1, 3)), parseInt("0x" + sColor.slice(3, 5)), parseInt("0x" + sColor.slice(5, 7))];
    return `rgba(${sColorChange.join(",")},${alpha})`;
  } else {
    return sColor;
  }
}
var colorGradient_default = {
  colorGradient,
  hexToRgb,
  rgbToHex,
  colorToRgba
};

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/guid.ts
function guid(len = 32, firstU = true, radix) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  const uuid = [];
  const base = radix || chars.length;
  if (len) {
    for (let i = 0; i < len; i++)
      uuid[i] = chars[0 | Math.random() * base];
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
      }
    }
  }
  if (firstU) {
    uuid.shift();
    return "u" + uuid.join("");
  } else {
    return uuid.join("");
  }
}
var guid_default = guid;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/color.ts
var color = {
  primary: "#2979ff",
  primaryDark: "#2b85e4",
  primaryDisabled: "#a0cfff",
  primaryLight: "#ecf5ff",
  bgColor: "#f3f4f6",
  info: "#909399",
  infoDark: "#82848a",
  infoDisabled: "#c8c9cc",
  infoLight: "#f4f4f5",
  warning: "#ff9900",
  warningDark: "#f29100",
  warningDisabled: "#fcbd71",
  warningLight: "#fdf6ec",
  error: "#fa3534",
  errorDark: "#dd6161",
  errorDisabled: "#fab6b6",
  errorLight: "#fef0f0",
  success: "#19be6b",
  successDark: "#18b566",
  successDisabled: "#71d5a1",
  successLight: "#dbf1e1",
  mainColor: "#303133",
  contentColor: "#606266",
  tipsColor: "#909399",
  lightColor: "#c0c4cc",
  borderColor: "#e4e7ed"
};
var color_default = color;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/type2icon.ts
function type2icon(type = "success", fill = false) {
  if (!["primary", "info", "error", "warning", "success"].includes(type))
    type = "success";
  let iconName = "";
  switch (type) {
    case "primary":
      iconName = "info-circle";
      break;
    case "info":
      iconName = "info-circle";
      break;
    case "error":
      iconName = "close-circle";
      break;
    case "warning":
      iconName = "error-circle";
      break;
    case "success":
      iconName = "checkmark-circle";
      break;
    default:
      iconName = "checkmark-circle";
  }
  if (fill)
    iconName += "-fill";
  return iconName;
}
var type2icon_default = type2icon;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/randomArray.ts
function randomArray(array2 = []) {
  return array2.sort(() => Math.random() - 0.5);
}
var randomArray_default = randomArray;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/deepClone.ts
function deepClone(obj, cache = /* @__PURE__ */ new WeakMap()) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (cache.has(obj))
    return cache.get(obj);
  let clone;
  if (obj instanceof Date) {
    clone = new Date(obj.getTime());
  } else if (obj instanceof RegExp) {
    clone = new RegExp(obj);
  } else if (obj instanceof Map) {
    clone = new Map(Array.from(obj, ([key, value]) => [key, deepClone(value, cache)]));
  } else if (obj instanceof Set) {
    clone = new Set(Array.from(obj, (value) => deepClone(value, cache)));
  } else if (Array.isArray(obj)) {
    clone = obj.map((value) => deepClone(value, cache));
  } else if (Object.prototype.toString.call(obj) === "[object Object]") {
    clone = Object.create(Object.getPrototypeOf(obj));
    cache.set(obj, clone);
    for (const [key, value] of Object.entries(obj)) {
      clone[key] = deepClone(value, cache);
    }
  } else {
    clone = Object.assign({}, obj);
  }
  cache.set(obj, clone);
  return clone;
}
var deepClone_default = deepClone;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/deepMerge.ts
function deepMerge(target = {}, source = {}) {
  target = deepClone_default(target);
  if (typeof target !== "object" || target === null || typeof source !== "object" || source === null)
    return target;
  const merged = Array.isArray(target) ? target.slice() : Object.assign({}, target);
  for (const prop in source) {
    if (!Object.prototype.hasOwnProperty.call(source, prop))
      continue;
    const sourceValue = source[prop];
    const targetValue = merged[prop];
    if (sourceValue instanceof Date) {
      merged[prop] = new Date(sourceValue);
    } else if (sourceValue instanceof RegExp) {
      merged[prop] = new RegExp(sourceValue);
    } else if (sourceValue instanceof Map) {
      merged[prop] = new Map(sourceValue);
    } else if (sourceValue instanceof Set) {
      merged[prop] = new Set(sourceValue);
    } else if (typeof sourceValue === "object" && sourceValue !== null) {
      merged[prop] = deepMerge(targetValue, sourceValue);
    } else {
      merged[prop] = sourceValue;
    }
  }
  return merged;
}
var deepMerge_default = deepMerge;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/test.ts
function email(value) {
  return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(value);
}
function mobile(value) {
  return /^1[3-9]\d{9}$/.test(value);
}
function url(value) {
  return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/.test(value);
}
function date(value) {
  return !/Invalid|NaN/.test(new Date(value).toString());
}
function dateISO(value) {
  return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
}
function number(value) {
  return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value);
}
function digits(value) {
  return /^\d+$/.test(value);
}
function idCard(value) {
  return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(value);
}
function carNo(value) {
  const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
  const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
  if (value.length === 7) {
    return creg.test(value);
  } else if (value.length === 8) {
    return xreg.test(value);
  } else {
    return false;
  }
}
function amount(value) {
  return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
}
function chinese(value) {
  let reg = /^[\u4e00-\u9fa5]+$/gi;
  return reg.test(value);
}
function letter(value) {
  return /^[a-zA-Z]*$/.test(value);
}
function enOrNum(value) {
  let reg = /^[0-9a-zA-Z]*$/g;
  return reg.test(value);
}
function contains(value, param) {
  return value.indexOf(param) >= 0;
}
function range(value, param) {
  return value >= param[0] && value <= param[1];
}
function rangeLength(value, param) {
  return value.length >= param[0] && value.length <= param[1];
}
function landline(value) {
  let reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/;
  return reg.test(value);
}
function empty(value) {
  switch (typeof value) {
    case "undefined":
      return true;
    case "string":
      if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
        return true;
      break;
    case "boolean":
      if (!value)
        return true;
      break;
    case "number":
      if (0 === value || isNaN(value))
        return true;
      break;
    case "object":
      if (null === value || value.length === 0)
        return true;
      for (var i in value) {
        return false;
      }
      return true;
  }
  return false;
}
function jsonString(value) {
  if (typeof value == "string") {
    try {
      var obj = JSON.parse(value);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}
function array(value) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(value);
  } else {
    return Object.prototype.toString.call(value) === "[object Array]";
  }
}
function object(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function code(value, len = 6) {
  return new RegExp(`^\\d{${len}}$`).test(value);
}
var test_default = {
  email,
  mobile,
  url,
  date,
  dateISO,
  number,
  digits,
  idCard,
  carNo,
  amount,
  chinese,
  letter,
  enOrNum,
  contains,
  range,
  rangeLength,
  empty,
  isEmpty: empty,
  jsonString,
  landline,
  object,
  array,
  code
};

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/addUnit.ts
function addUnit(value = "auto", unit = "rpx") {
  const strValue = String(value);
  return test_default.number(strValue) ? `${strValue}${unit}` : strValue;
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/random.ts
function random(min, max) {
  if (min >= 0 && max > 0 && max >= min) {
    const gab = max - min + 1;
    return Math.floor(Math.random() * gab + min);
  } else {
    return 0;
  }
}
var random_default = random;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/trim.ts
function trim(str, pos = "both") {
  if (pos === "both") {
    return str.replace(/^\s+|\s+$/g, "");
  } else if (pos === "left") {
    return str.replace(/^\s*/, "");
  } else if (pos === "right") {
    return str.replace(/(\s*$)/g, "");
  } else if (pos === "all") {
    return str.replace(/\s+/g, "");
  } else {
    return str;
  }
}
var trim_default = trim;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/toast.ts
function toast(title, option = 1500) {
  uni.showToast({
    title,
    icon: typeof option === "string" ? option : typeof option === "object" ? option.icon || "none" : "none",
    duration: typeof option === "number" ? option : typeof option === "object" ? option.duration || "1500" : 1500
  });
}
var toast_default = toast;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/getParent.ts
function getParent(name, keys) {
  var _a;
  let parent2 = this.$parent;
  while (parent2) {
    if (((_a = parent2.$options) == null ? void 0 : _a.name) !== name) {
      parent2 = parent2.$parent;
    } else {
      const data = {};
      if (Array.isArray(keys)) {
        keys.forEach((val) => {
          data[val] = (parent2 == null ? void 0 : parent2[val]) ? parent2[val] : "";
        });
      } else {
        for (const i in keys) {
          if (Array.isArray(keys[i])) {
            if (keys[i].length) {
              data[i] = keys[i];
            } else {
              data[i] = parent2[i];
            }
          } else if (keys[i] && keys[i].constructor === Object) {
            if (Object.keys(keys[i]).length) {
              data[i] = keys[i];
            } else {
              data[i] = parent2[i];
            }
          } else {
            data[i] = keys[i] || keys[i] === false ? keys[i] : parent2[i];
          }
        }
      }
      return data;
    }
  }
  return {};
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/$parent.ts
import { getCurrentInstance } from "vue";
function $parent(componentName, _instance = null) {
  var _a;
  const instance = _instance || getCurrentInstance();
  let parent2 = instance && instance.parent;
  if (!componentName)
    return parent2;
  while (parent2) {
    const name = (_a = parent2.type) == null ? void 0 : _a.name;
    if (name === componentName) {
      return parent2;
    }
    parent2 = parent2.parent;
  }
  return null;
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/sys.ts
function os() {
  return uni.getSystemInfoSync().platform;
}
function sys() {
  return uni.getSystemInfoSync();
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/debounce.ts
var timeout = null;
function debounce(func, wait = 500, immediate = false) {
  if (timeout !== null)
    clearTimeout(timeout);
  if (immediate) {
    const callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    if (callNow)
      typeof func === "function" && func();
  } else {
    timeout = setTimeout(() => {
      typeof func === "function" && func();
    }, wait);
  }
}
var debounce_default = debounce;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/throttle.ts
var timer;
var flag;
function throttle(func, wait = 500, immediate = true) {
  if (immediate) {
    if (!flag) {
      flag = true;
      typeof func === "function" && func();
      timer = setTimeout(() => {
        flag = false;
      }, wait);
    }
  } else {
    if (!flag) {
      flag = true;
      timer = setTimeout(() => {
        flag = false;
        typeof func === "function" && func();
      }, wait);
    }
  }
}
var throttle_default = throttle;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/getRect.ts
import { getCurrentInstance as getCurrentInstance2 } from "vue";
function getRect_default(selector, _instance = null, all = false) {
  const instance = _instance || getCurrentInstance2();
  return new Promise((resolve) => {
    uni.createSelectorQuery().in(instance == null ? void 0 : instance.proxy)[all ? "selectAll" : "select"](selector).boundingClientRect((rect) => {
      if (all && Array.isArray(rect) && rect.length) {
        resolve(rect);
      }
      if (!all && rect) {
        resolve(rect);
      }
    }).exec();
  });
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/function/parent.ts
import { getCurrentInstance as getCurrentInstance3 } from "vue";
function parent(componentName, _instance = null) {
  var _a;
  const instance = _instance || getCurrentInstance3();
  let parent2 = instance && instance.parent;
  while (parent2) {
    const name = (_a = parent2.type) == null ? void 0 : _a.name;
    if (name === componentName) {
      return parent2;
    }
    parent2 = parent2.parent;
  }
  return null;
}
function parentData(componentName, _instance = null) {
  const instance = _instance || getCurrentInstance3();
  const findParent = parent(componentName, instance);
  return findParent ? findParent.exposed : null;
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/package.json
var version = "0.0.22";

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/config/config.ts
var config = {
  v: version,
  version,
  // 主题名称
  type: ["primary", "success", "info", "error", "warning"]
};
var config_default = config;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/config/zIndex.ts
var zIndex = {
  toast: 10090,
  noNetwork: 10080,
  // popup包含popup，actionsheet，keyboard，picker的值
  popup: 10075,
  mask: 10070,
  navbar: 980,
  topTips: 975,
  sticky: 970,
  indexListSticky: 965
};
var zIndex_default = zIndex;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/util/emitter.ts
import { getCurrentInstance as getCurrentInstance4 } from "vue";
function formatToCamelCase(str) {
  return str.replace(/-([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
}
function dispatch(instance, componentName, eventName, ...params) {
  var _a, _b;
  let parent2 = instance && instance.parent;
  while (parent2) {
    const name = (_a = parent2.type) == null ? void 0 : _a.name;
    if (name === componentName) {
      parent2.emit && parent2.emit(eventName, ...params);
      ((_b = parent2.exposed) == null ? void 0 : _b[formatToCamelCase(eventName)]) && parent2.exposed[formatToCamelCase(eventName)](...params);
      break;
    }
    parent2 = parent2.parent;
  }
}
function broadcast(instance, componentName, eventName, ...params) {
  var _a;
  if (!instance)
    return;
  const subTree = ((_a = instance.subTree) == null ? void 0 : _a.children) || [];
  const children = Array.isArray(subTree) ? subTree : [subTree];
  children.forEach((vnode) => {
    var _a2, _b;
    const child = vnode.component;
    if (child) {
      const name = (_a2 = child.type) == null ? void 0 : _a2.name;
      if (name === componentName) {
        child.emit && child.emit(eventName, ...params);
        ((_b = child.exposed) == null ? void 0 : _b[formatToCamelCase(eventName)]) && child.exposed[formatToCamelCase(eventName)](...params);
      } else {
        broadcast(child, componentName, eventName, ...params);
      }
    }
  });
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/util/mitt.ts
function mitt(all) {
  all = all || /* @__PURE__ */ new Map();
  return {
    /**
     * A Map of event names to registered handler functions.
     */
    all,
    /**
     * Register an event handler for the given type.
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
     * @param {Function} handler Function to call in response to given event
     * @memberOf mitt
     */
    on(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        handlers.push(handler);
      } else {
        all.set(type, [handler]);
      }
    },
    /**
     * Remove an event handler for the given type.
     * If `handler` is omitted, all handlers of the given type are removed.
     * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off(type, handler) {
      const handlers = all.get(type);
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        } else {
          all.set(type, []);
        }
      }
    },
    /**
     * Invoke all handlers for the given type.
     * If present, `'*'` handlers are invoked after type-matched handlers.
     *
     * Note: Manually firing '*' handlers is not supported.
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit(type, evt) {
      let handlers = all.get(type);
      if (handlers) {
        [...handlers].forEach((handler) => {
          handler(evt);
        });
      }
      handlers = all.get("*");
      if (handlers) {
        [...handlers].forEach((handler) => {
          handler(type, evt);
        });
      }
    },
    /**
     * Clear all
     */
    clear() {
      this.all.clear();
    }
  };
}

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/libs/request/index.ts
var Request = class {
  constructor() {
    __publicField(this, "config");
    __publicField(this, "interceptor");
    __publicField(this, "options");
    this.config = {
      baseUrl: "",
      // 请求的根域名
      header: {},
      // 默认的请求头
      method: "POST",
      // 请求方式
      dataType: "json",
      // 设置为json，返回后uni.request会对数据进行一次JSON.parse
      responseType: "text",
      // 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
      meta: {
        originalData: true,
        // 是否在拦截器中返回服务端的原始数据，见文档说明
        toast: false,
        // 是否在请求出错时，弹出toast
        loading: false
        // 是否显示加载中
      }
    };
    this.interceptor = {
      request: null,
      response: null
    };
  }
  /**
   * 设置全局默认配置
   * @param customConfig 自定义配置
   */
  setConfig(customConfig) {
    this.config = deepMerge_default(this.config, customConfig);
  }
  /**
   * 主要请求部分
   * @param options 请求参数
   */
  request(options) {
    const mergedMeta = {
      ...this.config.meta,
      ...options.meta || {}
    };
    options.meta = mergedMeta;
    if (this.interceptor.request && typeof this.interceptor.request === "function") {
      const interceptorRequest = this.interceptor.request(options);
      if (interceptorRequest === false) {
        return new Promise(() => {
        });
      }
      this.options = interceptorRequest;
    }
    options.dataType = options.dataType || this.config.dataType;
    options.responseType = options.responseType || this.config.responseType;
    options.url = options.url || "";
    options.params = options.params || {};
    options.header = Object.assign({}, this.config.header, options.header);
    options.method = options.method || this.config.method;
    if (!options.url)
      options.url = "";
    return new Promise((resolve, reject) => {
      options.complete = (response) => {
        const meta = options.meta || this.config.meta || {};
        const originalData = meta.originalData ?? false;
        response.config = options;
        if (originalData) {
          if (this.interceptor.response && typeof this.interceptor.response === "function") {
            const resInterceptors = this.interceptor.response(response);
            if (resInterceptors !== false) {
              resolve(resInterceptors);
            } else {
              reject(response);
            }
          } else {
            resolve(response);
          }
        } else {
          if (response.statusCode === 200) {
            if (this.interceptor.response && typeof this.interceptor.response === "function") {
              const resInterceptors = this.interceptor.response(response.data);
              if (resInterceptors !== false) {
                resolve(resInterceptors);
              } else {
                reject(response.data);
              }
            } else {
              resolve(response.data);
            }
          } else {
            reject(response);
          }
        }
      };
      options.url = options.url && options.url.indexOf("http") !== 0 ? this.config.baseUrl + (options.url.indexOf("/") === 0 ? options.url : `/${options.url}`) : options.url;
      uni.request(options);
    });
  }
  get(url2, data = {}, options = {}) {
    return this.request({
      method: "GET",
      url: url2,
      data,
      header: options.header,
      meta: options.meta
    });
  }
  post(url2, data = {}, options = {}) {
    return this.request({
      url: url2,
      method: "POST",
      data,
      header: options.header,
      meta: options.meta
    });
  }
  put(url2, data = {}, options = {}) {
    return this.request({
      url: url2,
      method: "PUT",
      data,
      header: options.header,
      meta: options.meta
    });
  }
  delete(url2, data = {}, options = {}) {
    return this.request({
      url: url2,
      method: "DELETE",
      data,
      header: options.header,
      meta: options.meta
    });
  }
};
var httpInstance = new Request();
var httpPlugin = {
  install(app, options = {}) {
    if (options.interceptor) {
      const { request, response } = options.interceptor;
      if (request)
        httpInstance.interceptor.request = request;
      if (response)
        httpInstance.interceptor.response = response;
    }
    if (options.requestConfig) {
      httpInstance.setConfig(options.requestConfig);
    }
    app.config.globalProperties.$http = httpInstance;
  }
};
var request_default = httpPlugin;

// C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/index.ts
var $u = {
  queryParams: queryParams_default,
  route: route_default,
  timeFormat: timeFormat_default,
  date: timeFormat_default,
  // 另名date
  timeFrom: timeFrom_default,
  colorGradient: colorGradient_default.colorGradient,
  colorToRgba: colorGradient_default.colorToRgba,
  guid: guid_default,
  color: color_default,
  sys,
  os,
  type2icon: type2icon_default,
  randomArray: randomArray_default,
  dispatch,
  broadcast,
  hexToRgb: colorGradient_default.hexToRgb,
  rgbToHex: colorGradient_default.rgbToHex,
  test: test_default,
  random: random_default,
  deepClone: deepClone_default,
  deepMerge: deepMerge_default,
  getParent,
  $parent,
  parent,
  parentData,
  addUnit,
  trim: trim_default,
  type: ["primary", "success", "error", "warning", "info"],
  http: httpInstance,
  toast: toast_default,
  config: config_default,
  // uView配置信息相关，比如版本号
  zIndex: zIndex_default,
  debounce: debounce_default,
  throttle: throttle_default,
  mitt: mitt(),
  getRect: getRect_default
};
var install = () => {
  uni.$u = $u;
};
var uview_pro_default = {
  install
};
var { colorGradient: colorGradient2, colorToRgba: colorToRgba2, hexToRgb: hexToRgb2, rgbToHex: rgbToHex2 } = colorGradient_default;
export {
  $parent,
  $u,
  Request,
  addUnit,
  broadcast,
  color_default as color,
  colorGradient2 as colorGradient,
  colorToRgba2 as colorToRgba,
  config_default as config,
  debounce_default as debounce,
  deepClone_default as deepClone,
  deepMerge_default as deepMerge,
  uview_pro_default as default,
  dispatch,
  getParent,
  getRect_default as getRect,
  guid_default as guid,
  hexToRgb2 as hexToRgb,
  httpInstance as http,
  request_default as httpPlugin,
  os,
  parent,
  parentData,
  queryParams_default as queryParams,
  random_default as random,
  randomArray_default as randomArray,
  rgbToHex2 as rgbToHex,
  route_default as route,
  sys,
  test_default as test,
  throttle_default as throttle,
  timeFormat_default as timeFormat,
  timeFrom_default as timeFrom,
  toast_default as toast,
  trim_default as trim,
  type2icon_default as type2icon,
  zIndex_default as zIndex
};
//# sourceMappingURL=uview-pro.js.map
