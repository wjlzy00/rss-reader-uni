if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
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
  class Router {
    // route: (options?: string | RouterConfig, params?: Record<string, any>) => Promise<void>;
    constructor() {
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
  }
  const route = new Router().route;
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
  function timeFrom(dateTime = null, format = "yyyy-mm-dd") {
    if (!dateTime)
      dateTime = Number(/* @__PURE__ */ new Date());
    if (typeof dateTime === "number" || typeof dateTime === "string") {
      if (dateTime.toString().length == 10)
        dateTime = Number(dateTime) * 1e3;
    }
    const timestamp = +new Date(Number(dateTime));
    const timer = (Number(/* @__PURE__ */ new Date()) - timestamp) / 1e3;
    let tips = "";
    switch (true) {
      case timer < 300:
        tips = "刚刚";
        break;
      case (timer >= 300 && timer < 3600):
        tips = parseInt(String(timer / 60)) + "分钟前";
        break;
      case (timer >= 3600 && timer < 86400):
        tips = parseInt(String(timer / 3600)) + "小时前";
        break;
      case (timer >= 86400 && timer < 2592e3):
        tips = parseInt(String(timer / 86400)) + "天前";
        break;
      default:
        if (format === false) {
          if (timer >= 2592e3 && timer < 365 * 86400) {
            tips = parseInt(String(timer / (86400 * 30))) + "个月前";
          } else {
            tips = parseInt(String(timer / (86400 * 365))) + "年前";
          }
        } else {
          tips = timeFormat(timestamp, format);
        }
    }
    return tips;
  }
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
  const colorGradients = {
    colorGradient,
    hexToRgb,
    rgbToHex,
    colorToRgba
  };
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
  let color = {
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
  function randomArray(array2 = []) {
    return array2.sort(() => Math.random() - 0.5);
  }
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
  function deepMerge(target = {}, source = {}) {
    target = deepClone(target);
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
  const test = {
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
  function addUnit(value = "auto", unit = "rpx") {
    const strValue = String(value);
    return test.number(strValue) ? `${strValue}${unit}` : strValue;
  }
  function random(min, max) {
    if (min >= 0 && max > 0 && max >= min) {
      const gab = max - min + 1;
      return Math.floor(Math.random() * gab + min);
    } else {
      return 0;
    }
  }
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
  function toast(title, option = 1500) {
    uni.showToast({
      title,
      icon: typeof option === "string" ? option : typeof option === "object" ? option.icon || "none" : "none",
      duration: typeof option === "number" ? option : typeof option === "object" ? option.duration || "1500" : 1500
    });
  }
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
  function $parent(componentName, _instance = null) {
    var _a;
    const instance = _instance || vue.getCurrentInstance();
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
  function os() {
    return uni.getSystemInfoSync().platform;
  }
  function sys() {
    return uni.getSystemInfoSync();
  }
  let timeout = null;
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
  let flag;
  function throttle(func, wait = 500, immediate = true) {
    if (immediate) {
      if (!flag) {
        flag = true;
        typeof func === "function" && func();
        setTimeout(() => {
          flag = false;
        }, wait);
      }
    } else {
      if (!flag) {
        flag = true;
        setTimeout(() => {
          flag = false;
          typeof func === "function" && func();
        }, wait);
      }
    }
  }
  function getRect(selector, _instance = null, all = false) {
    const instance = _instance || vue.getCurrentInstance();
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
  function parent(componentName, _instance = null) {
    var _a;
    const instance = _instance || vue.getCurrentInstance();
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
    const instance = _instance || vue.getCurrentInstance();
    const findParent = parent(componentName, instance);
    return findParent ? findParent.exposed : null;
  }
  const version = "0.0.22";
  const config = {
    v: version,
    version,
    // 主题名称
    type: ["primary", "success", "info", "error", "warning"]
  };
  const zIndex = {
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
  class Request {
    constructor() {
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
      this.config = deepMerge(this.config, customConfig);
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
  }
  const httpInstance = new Request();
  const $u = {
    queryParams,
    route,
    timeFormat,
    date: timeFormat,
    // 另名date
    timeFrom,
    colorGradient: colorGradients.colorGradient,
    colorToRgba: colorGradients.colorToRgba,
    guid,
    color,
    sys,
    os,
    type2icon,
    randomArray,
    dispatch,
    broadcast,
    hexToRgb: colorGradients.hexToRgb,
    rgbToHex: colorGradients.rgbToHex,
    test,
    random,
    deepClone,
    deepMerge,
    getParent,
    $parent,
    parent,
    parentData,
    addUnit,
    trim,
    type: ["primary", "success", "error", "warning", "info"],
    http: httpInstance,
    toast,
    config,
    // uView配置信息相关，比如版本号
    zIndex,
    debounce,
    throttle,
    mitt: mitt(),
    getRect
  };
  const ButtonProps = {
    /** 是否细边框 */
    hairLine: { type: Boolean, default: true },
    /** 按钮的预置样式，default，primary，error，warning，success */
    type: { type: String, default: "default" },
    /** 按钮尺寸，default，medium，mini */
    size: { type: String, default: "default" },
    /** 按钮形状，circle（两边为半圆），square（带圆角） */
    shape: { type: String, default: "square" },
    /** 按钮是否镂空 */
    plain: { type: Boolean, default: false },
    /** 是否禁止状态 */
    disabled: { type: Boolean, default: false },
    /** 是否加载中 */
    loading: { type: Boolean, default: false },
    /** 支付宝小程序，当 open-type 为 getAuthorize 时有效 */
    scope: { type: String, default: "" },
    /** 开放能力，具体请看uniapp稳定关于button组件部分说明 */
    openType: { type: String, default: "" },
    /** 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件 */
    formType: { type: String, default: "" },
    /** 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效 */
    appParameter: { type: String, default: "" },
    /** 指定是否阻止本节点的祖先节点出现点击态，微信小程序有效 */
    hoverStopPropagation: { type: Boolean, default: false },
    /** 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文。只微信小程序有效 */
    lang: { type: String, default: "en" },
    /** 会话来源，open-type="contact"时有效。只微信小程序有效 */
    sessionFrom: { type: String, default: "" },
    /** 会话内消息卡片标题，open-type="contact"时有效 */
    sendMessageTitle: { type: String, default: "" },
    /** 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效 */
    sendMessagePath: { type: String, default: "" },
    /** 会话内消息卡片图片，open-type="contact"时有效 */
    sendMessageImg: { type: String, default: "" },
    /** 是否显示会话内消息卡片，open-type="contact"时有效 */
    showMessageCard: { type: Boolean, default: false },
    /** 手指按（触摸）按钮时按钮时的背景颜色 */
    hoverBgColor: { type: String, default: "" },
    /** 水波纹的背景颜色 */
    rippleBgColor: { type: String, default: "" },
    /** 是否开启水波纹效果 */
    ripple: { type: Boolean, default: false },
    /** 按下的类名 */
    hoverClass: { type: String, default: "" },
    /** 自定义样式，对象形式 */
    customStyle: { type: Object, default: () => ({}) },
    /** 额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取 */
    dataName: { type: String, default: "" },
    /** 节流，一定时间内只能触发一次 */
    throttleTime: { type: [String, Number], default: 1e3 },
    /** 按住后多久出现点击态，单位毫秒 */
    hoverStartTime: { type: [String, Number], default: 20 },
    /** 手指松开后点击态保留时间，单位毫秒 */
    hoverStayTime: { type: [String, Number], default: 150 }
  };
  const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-button"
    },
    __name: "u-button",
    props: ButtonProps,
    emits: ["click", "getuserinfo", "contact", "getphonenumber", "error", "launchapp", "opensetting", "chooseavatar", "agreeprivacyauthorization"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      const rippleTop = vue.ref(0);
      const rippleLeft = vue.ref(0);
      const fields = vue.ref({});
      const waveActive = vue.ref(false);
      const getHoverClass = vue.computed(() => {
        if (props.loading || props.disabled || props.ripple || props.hoverClass)
          return "";
        let hoverClass = "";
        hoverClass = props.plain ? "u-" + props.type + "-plain-hover" : "u-" + props.type + "-hover";
        return hoverClass;
      });
      const showHairLineBorder = vue.computed(() => {
        if (["primary", "success", "error", "warning"].indexOf(props.type) >= 0 && !props.plain) {
          return "";
        } else {
          return "u-hairline-border";
        }
      });
      function click(e) {
        $u.throttle(() => {
          if (props.loading === true || props.disabled === true)
            return;
          if (props.ripple) {
            waveActive.value = false;
            vue.nextTick(() => {
              getWaveQuery(e);
            });
          }
          emit("click", e);
        }, Number(props.throttleTime));
      }
      function getWaveQuery(e) {
        getElQuery().then((res) => {
          let data = res[0];
          if (!data.width || !data.width)
            return;
          data.targetWidth = data.height > data.width ? data.height : data.width;
          if (!data.targetWidth)
            return;
          fields.value = data;
          let touchesX = "", touchesY = "";
          touchesX = e.touches[0].clientX;
          touchesY = e.touches[0].clientY;
          rippleTop.value = Number(touchesY) - data.top - data.targetWidth / 2;
          rippleLeft.value = Number(touchesX) - data.left - data.targetWidth / 2;
          vue.nextTick(() => {
            waveActive.value = true;
          });
        });
      }
      function getElQuery() {
        return new Promise((resolve) => {
          let queryInfo = "";
          queryInfo = uni.createSelectorQuery().in(null);
          queryInfo.select(".u-btn").boundingClientRect();
          queryInfo.exec((data) => {
            resolve(data);
          });
        });
      }
      function getphonenumber(event) {
        emit("getphonenumber", event);
      }
      function getuserinfo(event) {
        emit("getuserinfo", event);
      }
      function error(event) {
        emit("error", event);
      }
      function opensetting(event) {
        emit("opensetting", event);
      }
      function launchapp(event) {
        emit("launchapp", event);
      }
      function getAuthorize(event) {
        if (props.scope === "phoneNumber") {
          getphonenumber(event);
        } else if (props.scope === "userInfo") {
          getuserinfo(event);
        }
      }
      function contact(event) {
        emit("contact", event);
      }
      function chooseavatar(event) {
        emit("chooseavatar", event);
      }
      function agreeprivacyauthorization(event) {
        emit("agreeprivacyauthorization", event);
      }
      const __returned__ = { emit, props, rippleTop, rippleLeft, fields, waveActive, getHoverClass, showHairLineBorder, click, getWaveQuery, getElQuery, getphonenumber, getuserinfo, error, opensetting, launchapp, getAuthorize, contact, chooseavatar, agreeprivacyauthorization };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("button", {
      id: "u-wave-btn",
      class: vue.normalizeClass(["u-btn u-line-1 u-fix-ios-appearance", [
        "u-size-" + _ctx.size,
        _ctx.plain ? "u-btn--" + _ctx.type + "--plain" : "",
        _ctx.loading ? "u-loading" : "",
        _ctx.shape === "circle" ? "u-round-circle" : "",
        _ctx.hairLine ? $setup.showHairLineBorder : "u-btn--bold-border",
        "u-btn--" + _ctx.type,
        _ctx.disabled ? `u-btn--${_ctx.type}--disabled` : ""
      ]]),
      "hover-start-time": Number(_ctx.hoverStartTime),
      "hover-stay-time": Number(_ctx.hoverStayTime),
      disabled: _ctx.disabled,
      "form-type": _ctx.formType,
      "open-type": _ctx.disabled || _ctx.loading ? void 0 : _ctx.openType,
      "app-parameter": _ctx.appParameter,
      "hover-stop-propagation": _ctx.hoverStopPropagation,
      "send-message-title": _ctx.sendMessageTitle,
      "send-message-path": "sendMessagePath",
      lang: _ctx.lang,
      "data-name": _ctx.dataName,
      "session-from": _ctx.sessionFrom,
      "send-message-img": _ctx.sendMessageImg,
      "show-message-card": _ctx.showMessageCard,
      "on:getAuthorize": $setup.getAuthorize,
      onGetuserinfo: $setup.getuserinfo,
      onContact: $setup.contact,
      onGetphonenumber: $setup.getphonenumber,
      onError: $setup.error,
      onLaunchapp: $setup.launchapp,
      onOpensetting: $setup.opensetting,
      onChooseavatar: $setup.chooseavatar,
      onAgreeprivacyauthorization: $setup.agreeprivacyauthorization,
      style: vue.normalizeStyle([
        _ctx.customStyle,
        {
          overflow: _ctx.ripple ? "hidden" : "visible"
        }
      ]),
      onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => $setup.click($event), ["stop"])),
      "hover-class": $setup.getHoverClass,
      loading: _ctx.loading
    }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      _ctx.ripple ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["u-wave-ripple", [$setup.waveActive ? "u-wave-active" : ""]]),
          style: vue.normalizeStyle({
            top: $setup.rippleTop + "px",
            left: $setup.rippleLeft + "px",
            width: $setup.fields.targetWidth + "px",
            height: $setup.fields.targetWidth + "px",
            "background-color": _ctx.rippleBgColor || "rgba(0, 0, 0, 0.15)"
          })
        },
        null,
        6
        /* CLASS, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ], 46, ["hover-start-time", "hover-stay-time", "disabled", "form-type", "open-type", "app-parameter", "hover-stop-propagation", "send-message-title", "lang", "data-name", "session-from", "send-message-img", "show-message-card", "hover-class", "loading"]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-6df07486"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-button/u-button.vue"]]);
  const CardProps = {
    /** 与屏幕两侧是否留空隙 */
    full: { type: Boolean, default: false },
    /** 标题 */
    title: { type: String, default: "" },
    /** 标题颜色 */
    titleColor: { type: String, default: "#303133" },
    /** 标题字体大小，单位rpx */
    titleSize: { type: [Number, String], default: "30" },
    /** 副标题 */
    subTitle: { type: String, default: "" },
    /** 副标题颜色 */
    subTitleColor: { type: String, default: "#909399" },
    /** 副标题字体大小，单位rpx */
    subTitleSize: { type: [Number, String], default: "26" },
    /** 是否显示外部边框，只对full=false时有效(卡片与边框有空隙时) */
    border: { type: Boolean, default: true },
    /** 用于标识点击了第几个 */
    index: { type: [String, Number, Object], default: "" },
    /** 用于隔开上下左右的边距，带单位的写法，如："30rpx 30rpx"，"20rpx 20rpx 30rpx 30rpx" */
    margin: { type: String, default: "30rpx" },
    /** card卡片的圆角 */
    borderRadius: { type: [Number, String], default: "16" },
    /** 头部自定义样式，对象形式 */
    headStyle: { type: Object, default: () => ({}) },
    /** 主体自定义样式，对象形式 */
    bodyStyle: { type: Object, default: () => ({}) },
    /** 底部自定义样式，对象形式 */
    footStyle: { type: Object, default: () => ({}) },
    /** 头部是否下边框 */
    headBorderBottom: { type: Boolean, default: true },
    /** 底部是否有上边框 */
    footBorderTop: { type: Boolean, default: true },
    /** 标题左边的缩略图 */
    thumb: { type: String, default: "" },
    /** 缩略图宽高，单位rpx */
    thumbWidth: { type: [String, Number], default: "60" },
    /** 缩略图是否为圆形 */
    thumbCircle: { type: Boolean, default: false },
    /** 给head，body，foot的内边距 */
    padding: { type: [String, Number], default: "30" },
    /** 是否显示头部 */
    showHead: { type: Boolean, default: true },
    /** 是否显示尾部 */
    showFoot: { type: Boolean, default: true },
    /** 卡片外围阴影，字符串形式 */
    boxShadow: { type: String, default: "none" }
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-card"
    },
    __name: "u-card",
    props: CardProps,
    emits: ["click", "head-click", "body-click", "foot-click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const slots = vue.useSlots();
      function onClick() {
        emit("click", props.index);
      }
      function onHeadClick() {
        emit("head-click", props.index);
      }
      function onBodyClick() {
        emit("body-click", props.index);
      }
      function onFootClick() {
        emit("foot-click", props.index);
      }
      const __returned__ = { props, emit, slots, onClick, onHeadClick, onBodyClick, onFootClick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-card", { "u-border": _ctx.border, "u-card-full": _ctx.full, "u-card--border": Number(_ctx.borderRadius) > 0 }]),
        onClick: vue.withModifiers($setup.onClick, ["stop"]),
        style: vue.normalizeStyle({
          borderRadius: _ctx.borderRadius + "rpx",
          margin: _ctx.margin,
          boxShadow: _ctx.boxShadow
        })
      },
      [
        _ctx.showHead ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["u-card__head", {
              "u-border-bottom": _ctx.headBorderBottom
            }]),
            style: vue.normalizeStyle([{ padding: _ctx.padding + "rpx" }, _ctx.headStyle]),
            onClick: $setup.onHeadClick
          },
          [
            !$setup.slots.head ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "u-flex u-row-between"
            }, [
              _ctx.title ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "u-card__head--left u-flex u-line-1"
              }, [
                _ctx.thumb ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  src: _ctx.thumb,
                  class: "u-card__head--left__thumb",
                  mode: "aspectFill",
                  style: vue.normalizeStyle({
                    height: _ctx.thumbWidth + "rpx",
                    width: _ctx.thumbWidth + "rpx",
                    borderRadius: _ctx.thumbCircle ? "100rpx" : "6rpx"
                  })
                }, null, 12, ["src"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode(
                  "text",
                  {
                    class: "u-card__head--left__title u-line-1",
                    style: vue.normalizeStyle({
                      fontSize: _ctx.titleSize + "rpx",
                      color: _ctx.titleColor
                    })
                  },
                  vue.toDisplayString(_ctx.title),
                  5
                  /* TEXT, STYLE */
                )
              ])) : vue.createCommentVNode("v-if", true),
              _ctx.subTitle ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "u-card__head--right u-line-1"
              }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: "u-card__head__title__text",
                    style: vue.normalizeStyle({
                      fontSize: _ctx.subTitleSize + "rpx",
                      color: _ctx.subTitleColor
                    })
                  },
                  vue.toDisplayString(_ctx.subTitle),
                  5
                  /* TEXT, STYLE */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])) : vue.renderSlot(_ctx.$slots, "head", { key: 1 }, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            onClick: $setup.onBodyClick,
            class: "u-card__body",
            style: vue.normalizeStyle([{ padding: _ctx.padding + "rpx" }, _ctx.bodyStyle])
          },
          [
            vue.renderSlot(_ctx.$slots, "body", {}, void 0, true)
          ],
          4
          /* STYLE */
        ),
        _ctx.showFoot ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: vue.normalizeClass(["u-card__foot", {
              "u-border-top": _ctx.footBorderTop
            }]),
            onClick: $setup.onFootClick,
            style: vue.normalizeStyle([{ padding: $setup.slots.foot ? _ctx.padding + "rpx" : 0 }, _ctx.footStyle])
          },
          [
            vue.renderSlot(_ctx.$slots, "foot", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-e66195b5"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-card/u-card.vue"]]);
  const IconProps = {
    /** 图标名称，见示例图标集 */
    name: { type: String, default: "" },
    /** 图标颜色，可接受主题色 */
    color: { type: String, default: "" },
    /** 字体大小，单位rpx（默认32） */
    size: { type: [Number, String], default: "inherit" },
    /** 是否显示粗体 */
    bold: { type: Boolean, default: false },
    /** 点击图标的时候传递事件出去的index（用于区分点击了哪一个） */
    index: { type: [Number, String], default: "" },
    /** 触摸图标时的类名 */
    hoverClass: { type: String, default: "" },
    /** 自定义扩展前缀，方便用户扩展自己的图标库 */
    customPrefix: { type: String, default: "uicon" },
    /** 图标右边或者下面的文字 */
    label: { type: [String, Number], default: "" },
    /** label的位置，只能右边或者下边 */
    labelPos: { type: String, default: "right" },
    /** label的大小，单位rpx（默认28） */
    labelSize: { type: [String, Number], default: "28" },
    /** label的颜色 */
    labelColor: { type: String, default: "#606266" },
    /** label与图标的距离(横向排列)，单位rpx（默认6） */
    marginLeft: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginTop: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginRight: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginBottom: { type: [String, Number], default: "6" },
    /** label与图标的距离，单位rpx，权重高于 margin */
    space: { type: [String, Number], default: "" },
    /** 图片的mode，参考uni-app image组件 */
    imgMode: { type: String, default: "widthFix" },
    /** 自定义样式，对象形式 */
    customStyle: { type: Object, default: () => ({}) },
    /** 用于显示图片小图标时，图片的宽度，单位rpx */
    width: { type: [String, Number], default: "" },
    /** 用于显示图片小图标时，图片的高度，单位rpx */
    height: { type: [String, Number], default: "" },
    /** 用于解决某些情况下，让图标垂直居中的用途，单位rpx */
    top: { type: [String, Number], default: 0 },
    /** 是否为DecimalIcon */
    showDecimalIcon: { type: Boolean, default: false },
    /** 背景颜色，可接受主题色，仅Decimal时有效 */
    inactiveColor: { type: String, default: "#ececec" },
    /** 显示的百分比，仅Decimal时有效 */
    percent: { type: [Number, String], default: "50" }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-icon"
    },
    __name: "u-icon",
    props: IconProps,
    emits: ["click", "touchstart"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      const customClass = vue.computed(() => {
        let classes = [];
        classes.push(props.customPrefix + "-" + props.name);
        if (props.customPrefix === "uicon") {
          classes.push("u-iconfont");
        } else {
          classes.push(props.customPrefix);
        }
        if (props.showDecimalIcon && props.inactiveColor && $u.config.type.includes(props.inactiveColor)) {
          classes.push("u-icon__icon--" + props.inactiveColor);
        } else if (props.color && $u.config.type.includes(props.color)) {
          classes.push("u-icon__icon--" + props.color);
        }
        return classes;
      });
      const iconStyle = vue.computed(() => {
        const style = {
          fontSize: props.size === "inherit" ? "inherit" : $u.addUnit(props.size),
          fontWeight: props.bold ? "bold" : "normal",
          // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
          top: $u.addUnit(props.top)
        };
        if (props.showDecimalIcon && props.inactiveColor && !$u.config.type.includes(props.inactiveColor)) {
          style.color = props.inactiveColor;
        } else if (props.color && !$u.config.type.includes(props.color)) {
          style.color = props.color;
        }
        return style;
      });
      const isImg = vue.computed(() => {
        return props.name.indexOf("/") !== -1;
      });
      const imgStyle = vue.computed(() => {
        const style = {
          width: props.width ? $u.addUnit(props.width) : $u.addUnit(props.size),
          height: props.height ? $u.addUnit(props.height) : $u.addUnit(props.size)
        };
        return style;
      });
      const decimalIconStyle = vue.computed(() => {
        const style = {
          fontSize: props.size === "inherit" ? "inherit" : $u.addUnit(props.size),
          fontWeight: props.bold ? "bold" : "normal",
          // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
          top: $u.addUnit(props.top),
          width: props.percent + "%"
        };
        if (props.color && !$u.config.type.includes(props.color)) {
          style.color = props.color;
        }
        return style;
      });
      const decimalIconClass = vue.computed(() => {
        let classes = [];
        classes.push(props.customPrefix + "-" + props.name);
        if (props.customPrefix === "uicon") {
          classes.push("u-iconfont");
        } else {
          classes.push(props.customPrefix);
        }
        if (props.color && $u.config.type.includes(props.color)) {
          classes.push("u-icon__icon--" + props.color);
        } else {
          classes.push("u-icon__icon--primary");
        }
        return classes;
      });
      const labelStyle = vue.computed(() => {
        return {
          color: props.labelColor,
          fontSize: $u.addUnit(props.labelSize),
          marginLeft: props.labelPos === "right" ? $u.addUnit(props.space || props.marginLeft) : 0,
          marginTop: props.labelPos === "bottom" ? $u.addUnit(props.space || props.marginTop) : 0,
          marginRight: props.labelPos === "left" ? $u.addUnit(props.space || props.marginRight) : 0,
          marginBottom: props.labelPos === "top" ? $u.addUnit(props.space || props.marginBottom) : 0
        };
      });
      function onClick() {
        emit("click", props.index);
      }
      function onTouchstart() {
        emit("touchstart", props.index);
      }
      const __returned__ = { emit, props, customClass, iconStyle, isImg, imgStyle, decimalIconStyle, decimalIconClass, labelStyle, onClick, onTouchstart };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle([_ctx.customStyle]),
        class: vue.normalizeClass(["u-icon", ["u-icon--" + _ctx.labelPos]]),
        onClick: $setup.onClick
      },
      [
        $setup.isImg ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "u-icon__img",
          src: _ctx.name,
          mode: _ctx.imgMode,
          style: vue.normalizeStyle([$setup.imgStyle])
        }, null, 12, ["src", "mode"])) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: vue.normalizeClass(["u-icon__icon", $setup.customClass]),
          style: vue.normalizeStyle([$setup.iconStyle]),
          "hover-class": _ctx.hoverClass,
          onTouchstart: $setup.onTouchstart
        }, [
          _ctx.showDecimalIcon ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            style: vue.normalizeStyle([$setup.decimalIconStyle]),
            class: vue.normalizeClass([$setup.decimalIconClass, "u-icon__decimal"]),
            "hover-class": _ctx.hoverClass
          }, null, 14, ["hover-class"])) : vue.createCommentVNode("v-if", true)
        ], 46, ["hover-class"])),
        _ctx.label !== "" ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 2,
            class: "u-icon__label",
            style: vue.normalizeStyle($setup.labelStyle)
          },
          vue.toDisplayString(_ctx.label),
          5
          /* TEXT, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_8 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-b85e76d0"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-icon/u-icon.vue"]]);
  const EmptyProps = {
    /** 图标路径 */
    src: { type: String, default: "" },
    /** 提示文字 */
    text: { type: String, default: "" },
    /** 文字颜色 */
    color: { type: String, default: "#c0c4cc" },
    /** 图标的颜色 */
    iconColor: { type: String, default: "#c0c4cc" },
    /** 图标的大小 */
    iconSize: { type: [String, Number], default: 120 },
    /** 文字大小，单位rpx */
    fontSize: { type: [String, Number], default: 26 },
    /** 选择预置的图标类型 */
    mode: { type: String, default: "data" },
    /** 图标宽度，单位rpx */
    imgWidth: { type: [String, Number], default: 120 },
    /** 图标高度，单位rpx */
    imgHeight: { type: [String, Number], default: "auto" },
    /** 是否显示组件 */
    show: { type: Boolean, default: true },
    /** 组件距离上一个元素之间的距离 */
    marginTop: { type: [String, Number], default: 0 },
    /** 图标自定义样式 */
    iconStyle: { type: Object, default: () => ({}) }
  };
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-empty"
    },
    __name: "u-empty",
    props: EmptyProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const icons = {
        car: "购物车为空",
        page: "页面不存在",
        search: "没有搜索结果",
        address: "没有收货地址",
        wifi: "没有WiFi",
        order: "订单为空",
        coupon: "没有优惠券",
        favor: "暂无收藏",
        permission: "无权限",
        history: "无历史记录",
        news: "无新闻列表",
        message: "消息列表为空",
        list: "列表为空",
        data: "数据为空"
      };
      const __returned__ = { props, icons };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_8);
    return _ctx.show ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: "u-empty",
        style: vue.normalizeStyle({ marginTop: _ctx.marginTop + "rpx" })
      },
      [
        vue.createVNode(_component_u_icon, {
          name: _ctx.src ? _ctx.src : "empty-" + _ctx.mode,
          "custom-style": _ctx.iconStyle,
          label: _ctx.text ? _ctx.text : $setup.icons[_ctx.mode],
          "label-pos": "bottom",
          "label-color": _ctx.color,
          "label-size": _ctx.fontSize,
          size: _ctx.iconSize,
          color: _ctx.iconColor,
          "margin-top": "14"
        }, null, 8, ["name", "custom-style", "label", "label-color", "label-size", "size", "color"]),
        vue.createElementVNode("view", { class: "u-slot-wrap" }, [
          vue.renderSlot(_ctx.$slots, "bottom", {}, void 0, true)
        ])
      ],
      4
      /* STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-f11ecba3"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-empty/u-empty.vue"]]);
  const ToastProps = {
    /** 层级 z-index */
    zIndex: { type: [Number, String], default: "" },
    /** 提示类型，success/warning/error/loading 等 */
    type: { type: String, default: "" },
    /** 显示时长，单位ms */
    duration: { type: Number, default: 2e3 },
    /** 是否显示图标 */
    icon: { type: Boolean, default: true },
    /** 显示位置，center/top/bottom */
    position: { type: String, default: "center" },
    /** 关闭时的回调函数 */
    callback: { type: Function, default: null },
    /** 是否返回上一页 */
    back: { type: Boolean, default: false },
    /** 是否为tab页面跳转 */
    isTab: { type: Boolean, default: false },
    /** 跳转的url */
    url: { type: String, default: "" },
    /** 跳转参数对象 */
    params: { type: Object, default: () => ({}) }
  };
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-toast"
    },
    __name: "u-toast",
    props: ToastProps,
    setup(__props, { expose: __expose }) {
      const props = __props;
      const isShow = vue.ref(false);
      let timer = null;
      const config2 = vue.ref({
        params: {},
        // URL跳转的参数，对象
        title: "",
        // 显示文本
        type: "",
        // 主题类型，primary，success，error，warning，black
        duration: 2e3,
        // 显示的时间，毫秒
        isTab: false,
        // 是否跳转tab页面
        url: "",
        // toast消失后是否跳转页面，有则跳转，优先级高于back参数
        icon: true,
        // 显示的图标
        position: "center",
        // toast出现的位置
        callback: null,
        // 执行完后的回调函数
        back: false
        // 结束toast是否自动返回上一页
      });
      const tmpConfig = vue.ref({ ...config2.value });
      const iconName = vue.computed(() => {
        if (["error", "warning", "success", "info"].indexOf(tmpConfig.value.type) >= 0 && tmpConfig.value.icon) {
          let icon = $u.type2icon(tmpConfig.value.type);
          return icon;
        }
        return "";
      });
      const uZIndex = vue.computed(() => {
        return isShow.value ? props.zIndex ? props.zIndex : $u.zIndex.toast : "999999";
      });
      function show(options) {
        tmpConfig.value = $u.deepMerge(config2.value, options);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        isShow.value = true;
        timer = setTimeout(() => {
          isShow.value = false;
          clearTimeout(timer);
          timer = null;
          typeof tmpConfig.value.callback === "function" && tmpConfig.value.callback();
          timeEnd();
        }, tmpConfig.value.duration);
      }
      function hide() {
        isShow.value = false;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function timeEnd() {
        if (tmpConfig.value.url) {
          if (tmpConfig.value.url[0] != "/")
            tmpConfig.value.url = "/" + tmpConfig.value.url;
          if (Object.keys(tmpConfig.value.params).length) {
            let query = "";
            if (/.*\/.*\?.*=.*/.test(tmpConfig.value.url)) {
              query = $u.queryParams(tmpConfig.value.params, false);
              tmpConfig.value.url = tmpConfig.value.url + "&" + query;
            } else {
              query = $u.queryParams(tmpConfig.value.params);
              tmpConfig.value.url += query;
            }
          }
          if (tmpConfig.value.isTab) {
            uni.switchTab({ url: tmpConfig.value.url });
          } else {
            uni.navigateTo({ url: tmpConfig.value.url });
          }
        } else if (tmpConfig.value.back) {
          $u.route({ type: "back" });
        }
      }
      __expose({
        show,
        hide
      });
      const __returned__ = { props, isShow, get timer() {
        return timer;
      }, set timer(v) {
        timer = v;
      }, config: config2, tmpConfig, iconName, uZIndex, show, hide, timeEnd };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_8);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-toast", [$setup.isShow ? "u-show" : "", "u-type-" + $setup.tmpConfig.type, "u-position-" + $setup.tmpConfig.position]]),
        style: vue.normalizeStyle({
          zIndex: $setup.uZIndex
        })
      },
      [
        vue.createElementVNode("view", { class: "u-icon-wrap" }, [
          $setup.tmpConfig.icon ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
            key: 0,
            class: "u-icon",
            name: $setup.iconName,
            size: 30,
            color: $setup.tmpConfig.type
          }, null, 8, ["name", "color"])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode(
          "text",
          { class: "u-text" },
          vue.toDisplayString($setup.tmpConfig.title),
          1
          /* TEXT */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-b09e1691"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-toast/u-toast.vue"]]);
  const InputProps = {
    /** 用于双向绑定输入框的值 */
    modelValue: {
      type: [String, Number],
      default: ""
    },
    /** 输入框的类型，textarea，text，number */
    type: {
      type: String,
      default: "text"
    },
    /** 输入框文字的对齐方式(默认left) */
    inputAlign: {
      type: String,
      default: "left"
    },
    /** placeholder显示值(默认 '请输入内容') */
    placeholder: {
      type: String,
      default: "请输入内容"
    },
    /** 是否禁用输入框(默认false) */
    disabled: {
      type: Boolean,
      default: false
    },
    /** 输入框的最大可输入长度(默认140) */
    maxlength: {
      type: [Number, String],
      default: 140
    },
    /** placeholder的样式，字符串形式，如"color: red;"(默认 "color: #c0c4cc;") */
    placeholderStyle: {
      type: String,
      default: "color: #c0c4cc;"
    },
    /** 设置键盘右下角按钮的文字，仅在type为text时生效(默认done) */
    confirmType: {
      type: String,
      default: "done"
    },
    /** 自定义输入框的样式，对象形式 */
    customStyle: {
      type: Object,
      default: () => ({})
    },
    /** 如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true */
    fixed: {
      type: Boolean,
      default: false
    },
    /** 是否自动获得焦点(默认false) */
    focus: {
      type: Boolean,
      default: false
    },
    /** 密码类型时，是否显示右侧的密码图标(默认true) */
    passwordIcon: {
      type: Boolean,
      default: true
    },
    /** input|textarea是否显示边框(默认false) */
    border: {
      type: Boolean,
      default: false
    },
    /** 输入框的边框颜色(默认#dcdfe6) */
    borderColor: {
      type: String,
      default: "#dcdfe6"
    },
    /** 是否自动增高输入区域，type为textarea时有效(默认true) */
    autoHeight: {
      type: Boolean,
      default: true
    },
    /** type=select时，旋转右侧的图标，标识当前处于打开还是关闭select的状态 */
    selectOpen: {
      type: Boolean,
      default: false
    },
    /** 高度，单位rpx */
    height: {
      type: [Number, String],
      default: ""
    },
    /** 是否可清空(默认true) */
    clearable: {
      type: Boolean,
      default: true
    },
    /** 指定光标与键盘的距离，单位 px(默认0) */
    cursorSpacing: {
      type: [Number, String],
      default: 0
    },
    /** 光标起始位置，自动聚焦时有效，需与selection-end搭配使用（默认-1） */
    selectionStart: {
      type: [Number, String],
      default: -1
    },
    /** 光标结束位置，自动聚焦时有效，需与selection-start搭配使用（默认-1） */
    selectionEnd: {
      type: [Number, String],
      default: -1
    },
    /** 是否自动去除两端的空格(默认true) */
    trim: {
      type: Boolean,
      default: true
    },
    /** 是否显示键盘上方带有”完成“按钮那一栏(默认true) */
    showConfirmbar: {
      type: Boolean,
      default: true
    },
    /** 弹出键盘时是否自动调节高度，uni-app默认值是true */
    adjustPosition: {
      type: Boolean,
      default: true
    },
    /** 输入框的验证状态，用于错误时，边框是否改为红色 */
    validateState: {
      type: Boolean,
      default: false
    }
  };
  const inputHeight = 70;
  const textareaHeight = 100;
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-input"
    },
    __name: "u-input",
    props: InputProps,
    emits: ["update:modelValue", "blur", "focus", "confirm", "click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const defaultValue = vue.ref(props.modelValue);
      const validateState = vue.ref(props.validateState);
      const focused = vue.ref(false);
      const showPassword = vue.ref(false);
      const lastValue = vue.ref("");
      vue.watch(
        () => props.modelValue,
        (nVal, oVal) => {
          defaultValue.value = nVal;
          if (nVal != oVal && props.type == "select")
            handleInput({ detail: { value: nVal } });
        }
      );
      vue.watch(
        () => props.validateState,
        (val) => {
          validateState.value = val;
        }
      );
      const inputMaxlength = vue.computed(() => Number(props.maxlength));
      const getStyle = vue.computed(() => {
        let style = {};
        style.minHeight = props.height ? props.height + "rpx" : props.type == "textarea" ? `${textareaHeight}rpx` : `${inputHeight}rpx`;
        style = Object.assign(style, props.customStyle);
        return style;
      });
      const getCursorSpacing = vue.computed(() => Number(props.cursorSpacing));
      const uSelectionStart = vue.computed(() => String(props.selectionStart));
      const uSelectionEnd = vue.computed(() => String(props.selectionEnd));
      const instance = vue.getCurrentInstance();
      function handleInput(event) {
        let value = event.detail.value;
        if (props.trim)
          value = $u.trim(value);
        emit("update:modelValue", value);
        defaultValue.value = value;
        setTimeout(() => {
          dispatch(instance, "u-form-item", "on-form-change", value);
        }, 40);
      }
      function handleBlur(event) {
        let value = event.detail.value;
        setTimeout(() => {
          focused.value = false;
        }, 100);
        emit("blur", value);
        setTimeout(() => {
          dispatch(instance, "u-form-item", "on-form-blur", value);
        }, 40);
      }
      function onFormItemError(status) {
        formatAppLog("log", "at node_modules/uview-pro/components/u-input/u-input.vue:187", "onFormItemError", status);
        validateState.value = status;
      }
      function onFocus(event) {
        focused.value = true;
        emit("focus");
      }
      function onConfirm(e) {
        emit("confirm", e.detail.value);
      }
      function onClear(event) {
        emit("update:modelValue", "");
      }
      function inputClick() {
        emit("click");
      }
      const __returned__ = { props, emit, defaultValue, inputHeight, textareaHeight, validateState, focused, showPassword, lastValue, inputMaxlength, getStyle, getCursorSpacing, uSelectionStart, uSelectionEnd, instance, handleInput, handleBlur, onFormItemError, onFocus, onConfirm, onClear, inputClick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_8);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-input", {
          "u-input--border": _ctx.border,
          "u-input--error": $setup.validateState
        }]),
        style: vue.normalizeStyle({
          padding: `0 ${_ctx.border ? 20 : 0}rpx`,
          borderColor: _ctx.borderColor,
          textAlign: _ctx.inputAlign
        }),
        onClick: vue.withModifiers($setup.inputClick, ["stop"])
      },
      [
        _ctx.type == "textarea" ? (vue.openBlock(), vue.createElementBlock("textarea", {
          key: 0,
          class: "u-input__input u-input__textarea",
          style: vue.normalizeStyle($setup.getStyle),
          value: $setup.defaultValue,
          placeholder: _ctx.placeholder,
          placeholderStyle: _ctx.placeholderStyle,
          disabled: _ctx.disabled,
          maxlength: $setup.inputMaxlength,
          fixed: _ctx.fixed,
          focus: _ctx.focus,
          autoHeight: _ctx.autoHeight,
          "selection-end": $setup.uSelectionEnd,
          "selection-start": $setup.uSelectionStart,
          "cursor-spacing": $setup.getCursorSpacing,
          "show-confirm-bar": _ctx.showConfirmbar,
          "adjust-position": _ctx.adjustPosition,
          onInput: $setup.handleInput,
          onBlur: $setup.handleBlur,
          onFocus: $setup.onFocus,
          onConfirm: $setup.onConfirm
        }, null, 44, ["value", "placeholder", "placeholderStyle", "disabled", "maxlength", "fixed", "focus", "autoHeight", "selection-end", "selection-start", "cursor-spacing", "show-confirm-bar", "adjust-position"])) : (vue.openBlock(), vue.createElementBlock("input", {
          key: 1,
          class: "u-input__input",
          type: _ctx.type == "password" ? "text" : _ctx.type,
          style: vue.normalizeStyle($setup.getStyle),
          value: $setup.defaultValue,
          password: _ctx.type == "password" && !$setup.showPassword,
          placeholder: _ctx.placeholder,
          placeholderStyle: _ctx.placeholderStyle,
          disabled: _ctx.disabled || _ctx.type === "select",
          maxlength: $setup.inputMaxlength,
          focus: _ctx.focus,
          confirmType: _ctx.confirmType,
          "cursor-spacing": $setup.getCursorSpacing,
          "selection-end": $setup.uSelectionEnd,
          "selection-start": $setup.uSelectionStart,
          "show-confirm-bar": _ctx.showConfirmbar,
          "adjust-position": _ctx.adjustPosition,
          onFocus: $setup.onFocus,
          onBlur: $setup.handleBlur,
          onInput: $setup.handleInput,
          onConfirm: $setup.onConfirm
        }, null, 44, ["type", "value", "password", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "confirmType", "cursor-spacing", "selection-end", "selection-start", "show-confirm-bar", "adjust-position"])),
        vue.createElementVNode("view", { class: "u-input__right-icon u-flex" }, [
          _ctx.clearable && _ctx.modelValue != "" && $setup.focused ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "u-input__right-icon__clear u-input__right-icon__item",
            onClick: $setup.onClear
          }, [
            vue.createVNode(_component_u_icon, {
              size: "32",
              name: "close-circle-fill",
              color: "#c0c4cc"
            })
          ])) : vue.createCommentVNode("v-if", true),
          _ctx.passwordIcon && _ctx.type == "password" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "u-input__right-icon__clear u-input__right-icon__item"
          }, [
            vue.createVNode(_component_u_icon, {
              size: "32",
              name: !$setup.showPassword ? "eye" : "eye-fill",
              color: "#c0c4cc",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showPassword = !$setup.showPassword)
            }, null, 8, ["name"])
          ])) : vue.createCommentVNode("v-if", true),
          _ctx.type == "select" ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 2,
              class: vue.normalizeClass(["u-input__right-icon--select u-input__right-icon__item", {
                "u-input__right-icon--select--reverse": _ctx.selectOpen
              }])
            },
            [
              vue.createVNode(_component_u_icon, {
                name: "arrow-down-fill",
                size: "26",
                color: "#c0c4cc"
              })
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-d205c001"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-input/u-input.vue"]]);
  const ColProps = {
    /** 占父容器宽度的多少等分，总分为12份 */
    span: { type: [Number, String], default: 12 },
    /** 指定栅格左侧的间隔数(总12栏) */
    offset: { type: [Number, String], default: 0 },
    /** 水平排列方式 */
    justify: { type: String, default: "start" },
    /** 垂直对齐方式 */
    align: { type: String, default: "center" },
    /** 文字对齐方式 */
    textAlign: { type: String, default: "left" },
    /** 是否阻止事件传播 */
    stop: { type: Boolean, default: true }
  };
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-col"
    },
    __name: "u-col",
    props: ColProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      const gutter = vue.inject("u-row-gutter", 20);
      const uJustify = vue.computed(() => {
        if (props.justify === "end" || props.justify === "start")
          return "flex-" + props.justify;
        else if (props.justify === "around" || props.justify === "between")
          return "space-" + props.justify;
        else
          return props.justify;
      });
      const uAlignItem = vue.computed(() => {
        if (props.align === "top")
          return "flex-start";
        if (props.align === "bottom")
          return "flex-end";
        else
          return props.align;
      });
      const colStyle = vue.computed(() => ({
        padding: `0 ${Number(gutter) / 2}rpx`,
        marginLeft: `${100 / 12 * Number(props.offset)}%`,
        flex: `0 0 ${100 / 12 * Number(props.span)}%`,
        alignItems: uAlignItem.value,
        justifyContent: uJustify.value,
        textAlign: props.textAlign
      }));
      function onClick(e) {
        emit("click");
      }
      const __returned__ = { emit, props, gutter, uJustify, uAlignItem, colStyle, onClick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-col", ["u-col-" + _ctx.span]]),
        style: vue.normalizeStyle($setup.colStyle),
        onClick: $setup.onClick
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_5 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-81915b5f"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-col/u-col.vue"]]);
  const RowProps = {
    /** 给col添加间距，左右边距各占一半 */
    gutter: { type: [String, Number], default: 20 },
    /** 水平排列方式，可选值为`start`(或`flex-start`)、`end`(或`flex-end`)、`center`、`around`(或`space-around`)、`between`(或`space-between`) */
    justify: { type: String, default: "start" },
    /** 垂直对齐方式，可选值为top、center、bottom */
    align: { type: String, default: "center" },
    /** 是否阻止事件传播 */
    stop: { type: Boolean, default: true }
  };
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-row"
    },
    __name: "u-row",
    props: RowProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      vue.provide("u-row-gutter", props.gutter);
      const uJustify = vue.computed(() => {
        if (props.justify === "end" || props.justify === "start")
          return "flex-" + props.justify;
        else if (props.justify === "around" || props.justify === "between")
          return "space-" + props.justify;
        else
          return props.justify;
      });
      const uAlignItem = vue.computed(() => {
        if (props.align === "top")
          return "flex-start";
        if (props.align === "bottom")
          return "flex-end";
        else
          return props.align;
      });
      function onClick(e) {
        emit("click");
      }
      const __returned__ = { emit, props, uJustify, uAlignItem, onClick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "u-row",
        style: vue.normalizeStyle({
          alignItems: $setup.uAlignItem,
          justifyContent: $setup.uJustify
        }),
        onClick: $setup.onClick
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      4
      /* STYLE */
    );
  }
  const __easycom_6 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-d90af7d4"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-row/u-row.vue"]]);
  const MaskProps = {
    /** 是否显示遮罩 */
    show: {
      type: Boolean,
      default: false
    },
    /** 层级z-index */
    zIndex: {
      type: [Number, String],
      default: ""
    },
    /** 用户自定义样式 */
    customStyle: {
      type: Object,
      default: () => ({})
    },
    /** 遮罩的动画样式，是否使用zoom进行scale进行缩放 */
    zoom: {
      type: Boolean,
      default: true
    },
    /** 遮罩的过渡时间，单位为ms */
    duration: {
      type: [Number, String],
      default: 300
    },
    /** 是否可以通过点击遮罩进行关闭 */
    maskClickAble: {
      type: Boolean,
      default: true
    }
  };
  const scale = "scale(1.2, 1.2)";
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    ...{ name: "u-mask" },
    __name: "u-mask",
    props: MaskProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const zoomStyle = vue.ref({ transform: "" });
      vue.watch(
        () => props.show,
        (n) => {
          if (n && props.zoom) {
            zoomStyle.value.transform = "scale(1, 1)";
          } else if (!n && props.zoom) {
            zoomStyle.value.transform = scale;
          }
        }
      );
      const maskStyle = vue.computed(() => {
        let style = {};
        style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        if (props.show)
          style.zIndex = props.zIndex ? props.zIndex : $u.zIndex.mask;
        else
          style.zIndex = -1;
        style.transition = `all ${Number(props.duration) / 1e3}s ease-in-out`;
        if (props.customStyle && Object.keys(props.customStyle).length) {
          style = {
            ...style,
            ...props.customStyle
          };
        }
        return style;
      });
      function click() {
        if (!props.maskClickAble)
          return;
        emit("click");
      }
      const __returned__ = { props, emit, zoomStyle, scale, maskStyle, click };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-mask", {
          "u-mask-zoom": $setup.props.zoom,
          "u-mask-show": $setup.props.show
        }]),
        "hover-stop-propagation": "",
        style: vue.normalizeStyle([$setup.maskStyle, $setup.zoomStyle]),
        onClick: $setup.click,
        onTouchmove: vue.withModifiers(() => {
        }, ["stop", "prevent"])
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-db7121f0"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-mask/u-mask.vue"]]);
  const PopupProps = {
    /** 显示状态 */
    show: { type: Boolean, default: false },
    /** 弹出方向，left|right|top|bottom|center */
    mode: { type: String, default: "left" },
    /** 是否显示遮罩 */
    mask: { type: Boolean, default: true },
    /** 抽屉的宽度(mode=left|right)，或者高度(mode=top|bottom)，单位rpx，或者"auto"，或者百分比"50%"，表示由内容撑开高度或者宽度 */
    length: { type: [Number, String], default: "auto" },
    /** 是否开启缩放动画，只在mode=center时有效 */
    zoom: { type: Boolean, default: true },
    /** 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距 */
    safeAreaInsetBottom: { type: Boolean, default: false },
    /** 是否可以通过点击遮罩进行关闭 */
    maskCloseAble: { type: Boolean, default: true },
    /** 用户自定义样式 */
    customStyle: { type: Object, default: () => ({}) },
    /** v-model 控制弹窗显示 */
    modelValue: { type: Boolean, default: false },
    /** 内部参数，解决多层调用报错不能修改props值的问题 */
    popup: { type: Boolean, default: true },
    /** 圆角 */
    borderRadius: { type: [Number, String], default: 0 },
    /** 弹窗z-index */
    zIndex: { type: [Number, String], default: "" },
    /** 是否显示关闭图标 */
    closeable: { type: Boolean, default: false },
    /** 关闭图标的名称，只能uView的内置图标 */
    closeIcon: { type: String, default: "close" },
    /** 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角 */
    closeIconPos: { type: String, default: "top-right" },
    /** 关闭图标的颜色 */
    closeIconColor: { type: String, default: "#909399" },
    /** 关闭图标的大小，单位rpx */
    closeIconSize: { type: [String, Number], default: "30" },
    /** 弹窗宽度 */
    width: { type: String, default: "" },
    /** 弹窗高度 */
    height: { type: String, default: "" },
    /** 负top定位，支持rpx/px/百分比 */
    negativeTop: { type: [String, Number], default: 0 },
    /** 遮罩自定义样式 */
    maskCustomStyle: { type: Object, default: () => ({}) },
    /** 动画时长，单位ms */
    duration: { type: [String, Number], default: 250 }
  };
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    ...{
      name: "u-popup"
    },
    __name: "u-popup",
    props: PopupProps,
    emits: ["update:modelValue", "open", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const visibleSync = vue.ref(false);
      const showDrawer = vue.ref(false);
      const timer = vue.ref(null);
      const closeFromInner = vue.ref(false);
      const style = vue.computed(() => {
        let style2 = {};
        if (props.mode == "left" || props.mode == "right") {
          style2 = {
            width: props.width ? getUnitValue(props.width) : getUnitValue(props.length),
            height: "100%",
            transform: `translate3D(${props.mode == "left" ? "-100%" : "100%"},0px,0px)`
          };
        } else if (props.mode == "top" || props.mode == "bottom") {
          style2 = {
            width: "100%",
            height: props.height ? getUnitValue(props.height) : getUnitValue(props.length),
            transform: `translate3D(0px,${props.mode == "top" ? "-100%" : "100%"},0px)`
          };
        }
        style2.zIndex = uZindex.value;
        if (props.borderRadius) {
          switch (props.mode) {
            case "left":
              style2.borderRadius = `0 ${props.borderRadius}rpx ${props.borderRadius}rpx 0`;
              break;
            case "top":
              style2.borderRadius = `0 0 ${props.borderRadius}rpx ${props.borderRadius}rpx`;
              break;
            case "right":
              style2.borderRadius = `${props.borderRadius}rpx 0 0 ${props.borderRadius}rpx`;
              break;
            case "bottom":
              style2.borderRadius = `${props.borderRadius}rpx ${props.borderRadius}rpx 0 0`;
              break;
          }
          style2.overflow = "hidden";
        }
        if (props.duration)
          style2.transition = `all ${Number(props.duration) / 1e3}s linear`;
        return style2;
      });
      const centerStyle = vue.computed(() => {
        let style2 = {};
        style2.width = props.width ? getUnitValue(props.width) : getUnitValue(props.length);
        style2.height = props.height ? getUnitValue(props.height) : "auto";
        style2.zIndex = uZindex.value;
        style2.marginTop = `-${$u.addUnit(props.negativeTop)}`;
        if (props.borderRadius) {
          style2.borderRadius = `${props.borderRadius}rpx`;
          style2.overflow = "hidden";
        }
        return style2;
      });
      const uZindex = vue.computed(() => props.zIndex ? props.zIndex : $u.zIndex.popup);
      vue.watch(
        () => props.modelValue,
        (val) => {
          if (val) {
            open();
          } else if (!closeFromInner.value) {
            close();
          }
          closeFromInner.value = false;
        }
      );
      vue.onMounted(() => {
        if (props.modelValue)
          open();
      });
      function getUnitValue(val) {
        if (/(%|px|rpx|auto)$/.test(String(val)))
          return val;
        else
          return val + "rpx";
      }
      function maskClick() {
        close();
      }
      function close() {
        closeFromInner.value = true;
        change("showDrawer", "visibleSync", false);
      }
      function modeCenterClose(mode) {
        if (mode != "center" || !props.maskCloseAble)
          return;
        close();
      }
      function open() {
        change("visibleSync", "showDrawer", true);
      }
      function change(param1, param2, status) {
        if (props.popup === true) {
          emit("update:modelValue", status);
        }
        (param1 === "showDrawer" ? showDrawer : visibleSync).value = status;
        if (status) {
          vue.nextTick(() => {
            (param2 === "showDrawer" ? showDrawer : visibleSync).value = status;
            emit(status ? "open" : "close");
          });
        } else {
          timer.value = setTimeout(() => {
            (param2 === "showDrawer" ? showDrawer : visibleSync).value = status;
            emit(status ? "open" : "close");
          }, Number(props.duration));
        }
      }
      const __returned__ = { props, emit, visibleSync, showDrawer, timer, closeFromInner, style, centerStyle, uZindex, getUnitValue, maskClick, close, modeCenterClose, open, change };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_mask = resolveEasycom(vue.resolveDynamicComponent("u-mask"), __easycom_0);
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_8);
    return $setup.visibleSync ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        style: vue.normalizeStyle([_ctx.customStyle, { zIndex: Number($setup.uZindex) - 1 }]),
        class: "u-drawer",
        "hover-stop-propagation": ""
      },
      [
        vue.createVNode(_component_u_mask, {
          duration: _ctx.duration,
          "custom-style": _ctx.maskCustomStyle,
          maskClickAble: _ctx.maskCloseAble,
          "z-index": Number($setup.uZindex) - 2,
          show: $setup.showDrawer && _ctx.mask,
          onClick: $setup.maskClick
        }, null, 8, ["duration", "custom-style", "maskClickAble", "z-index", "show"]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["u-drawer-content", [
              _ctx.safeAreaInsetBottom ? "safe-area-inset-bottom" : "",
              "u-drawer-" + _ctx.mode,
              $setup.showDrawer ? "u-drawer-content-visible" : "",
              _ctx.zoom && _ctx.mode == "center" ? "u-animation-zoom" : ""
            ]]),
            onClick: [
              _cache[2] || (_cache[2] = ($event) => $setup.modeCenterClose(_ctx.mode)),
              _cache[4] || (_cache[4] = vue.withModifiers(() => {
              }, ["stop", "prevent"]))
            ],
            onTouchmove: _cache[3] || (_cache[3] = vue.withModifiers(() => {
            }, ["stop", "prevent"])),
            style: vue.normalizeStyle([$setup.style])
          },
          [
            _ctx.mode == "center" ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: "u-mode-center-box",
                onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
                }, ["stop", "prevent"])),
                onTouchmove: _cache[1] || (_cache[1] = vue.withModifiers(() => {
                }, ["stop", "prevent"])),
                style: vue.normalizeStyle([$setup.centerStyle])
              },
              [
                _ctx.closeable ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
                  key: 0,
                  onClick: $setup.close,
                  class: vue.normalizeClass(["u-close", ["u-close--" + _ctx.closeIconPos]]),
                  name: _ctx.closeIcon,
                  color: _ctx.closeIconColor,
                  size: _ctx.closeIconSize
                }, null, 8, ["class", "name", "color", "size"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("scroll-view", {
                  class: "u-drawer__scroll-view",
                  "scroll-y": "true"
                }, [
                  vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                ])
              ],
              36
              /* STYLE, NEED_HYDRATION */
            )) : (vue.openBlock(), vue.createElementBlock("scroll-view", {
              key: 1,
              class: "u-drawer__scroll-view",
              "scroll-y": "true"
            }, [
              vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ])),
            vue.createElementVNode(
              "view",
              {
                onClick: $setup.close,
                class: vue.normalizeClass(["u-close", ["u-close--" + _ctx.closeIconPos]])
              },
              [
                _ctx.mode != "center" && _ctx.closeable ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
                  key: 0,
                  name: _ctx.closeIcon,
                  color: _ctx.closeIconColor,
                  size: _ctx.closeIconSize
                }, null, 8, ["name", "color", "size"])) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )
          ],
          38
          /* CLASS, STYLE, NEED_HYDRATION */
        )
      ],
      4
      /* STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_7 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-4924bdd9"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/node_modules/uview-pro/components/u-popup/u-popup.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        show: false,
        value: "",
        type: "text",
        border: true,
        placeholder: "请输入RSS链接",
        rssFeeds: []
        // 存储订阅列表
      };
    },
    computed: {
      displayFeeds() {
        try {
          const subscriptions = uni.getStorageSync("rss_subscriptions") || [];
          return Array.isArray(subscriptions) ? [...subscriptions] : [];
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:76", "获取订阅列表失败:", e);
          return [];
        }
      }
    },
    // 页面加载时获取订阅列表
    onLoad() {
      this.loadSubscriptions();
    },
    // 页面显示时刷新订阅列表
    onShow() {
      this.loadSubscriptions();
    },
    methods: {
      // 加载订阅列表
      loadSubscriptions() {
        try {
          const subscriptions = uni.getStorageSync("rss_subscriptions") || [];
          formatAppLog("log", "at pages/index/index.vue:94", "获取到的订阅列表:", subscriptions);
          this.rssFeeds = Array.isArray(subscriptions) ? [...subscriptions] : [];
          formatAppLog("log", "at pages/index/index.vue:97", "rssFeeds数组:", this.rssFeeds);
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:99", "加载订阅列表失败:", e);
          this.rssFeeds = [];
        }
      },
      async add() {
        if (!this.value) {
          this.$refs.uToast.show({
            title: "请输入RSS链接",
            type: "error"
          });
          return;
        }
        const trimmedValue = this.value.trim();
        if (trimmedValue.length === 0) {
          this.$refs.uToast.show({
            title: "请输入有效的RSS链接",
            type: "error"
          });
          return;
        }
        try {
          await this.saveSubscription(trimmedValue);
        } catch (error) {
          this.$refs.uToast.show({
            title: "添加失败: " + error.message,
            type: "error"
          });
        }
      },
      // 简化URL处理方法
      formatUrl(string) {
        let url2 = string.trim();
        if (!url2.startsWith("http://") && !url2.startsWith("https://")) {
          url2 = "https://" + url2;
        }
        return url2;
      },
      // 保存订阅信息
      async saveSubscription(url2) {
        try {
          const formattedUrl = this.formatUrl(url2);
          formatAppLog("log", "at pages/index/index.vue:145", "格式化后的URL:", formattedUrl);
          let subscriptions = uni.getStorageSync("rss_subscriptions") || [];
          formatAppLog("log", "at pages/index/index.vue:149", "保存前的订阅列表:", subscriptions);
          const exists = subscriptions.some((item) => item.url === formattedUrl);
          if (exists) {
            this.$refs.uToast.show({
              title: "该订阅已存在",
              type: "warning"
            });
            return;
          }
          const newSubscription = {
            id: Date.now(),
            // 使用时间戳作为唯一ID
            url: formattedUrl,
            title: this.extractTitleFromUrl(formattedUrl),
            addedTime: (/* @__PURE__ */ new Date()).getTime()
          };
          formatAppLog("log", "at pages/index/index.vue:169", "新订阅对象:", newSubscription);
          subscriptions.push(newSubscription);
          formatAppLog("log", "at pages/index/index.vue:173", "添加后的订阅列表:", subscriptions);
          uni.setStorageSync("rss_subscriptions", subscriptions);
          formatAppLog("log", "at pages/index/index.vue:177", "保存成功");
          this.$refs.uToast.show({
            title: "订阅添加成功",
            type: "success"
          });
          this.value = "";
          this.show = false;
          this.loadSubscriptions();
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:192", "保存订阅失败:", e);
          this.$refs.uToast.show({
            title: "保存订阅失败",
            type: "error"
          });
        }
      },
      // 从URL提取标题
      extractTitleFromUrl(url2) {
        try {
          const domain = new URL(url2).hostname;
          return domain.startsWith("www.") ? domain.substring(4) : domain;
        } catch (e) {
          return "未知订阅";
        }
      },
      // 删除订阅
      removeSubscription(id) {
        try {
          let subscriptions = uni.getStorageSync("rss_subscriptions") || [];
          subscriptions = subscriptions.filter((item) => item.id !== id);
          uni.setStorageSync("rss_subscriptions", subscriptions);
          this.$forceUpdate();
          this.$refs.uToast.show({
            title: "删除成功",
            type: "success"
          });
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:221", "删除订阅失败:", e);
          this.$refs.uToast.show({
            title: "删除失败",
            type: "error"
          });
        }
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_button = resolveEasycom(vue.resolveDynamicComponent("u-button"), __easycom_0$1);
    const _component_u_card = resolveEasycom(vue.resolveDynamicComponent("u-card"), __easycom_1);
    const _component_u_empty = resolveEasycom(vue.resolveDynamicComponent("u-empty"), __easycom_2);
    const _component_u_toast = resolveEasycom(vue.resolveDynamicComponent("u-toast"), __easycom_3);
    const _component_u_input = resolveEasycom(vue.resolveDynamicComponent("u-input"), __easycom_4);
    const _component_u_col = resolveEasycom(vue.resolveDynamicComponent("u-col"), __easycom_5);
    const _component_u_row = resolveEasycom(vue.resolveDynamicComponent("u-row"), __easycom_6);
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_7);
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_8);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", null, [
          vue.createCommentVNode(" 调试显示 - 显示订阅数量 "),
          vue.createElementVNode("view", { style: { "padding": "20rpx", "background-color": "#f0f0f0" } }, [
            vue.createElementVNode(
              "text",
              null,
              "订阅数量: " + vue.toDisplayString($options.displayFeeds.length),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 显示RSS内容 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.displayFeeds, (feed, index) => {
              return vue.openBlock(), vue.createElementBlock("view", { key: index }, [
                vue.createVNode(_component_u_card, {
                  title: feed.title || "未知标题",
                  "sub-title": new Date(feed.addedTime).toLocaleString() || "未知时间"
                }, {
                  body: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "u-body-item u-flex u-border-bottom u-col-between u-p-t-0" }, [
                      vue.createElementVNode("view", { class: "u-body-item-title u-line-2" }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          "URL: " + vue.toDisplayString(feed.url || "未知URL"),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    vue.createElementVNode("view", { class: "u-body-item u-flex u-row-between u-p-b-0" }, [
                      vue.createElementVNode("view", { class: "u-body-item-title u-line-2" }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          "ID: " + vue.toDisplayString(feed.id || "无ID"),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ]),
                  footer: vue.withCtx(() => [
                    vue.createElementVNode("view", { style: { "display": "flex", "justify-content": "flex-end" } }, [
                      vue.createVNode(_component_u_button, {
                        size: "mini",
                        type: "primary",
                        onClick: ($event) => $options.removeSubscription(feed.id)
                      }, {
                        default: vue.withCtx(() => [
                          vue.createTextVNode("删除")
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["onClick"])
                    ])
                  ]),
                  _: 2
                  /* DYNAMIC */
                }, 1032, ["title", "sub-title"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 如果没有订阅，显示提示 "),
          $options.displayFeeds.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            vue.createVNode(_component_u_empty, {
              mode: "list",
              text: "暂无订阅内容"
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_u_button, {
                  slot: "bottom",
                  type: "primary",
                  onClick: _cache[0] || (_cache[0] = ($event) => $data.show = true)
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode("添加订阅")
                  ]),
                  _: 1
                  /* STABLE */
                })
              ]),
              _: 1
              /* STABLE */
            })
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "container" }, [
          vue.createVNode(
            _component_u_toast,
            { ref: "uToast" },
            null,
            512
            /* NEED_PATCH */
          ),
          vue.createVNode(_component_u_popup, {
            modelValue: $data.show,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.show = $event),
            mode: "bottom",
            "border-radius": "12",
            length: "60%"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_u_row, { gutter: "16" }, {
                default: vue.withCtx(() => [
                  vue.createVNode(_component_u_col, { span: "12" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "demo-layout bg-purple" }, [
                        vue.createElementVNode("view", null, [
                          vue.createVNode(_component_u_input, {
                            modelValue: $data.value,
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.value = $event),
                            type: $data.type,
                            border: $data.border,
                            placeholder: $data.placeholder
                          }, null, 8, ["modelValue", "type", "border", "placeholder"])
                        ]),
                        vue.createVNode(_component_u_button, { onClick: $options.add }, {
                          default: vue.withCtx(() => [
                            vue.createTextVNode("订阅")
                          ]),
                          _: 1
                          /* STABLE */
                        }, 8, ["onClick"])
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                _: 1
                /* STABLE */
              })
            ]),
            _: 1
            /* STABLE */
          }, 8, ["modelValue"]),
          vue.createElementVNode("div", { class: "plus_button" }, [
            vue.createVNode(_component_u_button, {
              type: "primary",
              onClick: _cache[3] || (_cache[3] = ($event) => $data.show = true)
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_u_icon, {
                  size: "14",
                  name: "plus"
                })
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/QAQ/Desktop/rss_reading/pages/index/index.vue"]]);
  const _sfc_main$1 = {};
  function _sfc_render(_ctx, _cache) {
    const _component_u_button = resolveEasycom(vue.resolveDynamicComponent("u-button"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "u-page" }, [
        vue.createVNode(_component_u_button, { type: "success" }, {
          default: vue.withCtx(() => [
            vue.createTextVNode("成功按钮")
          ]),
          _: 1
          /* STABLE */
        })
      ]),
      vue.createCommentVNode(" 与包裹页面所有内容的元素u-page同级，且在它的下方 "),
      vue.createCommentVNode(' <u-tabbar v-model="current" :list="list" :mid-button="true"></u-tabbar> ')
    ]);
  }
  const PagesMyMy = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/QAQ/Desktop/rss_reading/pages/my/my.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/my/my", PagesMyMy);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/QAQ/Desktop/rss_reading/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
