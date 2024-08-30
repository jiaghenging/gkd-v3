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
  const ON_SHOW = "onShow";
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
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$9 = {
    name: "uniFormsItem",
    options: {
      virtualHost: true
    },
    provide() {
      return {
        uniFormItem: this
      };
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      }
    },
    props: {
      // 表单校验规则
      rules: {
        type: Array,
        default() {
          return null;
        }
      },
      // 表单域的属性名，在使用校验规则时必填
      name: {
        type: [String, Array],
        default: ""
      },
      required: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
        default: ""
      },
      // label的宽度 ，默认 80
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: ""
      },
      // 强制显示错误信息
      errorMessage: {
        type: [String, Boolean],
        default: ""
      },
      // 1.4.0 弃用，统一使用 form 的校验时机
      // validateTrigger: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 弃用，统一使用 form 的label 位置
      // labelPosition: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 以下属性已经废弃，请使用  #label 插槽代替
      leftIcon: String,
      iconColor: {
        type: String,
        default: "#606266"
      }
    },
    data() {
      return {
        errMsg: "",
        userRules: null,
        localLabelAlign: "left",
        localLabelWidth: "65px",
        localLabelPos: "left",
        border: false,
        isFirstBorder: false
      };
    },
    computed: {
      // 处理错误信息
      msg() {
        return this.errorMessage || this.errMsg;
      }
    },
    watch: {
      // 规则发生变化通知子组件更新
      "form.formRules"(val) {
        this.init();
      },
      "form.labelWidth"(val) {
        this.localLabelWidth = this._labelWidthUnit(val);
      },
      "form.labelPosition"(val) {
        this.localLabelPos = this._labelPosition();
      },
      "form.labelAlign"(val) {
      }
    },
    created() {
      this.init(true);
      if (this.name && this.form) {
        this.$watch(
          () => {
            const val = this.form._getDataValue(this.name, this.form.localData);
            return val;
          },
          (value, oldVal) => {
            const isEqual2 = this.form._isEqual(value, oldVal);
            if (!isEqual2) {
              const val = this.itemSetValue(value);
              this.onFieldChange(val, false);
            }
          },
          {
            immediate: false
          }
        );
      }
    },
    unmounted() {
      this.__isUnmounted = true;
      this.unInit();
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules = null) {
        this.userRules = rules;
        this.init(false);
      },
      // 兼容老版本表单组件
      setValue() {
      },
      /**
       * 外部调用方法
       * 校验数据
       * @param {any} value 需要校验的数据
       * @param {boolean} 是否立即校验
       * @return {Array|null} 校验内容
       */
      async onFieldChange(value, formtrigger = true) {
        const {
          formData,
          localData,
          errShowType,
          validateCheck,
          validateTrigger,
          _isRequiredField,
          _realName
        } = this.form;
        const name = _realName(this.name);
        if (!value) {
          value = this.form.formData[name];
        }
        const ruleLen = this.itemRules.rules && this.itemRules.rules.length;
        if (!this.validator || !ruleLen || ruleLen === 0)
          return;
        const isRequiredField2 = _isRequiredField(this.itemRules.rules || []);
        let result = null;
        if (validateTrigger === "bind" || formtrigger) {
          result = await this.validator.validateUpdate(
            {
              [name]: value
            },
            formData
          );
          if (!isRequiredField2 && (value === void 0 || value === "")) {
            result = null;
          }
          if (result && result.errorMessage) {
            if (errShowType === "undertext") {
              this.errMsg = !result ? "" : result.errorMessage;
            }
            if (errShowType === "toast") {
              uni.showToast({
                title: result.errorMessage || "校验错误",
                icon: "none"
              });
            }
            if (errShowType === "modal") {
              uni.showModal({
                title: "提示",
                content: result.errorMessage || "校验错误"
              });
            }
          } else {
            this.errMsg = "";
          }
          validateCheck(result ? result : null);
        } else {
          this.errMsg = "";
        }
        return result ? result : null;
      },
      /**
       * 初始组件数据
       */
      init(type = false) {
        const {
          validator,
          formRules,
          childrens,
          formData,
          localData,
          _realName,
          labelWidth,
          _getDataValue,
          _setDataValue
        } = this.form || {};
        this.localLabelAlign = this._justifyContent();
        this.localLabelWidth = this._labelWidthUnit(labelWidth);
        this.localLabelPos = this._labelPosition();
        this.form && type && childrens.push(this);
        if (!validator || !formRules)
          return;
        if (!this.form.isFirstBorder) {
          this.form.isFirstBorder = true;
          this.isFirstBorder = true;
        }
        if (this.group) {
          if (!this.group.isFirstBorder) {
            this.group.isFirstBorder = true;
            this.isFirstBorder = true;
          }
        }
        this.border = this.form.border;
        const name = _realName(this.name);
        const itemRule = this.userRules || this.rules;
        if (typeof formRules === "object" && itemRule) {
          formRules[name] = {
            rules: itemRule
          };
          validator.updateSchema(formRules);
        }
        const itemRules = formRules[name] || {};
        this.itemRules = itemRules;
        this.validator = validator;
        this.itemSetValue(_getDataValue(this.name, localData));
      },
      unInit() {
        if (this.form) {
          const {
            childrens,
            formData,
            _realName
          } = this.form;
          childrens.forEach((item, index) => {
            if (item === this) {
              this.form.childrens.splice(index, 1);
              delete formData[_realName(item.name)];
            }
          });
        }
      },
      // 设置item 的值
      itemSetValue(value) {
        const name = this.form._realName(this.name);
        const rules = this.itemRules.rules || [];
        const val = this.form._getValue(name, value, rules);
        this.form._setDataValue(name, this.form.formData, val);
        return val;
      },
      /**
       * 移除该表单项的校验结果
       */
      clearValidate() {
        this.errMsg = "";
      },
      // 是否显示星号
      _isRequired() {
        return this.required;
      },
      // 处理对齐方式
      _justifyContent() {
        if (this.form) {
          const {
            labelAlign
          } = this.form;
          let labelAli = this.labelAlign ? this.labelAlign : labelAlign;
          if (labelAli === "left")
            return "flex-start";
          if (labelAli === "center")
            return "center";
          if (labelAli === "right")
            return "flex-end";
        }
        return "flex-start";
      },
      // 处理 label宽度单位 ,继承父元素的值
      _labelWidthUnit(labelWidth) {
        return this.num2px(this.labelWidth ? this.labelWidth : labelWidth || (this.label ? 65 : "auto"));
      },
      // 处理 label 位置
      _labelPosition() {
        if (this.form)
          return this.form.labelPosition || "left";
        return "left";
      },
      /**
       * 触发时机
       * @param {Object} rule 当前规则内时机
       * @param {Object} itemRlue 当前组件时机
       * @param {Object} parentRule 父组件时机
       */
      isTrigger(rule, itemRlue, parentRule) {
        if (rule === "submit" || !rule) {
          if (rule === void 0) {
            if (itemRlue !== "bind") {
              if (!itemRlue) {
                return parentRule === "" ? "bind" : "submit";
              }
              return "submit";
            }
            return "bind";
          }
          return "submit";
        }
        return "bind";
      },
      num2px(num) {
        if (typeof num === "number") {
          return `${num}px`;
        }
        return num;
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-forms-item", ["is-direction-" + $data.localLabelPos, $data.border ? "uni-forms-item--border" : "", $data.border && $data.isFirstBorder ? "is-first-border" : ""]])
      },
      [
        vue.renderSlot(_ctx.$slots, "label", {}, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__label", { "no-label": !$props.label && !$props.required }]),
              style: vue.normalizeStyle({ width: $data.localLabelWidth, justifyContent: $data.localLabelAlign })
            },
            [
              $props.required ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "is-required"
              }, "*")) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($props.label),
                1
                /* TEXT */
              )
            ],
            6
            /* CLASS, STYLE */
          )
        ], true),
        vue.createElementVNode("view", { class: "uni-forms-item__content" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__error", { "msg--active": $options.msg }])
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($options.msg),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$6], ["__scopeId", "data-v-462874dd"], ["__file", "E:/jhstudy/gkd-v3/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue"]]);
  var pattern = {
    email: /^\S+?@\S+?\.\S+?$/,
    idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    url: new RegExp(
      "^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$",
      "i"
    )
  };
  const FORMAT_MAPPING = {
    "int": "integer",
    "bool": "boolean",
    "double": "number",
    "long": "number",
    "password": "string"
    // "fileurls": 'array'
  };
  function formatMessage(args, resources = "") {
    var defaultMessage = ["label"];
    defaultMessage.forEach((item) => {
      if (args[item] === void 0) {
        args[item] = "";
      }
    });
    let str = resources;
    for (let key in args) {
      let reg = new RegExp("{" + key + "}");
      str = str.replace(reg, args[key]);
    }
    return str;
  }
  function isEmptyValue(value, type) {
    if (value === void 0 || value === null) {
      return true;
    }
    if (typeof value === "string" && !value) {
      return true;
    }
    if (Array.isArray(value) && !value.length) {
      return true;
    }
    if (type === "object" && !Object.keys(value).length) {
      return true;
    }
    return false;
  }
  const types = {
    integer(value) {
      return types.number(value) && parseInt(value, 10) === value;
    },
    string(value) {
      return typeof value === "string";
    },
    number(value) {
      if (isNaN(value)) {
        return false;
      }
      return typeof value === "number";
    },
    "boolean": function(value) {
      return typeof value === "boolean";
    },
    "float": function(value) {
      return types.number(value) && !types.integer(value);
    },
    array(value) {
      return Array.isArray(value);
    },
    object(value) {
      return typeof value === "object" && !types.array(value);
    },
    date(value) {
      return value instanceof Date;
    },
    timestamp(value) {
      if (!this.integer(value) || Math.abs(value).toString().length > 16) {
        return false;
      }
      return true;
    },
    file(value) {
      return typeof value.url === "string";
    },
    email(value) {
      return typeof value === "string" && !!value.match(pattern.email) && value.length < 255;
    },
    url(value) {
      return typeof value === "string" && !!value.match(pattern.url);
    },
    pattern(reg, value) {
      try {
        return new RegExp(reg).test(value);
      } catch (e) {
        return false;
      }
    },
    method(value) {
      return typeof value === "function";
    },
    idcard(value) {
      return typeof value === "string" && !!value.match(pattern.idcard);
    },
    "url-https"(value) {
      return this.url(value) && value.startsWith("https://");
    },
    "url-scheme"(value) {
      return value.startsWith("://");
    },
    "url-web"(value) {
      return false;
    }
  };
  class RuleValidator {
    constructor(message) {
      this._message = message;
    }
    async validateRule(fieldKey, fieldValue, value, data, allData) {
      var result = null;
      let rules = fieldValue.rules;
      let hasRequired = rules.findIndex((item) => {
        return item.required;
      });
      if (hasRequired < 0) {
        if (value === null || value === void 0) {
          return result;
        }
        if (typeof value === "string" && !value.length) {
          return result;
        }
      }
      var message = this._message;
      if (rules === void 0) {
        return message["default"];
      }
      for (var i = 0; i < rules.length; i++) {
        let rule = rules[i];
        let vt = this._getValidateType(rule);
        Object.assign(rule, {
          label: fieldValue.label || `["${fieldKey}"]`
        });
        if (RuleValidatorHelper[vt]) {
          result = RuleValidatorHelper[vt](rule, value, message);
          if (result != null) {
            break;
          }
        }
        if (rule.validateExpr) {
          let now = Date.now();
          let resultExpr = rule.validateExpr(value, allData, now);
          if (resultExpr === false) {
            result = this._getMessage(rule, rule.errorMessage || this._message["default"]);
            break;
          }
        }
        if (rule.validateFunction) {
          result = await this.validateFunction(rule, value, data, allData, vt);
          if (result !== null) {
            break;
          }
        }
      }
      if (result !== null) {
        result = message.TAG + result;
      }
      return result;
    }
    async validateFunction(rule, value, data, allData, vt) {
      let result = null;
      try {
        let callbackMessage = null;
        const res = await rule.validateFunction(rule, value, allData || data, (message) => {
          callbackMessage = message;
        });
        if (callbackMessage || typeof res === "string" && res || res === false) {
          result = this._getMessage(rule, callbackMessage || res, vt);
        }
      } catch (e) {
        result = this._getMessage(rule, e.message, vt);
      }
      return result;
    }
    _getMessage(rule, message, vt) {
      return formatMessage(rule, message || rule.errorMessage || this._message[vt] || message["default"]);
    }
    _getValidateType(rule) {
      var result = "";
      if (rule.required) {
        result = "required";
      } else if (rule.format) {
        result = "format";
      } else if (rule.arrayType) {
        result = "arrayTypeFormat";
      } else if (rule.range) {
        result = "range";
      } else if (rule.maximum !== void 0 || rule.minimum !== void 0) {
        result = "rangeNumber";
      } else if (rule.maxLength !== void 0 || rule.minLength !== void 0) {
        result = "rangeLength";
      } else if (rule.pattern) {
        result = "pattern";
      } else if (rule.validateFunction) {
        result = "validateFunction";
      }
      return result;
    }
  }
  const RuleValidatorHelper = {
    required(rule, value, message) {
      if (rule.required && isEmptyValue(value, rule.format || typeof value)) {
        return formatMessage(rule, rule.errorMessage || message.required);
      }
      return null;
    },
    range(rule, value, message) {
      const {
        range,
        errorMessage
      } = rule;
      let list = new Array(range.length);
      for (let i = 0; i < range.length; i++) {
        const item = range[i];
        if (types.object(item) && item.value !== void 0) {
          list[i] = item.value;
        } else {
          list[i] = item;
        }
      }
      let result = false;
      if (Array.isArray(value)) {
        result = new Set(value.concat(list)).size === list.length;
      } else {
        if (list.indexOf(value) > -1) {
          result = true;
        }
      }
      if (!result) {
        return formatMessage(rule, errorMessage || message["enum"]);
      }
      return null;
    },
    rangeNumber(rule, value, message) {
      if (!types.number(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let {
        minimum,
        maximum,
        exclusiveMinimum,
        exclusiveMaximum
      } = rule;
      let min = exclusiveMinimum ? value <= minimum : value < minimum;
      let max = exclusiveMaximum ? value >= maximum : value > maximum;
      if (minimum !== void 0 && min) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMinimum ? "exclusiveMinimum" : "minimum"]);
      } else if (maximum !== void 0 && max) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMaximum ? "exclusiveMaximum" : "maximum"]);
      } else if (minimum !== void 0 && maximum !== void 0 && (min || max)) {
        return formatMessage(rule, rule.errorMessage || message["number"].range);
      }
      return null;
    },
    rangeLength(rule, value, message) {
      if (!types.string(value) && !types.array(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let min = rule.minLength;
      let max = rule.maxLength;
      let val = value.length;
      if (min !== void 0 && val < min) {
        return formatMessage(rule, rule.errorMessage || message["length"].minLength);
      } else if (max !== void 0 && val > max) {
        return formatMessage(rule, rule.errorMessage || message["length"].maxLength);
      } else if (min !== void 0 && max !== void 0 && (val < min || val > max)) {
        return formatMessage(rule, rule.errorMessage || message["length"].range);
      }
      return null;
    },
    pattern(rule, value, message) {
      if (!types["pattern"](rule.pattern, value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      return null;
    },
    format(rule, value, message) {
      var customTypes = Object.keys(types);
      var format = FORMAT_MAPPING[rule.format] ? FORMAT_MAPPING[rule.format] : rule.format || rule.arrayType;
      if (customTypes.indexOf(format) > -1) {
        if (!types[format](value)) {
          return formatMessage(rule, rule.errorMessage || message.typeError);
        }
      }
      return null;
    },
    arrayTypeFormat(rule, value, message) {
      if (!Array.isArray(value)) {
        return formatMessage(rule, rule.errorMessage || message.typeError);
      }
      for (let i = 0; i < value.length; i++) {
        const element = value[i];
        let formatResult = this.format(rule, element, message);
        if (formatResult !== null) {
          return formatResult;
        }
      }
      return null;
    }
  };
  class SchemaValidator extends RuleValidator {
    constructor(schema, options) {
      super(SchemaValidator.message);
      this._schema = schema;
      this._options = options || null;
    }
    updateSchema(schema) {
      this._schema = schema;
    }
    async validate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async validateAll(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, true, allData);
      }
      return result;
    }
    async validateUpdate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidateUpdate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async invokeValidate(data, all, allData) {
      let result = [];
      let schema = this._schema;
      for (let key in schema) {
        let value = schema[key];
        let errorMessage = await this.validateRule(key, value, data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    async invokeValidateUpdate(data, all, allData) {
      let result = [];
      for (let key in data) {
        let errorMessage = await this.validateRule(key, this._schema[key], data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    _checkFieldInSchema(data) {
      var keys = Object.keys(data);
      var keys2 = Object.keys(this._schema);
      if (new Set(keys.concat(keys2)).size === keys2.length) {
        return "";
      }
      var noExistFields = keys.filter((key) => {
        return keys2.indexOf(key) < 0;
      });
      var errorMessage = formatMessage({
        field: JSON.stringify(noExistFields)
      }, SchemaValidator.message.TAG + SchemaValidator.message["defaultInvalid"]);
      return [{
        key: "invalid",
        errorMessage
      }];
    }
  }
  function Message() {
    return {
      TAG: "",
      default: "验证错误",
      defaultInvalid: "提交的字段{field}在数据库中并不存在",
      validateFunction: "验证无效",
      required: "{label}必填",
      "enum": "{label}超出范围",
      timestamp: "{label}格式无效",
      whitespace: "{label}不能为空",
      typeError: "{label}类型无效",
      date: {
        format: "{label}日期{value}格式无效",
        parse: "{label}日期无法解析,{value}无效",
        invalid: "{label}日期{value}无效"
      },
      length: {
        minLength: "{label}长度不能少于{minLength}",
        maxLength: "{label}长度不能超过{maxLength}",
        range: "{label}必须介于{minLength}和{maxLength}之间"
      },
      number: {
        minimum: "{label}不能小于{minimum}",
        maximum: "{label}不能大于{maximum}",
        exclusiveMinimum: "{label}不能小于等于{minimum}",
        exclusiveMaximum: "{label}不能大于等于{maximum}",
        range: "{label}必须介于{minimum}and{maximum}之间"
      },
      pattern: {
        mismatch: "{label}格式不匹配"
      }
    };
  }
  SchemaValidator.message = new Message();
  const deepCopy = (val) => {
    return JSON.parse(JSON.stringify(val));
  };
  const typeFilter = (format) => {
    return format === "int" || format === "double" || format === "number" || format === "timestamp";
  };
  const getValue = (key, value, rules) => {
    const isRuleNumType = rules.find((val) => val.format && typeFilter(val.format));
    const isRuleBoolType = rules.find((val) => val.format && val.format === "boolean" || val.format === "bool");
    if (!!isRuleNumType) {
      if (!value && value !== 0) {
        value = null;
      } else {
        value = isNumber(Number(value)) ? Number(value) : value;
      }
    }
    if (!!isRuleBoolType) {
      value = isBoolean(value) ? value : false;
    }
    return value;
  };
  const setDataValue = (field, formdata, value) => {
    formdata[field] = value;
    return value || "";
  };
  const getDataValue = (field, data) => {
    return objGet(data, field);
  };
  const realName = (name, data = {}) => {
    const base_name = _basePath(name);
    if (typeof base_name === "object" && Array.isArray(base_name) && base_name.length > 1) {
      const realname = base_name.reduce((a, b) => a += `#${b}`, "_formdata_");
      return realname;
    }
    return base_name[0] || name;
  };
  const isRealName = (name) => {
    const reg = /^_formdata_#*/;
    return reg.test(name);
  };
  const rawData = (object = {}, name) => {
    let newData = JSON.parse(JSON.stringify(object));
    let formData = {};
    for (let i in newData) {
      let path = name2arr(i);
      objSet(formData, path, newData[i]);
    }
    return formData;
  };
  const name2arr = (name) => {
    let field = name.replace("_formdata_#", "");
    field = field.split("#").map((v) => isNumber(v) ? Number(v) : v);
    return field;
  };
  const objSet = (object, path, value) => {
    if (typeof object !== "object")
      return object;
    _basePath(path).reduce((o, k, i, _) => {
      if (i === _.length - 1) {
        o[k] = value;
        return null;
      } else if (k in o) {
        return o[k];
      } else {
        o[k] = /^[0-9]{1,}$/.test(_[i + 1]) ? [] : {};
        return o[k];
      }
    }, object);
    return object;
  };
  function _basePath(path) {
    if (Array.isArray(path))
      return path;
    return path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
  }
  const objGet = (object, path, defaultVal = "undefined") => {
    let newPath = _basePath(path);
    let val = newPath.reduce((o, k) => {
      return (o || {})[k];
    }, object);
    return !val || val !== void 0 ? val : defaultVal;
  };
  const isNumber = (num) => {
    return !isNaN(Number(num));
  };
  const isBoolean = (bool) => {
    return typeof bool === "boolean";
  };
  const isRequiredField = (rules) => {
    let isNoField = false;
    for (let i = 0; i < rules.length; i++) {
      const ruleData = rules[i];
      if (ruleData.required) {
        isNoField = true;
        break;
      }
    }
    return isNoField;
  };
  const isEqual = (a, b) => {
    if (a === b) {
      return a !== 0 || 1 / a === 1 / b;
    }
    if (a == null || b == null) {
      return a === b;
    }
    var classNameA = toString.call(a), classNameB = toString.call(b);
    if (classNameA !== classNameB) {
      return false;
    }
    switch (classNameA) {
      case "[object RegExp]":
      case "[object String]":
        return "" + a === "" + b;
      case "[object Number]":
        if (+a !== +a) {
          return +b !== +b;
        }
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case "[object Date]":
      case "[object Boolean]":
        return +a === +b;
    }
    if (classNameA == "[object Object]") {
      var propsA = Object.getOwnPropertyNames(a), propsB = Object.getOwnPropertyNames(b);
      if (propsA.length != propsB.length) {
        return false;
      }
      for (var i = 0; i < propsA.length; i++) {
        var propName = propsA[i];
        if (a[propName] !== b[propName]) {
          return false;
        }
      }
      return true;
    }
    if (classNameA == "[object Array]") {
      if (a.toString() == b.toString()) {
        return true;
      }
      return false;
    }
  };
  const _sfc_main$8 = {
    name: "uniForms",
    emits: ["validate", "submit"],
    options: {
      virtualHost: true
    },
    props: {
      // 即将弃用
      value: {
        type: Object,
        default() {
          return null;
        }
      },
      // vue3 替换 value 属性
      modelValue: {
        type: Object,
        default() {
          return null;
        }
      },
      // 1.4.0 开始将不支持 v-model ，且废弃 value 和 modelValue
      model: {
        type: Object,
        default() {
          return null;
        }
      },
      // 表单校验规则
      rules: {
        type: Object,
        default() {
          return {};
        }
      },
      //校验错误信息提示方式 默认 undertext 取值 [undertext|toast|modal]
      errShowType: {
        type: String,
        default: "undertext"
      },
      // 校验触发器方式 默认 bind 取值 [bind|submit]
      validateTrigger: {
        type: String,
        default: "submit"
      },
      // label 位置，默认 left 取值  top/left
      labelPosition: {
        type: String,
        default: "left"
      },
      // label 宽度
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: "left"
      },
      border: {
        type: Boolean,
        default: false
      }
    },
    provide() {
      return {
        uniForm: this
      };
    },
    data() {
      return {
        // 表单本地值的记录，不应该与传如的值进行关联
        formData: {},
        formRules: {}
      };
    },
    computed: {
      // 计算数据源变化的
      localData() {
        const localVal = this.model || this.modelValue || this.value;
        if (localVal) {
          return deepCopy(localVal);
        }
        return {};
      }
    },
    watch: {
      // 监听数据变化 ,暂时不使用，需要单独赋值
      // localData: {},
      // 监听规则变化
      rules: {
        handler: function(val, oldVal) {
          this.setRules(val);
        },
        deep: true,
        immediate: true
      }
    },
    created() {
      let getbinddata = getApp().$vm.$.appContext.config.globalProperties.binddata;
      if (!getbinddata) {
        getApp().$vm.$.appContext.config.globalProperties.binddata = function(name, value, formName) {
          if (formName) {
            this.$refs[formName].setValue(name, value);
          } else {
            let formVm;
            for (let i in this.$refs) {
              const vm = this.$refs[i];
              if (vm && vm.$options && vm.$options.name === "uniForms") {
                formVm = vm;
                break;
              }
            }
            if (!formVm)
              return formatAppLog("error", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:182", "当前 uni-froms 组件缺少 ref 属性");
            formVm.setValue(name, value);
          }
        };
      }
      this.childrens = [];
      this.inputChildrens = [];
      this.setRules(this.rules);
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules) {
        this.formRules = Object.assign({}, this.formRules, rules);
        this.validator = new SchemaValidator(rules);
      },
      /**
       * 外部调用方法
       * 设置数据，用于设置表单数据，公开给用户使用 ， 不支持在动态表单中使用
       * @param {Object} key
       * @param {Object} value
       */
      setValue(key, value) {
        let example = this.childrens.find((child) => child.name === key);
        if (!example)
          return null;
        this.formData[key] = getValue(key, value, this.formRules[key] && this.formRules[key].rules || []);
        return example.onFieldChange(this.formData[key]);
      },
      /**
       * 外部调用方法
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      validate(keepitem, callback) {
        return this.checkAll(this.formData, keepitem, callback);
      },
      /**
       * 外部调用方法
       * 部分表单校验
       * @param {Array|String} props 需要校验的字段
       * @param {Function} 回调函数
       */
      validateField(props = [], callback) {
        props = [].concat(props);
        let invalidFields = {};
        this.childrens.forEach((item) => {
          const name = realName(item.name);
          if (props.indexOf(name) !== -1) {
            invalidFields = Object.assign({}, invalidFields, {
              [name]: this.formData[name]
            });
          }
        });
        return this.checkAll(invalidFields, [], callback);
      },
      /**
       * 外部调用方法
       * 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
       * @param {Array|String} props 需要移除校验的字段 ，不填为所有
       */
      clearValidate(props = []) {
        props = [].concat(props);
        this.childrens.forEach((item) => {
          if (props.length === 0) {
            item.errMsg = "";
          } else {
            const name = realName(item.name);
            if (props.indexOf(name) !== -1) {
              item.errMsg = "";
            }
          }
        });
      },
      /**
       * 外部调用方法 ，即将废弃
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      submit(keepitem, callback, type) {
        for (let i in this.dataValue) {
          const itemData = this.childrens.find((v) => v.name === i);
          if (itemData) {
            if (this.formData[i] === void 0) {
              this.formData[i] = this._getValue(i, this.dataValue[i]);
            }
          }
        }
        if (!type) {
          formatAppLog("warn", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:289", "submit 方法即将废弃，请使用validate方法代替！");
        }
        return this.checkAll(this.formData, keepitem, callback, "submit");
      },
      // 校验所有
      async checkAll(invalidFields, keepitem, callback, type) {
        if (!this.validator)
          return;
        let childrens = [];
        for (let i in invalidFields) {
          const item = this.childrens.find((v) => realName(v.name) === i);
          if (item) {
            childrens.push(item);
          }
        }
        if (!callback && typeof keepitem === "function") {
          callback = keepitem;
        }
        let promise;
        if (!callback && typeof callback !== "function" && Promise) {
          promise = new Promise((resolve, reject) => {
            callback = function(valid, invalidFields2) {
              !valid ? resolve(invalidFields2) : reject(valid);
            };
          });
        }
        let results = [];
        let tempFormData = JSON.parse(JSON.stringify(invalidFields));
        for (let i in childrens) {
          const child = childrens[i];
          let name = realName(child.name);
          const result = await child.onFieldChange(tempFormData[name]);
          if (result) {
            results.push(result);
            if (this.errShowType === "toast" || this.errShowType === "modal")
              break;
          }
        }
        if (Array.isArray(results)) {
          if (results.length === 0)
            results = null;
        }
        if (Array.isArray(keepitem)) {
          keepitem.forEach((v) => {
            let vName = realName(v);
            let value = getDataValue(v, this.localData);
            if (value !== void 0) {
              tempFormData[vName] = value;
            }
          });
        }
        if (type === "submit") {
          this.$emit("submit", {
            detail: {
              value: tempFormData,
              errors: results
            }
          });
        } else {
          this.$emit("validate", results);
        }
        let resetFormData = {};
        resetFormData = rawData(tempFormData, this.name);
        callback && typeof callback === "function" && callback(results, resetFormData);
        if (promise && callback) {
          return promise;
        } else {
          return null;
        }
      },
      /**
       * 返回validate事件
       * @param {Object} result
       */
      validateCheck(result) {
        this.$emit("validate", result);
      },
      _getValue: getValue,
      _isRequiredField: isRequiredField,
      _setDataValue: setDataValue,
      _getDataValue: getDataValue,
      _realName: realName,
      _isRealName: isRealName,
      _isEqual: isEqual
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-forms" }, [
      vue.createElementVNode("form", null, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ])
    ]);
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$5], ["__scopeId", "data-v-9a1e3c32"], ["__file", "E:/jhstudy/gkd-v3/uni_modules/uni-forms/components/uni-forms/uni-forms.vue"]]);
  let url_config = "http://192.168.0.43:8090";
  function request(url, method, data) {
    let header = {
      "content-type": "application/json"
    };
    let token = uni.getStorageSync("Authorization");
    if (token) {
      formatAppLog("log", "at utils/request.js:10", "token", token);
      header.Authorization = token;
    }
    return new Promise((resolve, reject) => {
      let fullUrl = url_config + url;
      uni.request({
        url: fullUrl,
        data,
        method,
        header,
        success: (res) => {
          formatAppLog("log", "at utils/request.js:21", "11111");
          resolve(res.data);
        },
        fail: (err) => {
          formatAppLog("log", "at utils/request.js:25", "2222");
          reject(err);
        }
      });
    });
  }
  function login(params) {
    return request(
      "/login",
      "POST",
      params
    );
  }
  const _sfc_main$7 = {
    __name: "login",
    setup(__props) {
      const videoRef = vue.ref("");
      onShow(() => {
        formatAppLog("log", "at pages/login/login.vue:59", videoRef.value);
      });
      vue.onMounted(() => {
        formatAppLog("log", "at pages/login/login.vue:62", videoRef.value);
      });
      const rules = {
        // 对name字段进行必填验证
        userId: {
          rules: [
            {
              required: true,
              errorMessage: "请输入姓名"
            },
            {
              minLength: 3,
              maxLength: 15,
              errorMessage: "姓名长度在 {minLength} 到 {maxLength} 个字符"
            }
          ]
        },
        // 对email字段进行必填验证
        userPwd: {
          rules: [
            {
              required: true,
              errorMessage: "请输入密码"
            },
            {
              minLength: 6,
              maxLength: 14,
              errorMessage: "密码长度在 {minLength} 到 {maxLength} 个字符"
            }
          ]
        }
      };
      vue.ref("");
      const userForm = vue.reactive({
        userId: "admin",
        userPwd: "admin123"
      });
      function toLogin() {
        formatAppLog("log", "at pages/login/login.vue:100", "ssss");
        let data = {
          userid: userForm.userId,
          userpwd: userForm.userPwd,
          username: "未设置昵称"
        };
        login(data).then((res) => {
          formatAppLog("log", "at pages/login/login.vue:107", res);
          if (res.code == 200) {
            uni.showToast({
              title: "登录成功",
              duration: 1500,
              icon: "none"
            });
            let userMsg = {
              userid: res.userid,
              username: res.username,
              yystate: res.yystate,
              token: res.token
            };
            uni.setStorage({
              key: "Authorization",
              data: res.token,
              success() {
                formatAppLog("log", "at pages/login/login.vue:124", "成功保存");
              }
            });
            uni.setStorage({
              key: "user_msg",
              data: userMsg,
              success() {
                setTimeout(() => {
                  uni.switchTab({
                    url: "../index/index"
                  });
                }, 1500);
              }
            });
          }
        }).catch((err) => {
          formatAppLog("log", "at pages/login/login.vue:141", err);
        });
      }
      const formRef = vue.ref(null);
      const ifAgree = vue.ref(true);
      function checkForm() {
        formatAppLog("log", "at pages/login/login.vue:148", formRef.value);
        if (ifAgree.value) {
          formRef.value.validate().then((res) => {
            toLogin();
          }).catch((err) => {
            formatAppLog("log", "at pages/login/login.vue:154", "失败：", err);
          });
        } else {
          uni.showToast({
            title: "请勾选同意后再进行登录奥~",
            duration: 1500,
            icon: "none"
          });
        }
      }
      vue.onMounted(() => {
        uni.getStorage({
          key: "user_msg",
          success: function(res) {
            if (res.data != "" && res.data != null) {
              uni.switchTab({
                url: "../index/index"
              });
            }
          }
        });
      });
      return (_ctx, _cache) => {
        const _component_uni_forms_item = resolveEasycom(vue.resolveDynamicComponent("uni-forms-item"), __easycom_0$2);
        const _component_uni_forms = resolveEasycom(vue.resolveDynamicComponent("uni-forms"), __easycom_2);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "status_bar" }, [
            vue.createCommentVNode(" 这里是状态栏 ")
          ]),
          vue.createElementVNode("view", { class: "login_container" }, [
            vue.createElementVNode("view", { class: "formBox" }, [
              vue.createElementVNode("text", { class: "login_title" }, "Hi , 你好啊"),
              vue.createVNode(_component_uni_forms, {
                ref_key: "formRef",
                ref: formRef,
                modelValue: userForm,
                rules,
                class: "login_form"
              }, {
                default: vue.withCtx(() => [
                  vue.createVNode(_component_uni_forms_item, { name: "userId" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "inputBox" }, [
                        vue.withDirectives(vue.createElementVNode(
                          "input",
                          {
                            type: "text",
                            placeholder: "请输入用户名",
                            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => userForm.userId = $event),
                            "placeholder-class": "input_style"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vue.vModelText, userForm.userId]
                        ])
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  vue.createVNode(_component_uni_forms_item, { name: "userPwd" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "inputBox" }, [
                        vue.withDirectives(vue.createElementVNode(
                          "input",
                          {
                            type: "text",
                            placeholder: "请输入密码",
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => userForm.userPwd = $event),
                            password: "true",
                            "placeholder-class": "input_style"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vue.vModelText, userForm.userPwd]
                        ])
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  vue.createVNode(_component_uni_forms_item, { name: "ifAgree" }, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "form_agrement" }, [
                        vue.createElementVNode("view", {
                          class: "checked_box",
                          onClick: _cache[2] || (_cache[2] = ($event) => ifAgree.value = !ifAgree.value)
                        }, [
                          vue.withDirectives(vue.createElementVNode(
                            "view",
                            { class: "agre_circle" },
                            null,
                            512
                            /* NEED_PATCH */
                          ), [
                            [vue.vShow, ifAgree.value == false]
                          ]),
                          vue.withDirectives(vue.createElementVNode(
                            "view",
                            { class: "agre_circle2" },
                            [
                              vue.createElementVNode("text", { class: "iconfont icon-check" })
                            ],
                            512
                            /* NEED_PATCH */
                          ), [
                            [vue.vShow, ifAgree.value == true]
                          ])
                        ]),
                        vue.createElementVNode("text", { class: "agre_txt" }, [
                          vue.createTextVNode(" 我已阅读并同意 "),
                          vue.createElementVNode("text", {
                            class: "agreement_info",
                            onClick: _cache[3] || (_cache[3] = ($event) => _ctx.toAgreement(1))
                          }, "用户协议"),
                          vue.createTextVNode(" 及 "),
                          vue.createElementVNode("text", {
                            class: "agreement_info",
                            onClick: _cache[4] || (_cache[4] = ($event) => _ctx.toAgreement(2))
                          }, "隐私政策")
                        ])
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  }),
                  vue.createVNode(_component_uni_forms_item, null, {
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", {
                        class: "login_btn",
                        onClick: _cache[5] || (_cache[5] = ($event) => checkForm())
                      }, "登录/注册")
                    ]),
                    _: 1
                    /* STABLE */
                  })
                ]),
                _: 1
                /* STABLE */
              }, 8, ["modelValue"])
            ])
          ])
        ]);
      };
    }
  };
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__file", "E:/jhstudy/gkd-v3/pages/login/login.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$6 = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i in styles) {
          let line = this.toLine(i);
          transform += line + ":" + styles[i] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i in obj) {
          try {
            if (typeof obj[i] === "object") {
              this.animation[i](...obj[i]);
            } else {
              this.animation[i](obj[i]);
            }
          } catch (e) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:143", `方法 ${i} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 1 : 0,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.isShow || $props.onceRender ? vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$4], ["__file", "E:/jhstudy/gkd-v3/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$5 = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: this.isDesktop ? "fixforpc-top" : "top"
      };
    },
    computed: {
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible() {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:279", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$1);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle({ backgroundColor: $options.bg }),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$3], ["__scopeId", "data-v-4dd3c44b"], ["__file", "E:/jhstudy/gkd-v3/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  function postMsg(url, params) {
    return request(
      url,
      "POST",
      params
    );
  }
  function getMsg(url, params) {
    return request(
      url,
      "GET",
      params
    );
  }
  const _sfc_main$4 = {
    __name: "index",
    setup(__props) {
      const messageList = vue.ref([]);
      const ifCanCLick = vue.ref(true);
      const ifShowMsg = vue.ref(true);
      const wb = vue.reactive({});
      vue.ref("Hello");
      const userMsg = vue.ref("");
      const user_yystate = vue.ref(0);
      const haveNew = vue.ref(false);
      const msgnum = vue.ref(0);
      const groupMsg = vue.ref([{
        id: "1",
        num: 5,
        master: {
          masterid: "jianghenging",
          mastername: "HEXA丶JH"
        },
        teammsg: [
          {
            id: "1",
            name: "慢慢当第一"
          },
          {
            id: "",
            name: ""
          },
          {
            id: "",
            name: ""
          },
          {
            id: "",
            name: ""
          }
        ]
      }]);
      onShow(() => {
        uni.getStorage({
          key: "user_msg",
          success: function(res) {
            userMsg.value = res.data;
          }
        });
        let yystateP = checkyystate();
        yystateP.then((res) => {
          user_yystate.value = res;
        }).catch((err) => {
          user_yystate.value = err;
        });
        getYyList();
        checkMessage();
      });
      const delMsg = function(currentIndex) {
        if (ifCanCLick.value)
          ;
      };
      const showMessageList = function() {
        ifShowMsg.value = false;
      };
      const closeMessage = function() {
        ifShowMsg.value = true;
      };
      const checkMessage = function() {
        postMsg("/getmessagelist", {
          userid: userMsg.value.userid
        }).then((res) => {
          if (res.data.length > 0) {
            haveNew.value = true;
            msgnum.value = res.data.length;
            messageList.value = res.data;
            formatAppLog("log", "at pages/index/index.vue:173", messageList.value);
          }
        });
      };
      const ifMaster = function() {
        let ifhase = false;
        groupMsg.value.forEach((item, index) => {
          formatAppLog("log", "at pages/index/index.vue:189", item.master.masterid);
          if (item.master.masterid == userMsg.value.userid) {
            ifhase = true;
          }
        });
        ifShowMsg.value ? ifhase = true : ifhase = false;
        return ifhase;
      };
      const outYy = function(currentYyid, currentYyIndex, currentTmsg, masterId) {
        let tmsg = currentTmsg.filter((item) => item.id != userMsg.value.userid);
        tmsg.push({
          id: "",
          name: ""
        });
        let tmsg_json = JSON.parse(JSON.stringify(tmsg));
        for (let i = 0; i < tmsg_json.length; i++) {
          tmsg_json[i] = JSON.stringify(tmsg_json[i]);
        }
        formatAppLog("log", "at pages/index/index.vue:207", tmsg_json);
        uni.showModal({
          title: "提示",
          content: "确认退出该预约?",
          success: function(res) {
            if (res.confirm) {
              let outYyP = sureOutYy(JSON.stringify(tmsg_json), currentYyid);
              outYyP.then((outres) => {
                formatAppLog("log", "at pages/index/index.vue:215", outres);
                user_yystate.value = 0;
                groupMsg[currentYyIndex].teammsg = tmsg;
                wb.send({
                  data: JSON.stringify({
                    type: "1",
                    //2为删除
                    message: userMsg.value.username + "退出了您的房间",
                    masterId
                  })
                });
              }).catch((err) => {
                uni.showToast({
                  title: "退出预约失败,请稍后再试..",
                  duration: 1500,
                  icon: "error"
                });
              });
            } else if (res.cancel) {
              formatAppLog("log", "at pages/index/index.vue:234", "用户点击取消");
            }
          }
        });
      };
      const sureOutYy = function(tmsg, yyid) {
        return new Promise((resolve, reject) => {
          postMsg("/outyy", {
            teammsg: tmsg,
            yyid,
            userid: userMsg.value.userid
          }).then((res) => {
            formatAppLog("log", "at pages/index/index.vue:246", res);
            if (res.code == 200) {
              resolve(true);
            } else {
              reject(false);
            }
          });
        });
      };
      const ifhas = function(currentItem) {
        let ifthas = false;
        currentItem.teammsg.forEach((item, index) => {
          if (item.id == userMsg.value.userid) {
            ifthas = true;
          }
        });
        if (currentItem.id == userMsg.value.userid || ifthas == true) {
          return true;
        } else {
          return false;
        }
      };
      const addYuyue = function() {
        if (user_yystate.value == 0) {
          uni.navigateTo({
            url: "/pages/index/addyuyue"
          });
        } else {
          uni.showToast({
            title: "已经加入了一个预约,不可创建预约",
            duration: 1500,
            icon: "error"
          });
        }
      };
      const checkyystate = function() {
        return new Promise((resolve, reject) => {
          postMsg("/getyystate", {
            userid: userMsg.value.userid
          }).then((res) => {
            formatAppLog("log", "at pages/index/index.vue:288", res);
            if (res.code == 200 && res.data.data.yystate == 0) {
              resolve(0);
            } else {
              reject(1);
            }
          });
        });
      };
      const beforeJoin = function(groupId, {
        masterid: masterId,
        mastername: masterName
      }) {
        uni.showModal({
          title: "提示",
          content: "确认加入" + masterName + "的房间?",
          success: function(res) {
            if (res.confirm) {
              sureJoin(groupId, masterId);
            } else if (res.cancel) {
              formatAppLog("log", "at pages/index/index.vue:308", "用户点击取消");
            }
          }
        });
      };
      const sureJoin = function(groupId, masterId) {
        let theGroupMsg = groupMsg.filter((item) => item.id == groupId)[0];
        let lsp = new Promise((resolve, reject) => {
          if (user_yystate.value == 0) {
            for (let i = 0; i < theGroupMsg.teammsg.length; i++) {
              if (theGroupMsg.teammsg[i].id == "") {
                theGroupMsg.teammsg[i].id = userMsg.value.userid;
                theGroupMsg.teammsg[i].name = userMsg.value.username;
                return resolve(true);
              }
            }
          } else {
            reject(false);
          }
        });
        lsp.then((res) => {
          let tmsg = JSON.parse(JSON.stringify(theGroupMsg.teammsg));
          for (let i = 0; i < tmsg.length; i++) {
            tmsg[i] = JSON.stringify(tmsg[i]);
          }
          postMsg("/joinyuyue", {
            yid: groupId,
            teammsg: JSON.stringify(tmsg),
            userid: userMsg.value.userid
          }).then((res2) => {
            formatAppLog("log", "at pages/index/index.vue:338", res2);
            if (res2.code == 200) {
              user_yystate.value = 1;
              wb.send({
                data: JSON.stringify({
                  type: "1",
                  message: userMsg.value.username + "加入了您的房间",
                  masterId
                })
              });
              uni.showToast({
                title: "加入房间成功2",
                duration: 1500,
                icon: "success"
              });
            } else {
              uni.showToast({
                title: "加入房间失败",
                duration: 1500,
                icon: "success",
                success() {
                  setTimeout(() => {
                    getYyList();
                  }, 1500);
                }
              });
            }
          });
        }).catch((err) => {
          uni.showToast({
            title: "您已经加入过了",
            duration: 1500,
            icon: "error"
          });
        });
      };
      const getYyList = function() {
        getMsg("/getyylist").then((res) => {
          formatAppLog("log", "at pages/index/index.vue:380", res);
          if (res.code == 200) {
            let gmsg = res.data.data;
            gmsg.forEach((item, index) => {
              for (let i = 0; i < item.teammsg.length; i++) {
                let a = JSON.parse(item.teammsg[i]);
                item.teammsg[i] = a;
              }
            });
            groupMsg = gmsg;
          }
        });
      };
      return (_ctx, _cache) => {
        const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "status_bar" }, [
            vue.createCommentVNode(" 这里是状态栏 ")
          ]),
          vue.createElementVNode("view", { class: "bgBox" }, [
            vue.createElementVNode("view", { class: "zzc" }),
            vue.createElementVNode("image", {
              class: "bg-img",
              src: "/static/img/bg_login.jpg"
            })
          ]),
          vue.createElementVNode("view", { class: "yuyueListBox" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(groupMsg.value, (item_g, index_g) => {
                return vue.openBlock(), vue.createElementBlock("view", { class: "yyCard" }, [
                  vue.createElementVNode("view", { class: "yyCard_top" }, [
                    vue.createElementVNode("view", { class: "yy_master_img" }, [
                      vue.createElementVNode("image", {
                        src: "/static/img/yuyue/tx.png",
                        mode: ""
                      })
                    ]),
                    vue.createElementVNode("view", { class: "yy_master_txt" }, [
                      item_g.master ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "master_name"
                        },
                        "ID : " + vue.toDisplayString(item_g.master.mastername),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ]),
                    ifhas(item_g) ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "outyyBtn",
                      onClick: ($event) => outYy(item_g.id, index_g, item_g.teammsg, item_g.master.masterid)
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-tuichu" })
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createElementVNode("view", { class: "yyMsgBox" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "yymsg_title" },
                      vue.toDisplayString(item_g.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "groupBox" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(item_g.teammsg, (item_t, index_t) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            class: "group_item",
                            key: index_t
                          }, [
                            item_t.id == "" ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "joinBtn",
                              onClick: ($event) => beforeJoin(item_g.id, item_g.master)
                            }, [
                              vue.createElementVNode("text", { class: "iconfont icon-jiahao" })
                            ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                            item_t.id != "" ? (vue.openBlock(), vue.createElementBlock(
                              "view",
                              {
                                key: 1,
                                class: "g_item_name"
                              },
                              vue.toDisplayString(item_t.name),
                              1
                              /* TEXT */
                            )) : vue.createCommentVNode("v-if", true)
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ]);
              }),
              256
              /* UNKEYED_FRAGMENT */
            )),
            ifMaster() ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "btn_message",
              onClick: _cache[0] || (_cache[0] = ($event) => showMessageList())
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-xiaoxi" }),
              vue.withDirectives(vue.createElementVNode(
                "text",
                { class: "newMsgTip" },
                vue.toDisplayString(messageList.value.length),
                513
                /* TEXT, NEED_PATCH */
              ), [
                [vue.vShow, haveNew.value]
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", {
              class: "btn_addyy",
              onClick: _cache[1] || (_cache[1] = ($event) => addYuyue())
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-chuangjian" })
            ])
          ]),
          vue.createCommentVNode(" 弹出层 "),
          vue.createVNode(
            _component_uni_popup,
            {
              ref: "popup",
              "mask-click": false
            },
            {
              default: vue.withCtx(() => [
                vue.createElementVNode("view", { class: "msgListBox" }, [
                  vue.createElementVNode("view", {
                    class: "msg_close_btn",
                    onClick: _cache[2] || (_cache[2] = ($event) => closeMessage())
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-guanbi" })
                  ]),
                  vue.createElementVNode("view", { class: "msgList_content" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(messageList.value, (item, index) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "msgList_item",
                          key: index
                        }, [
                          vue.createElementVNode(
                            "view",
                            { class: "item_text" },
                            "标题:" + vue.toDisplayString(item),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("text", {
                            class: "iconfont icon-guanbi",
                            onClick: ($event) => delMsg()
                          }, null, 8, ["onClick"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            },
            512
            /* NEED_PATCH */
          )
        ]);
      };
    }
  };
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__file", "E:/jhstudy/gkd-v3/pages/index/index.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {};
    },
    methods: {
      loginOut() {
        uni.showModal({
          title: "提示",
          content: "是否退出登录?",
          success: function(res) {
            uni.setStorage({
              key: "user_msg",
              data: "",
              success() {
                if (res.confirm) {
                  uni.redirectTo({
                    url: "/pages/login/login"
                  });
                } else if (res.cancel) {
                  formatAppLog("log", "at pages/user/userinfo.vue:34", "用户点击取消");
                }
              }
            });
            uni.setStorageSync("Authorization", "");
          }
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "status_bar" }, [
        vue.createCommentVNode(" 这里是状态栏 ")
      ]),
      vue.createElementVNode("text", null, "个人中心"),
      vue.createElementVNode("view", {
        onClick: _cache[0] || (_cache[0] = ($event) => $options.loginOut())
      }, "退出登录")
    ]);
  }
  const PagesUserUserinfo = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "E:/jhstudy/gkd-v3/pages/user/userinfo.vue"]]);
  const _sfc_main$2 = {
    name: "UniNumberBox",
    emits: ["change", "input", "update:modelValue", "blur", "focus"],
    props: {
      value: {
        type: [Number, String],
        default: 1
      },
      modelValue: {
        type: [Number, String],
        default: 1
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100
      },
      step: {
        type: Number,
        default: 1
      },
      background: {
        type: String,
        default: "#f5f5f5"
      },
      color: {
        type: String,
        default: "#333"
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        inputValue: 0
      };
    },
    watch: {
      value(val) {
        this.inputValue = +val;
      },
      modelValue(val) {
        this.inputValue = +val;
      }
    },
    created() {
      if (this.value === 1) {
        this.inputValue = +this.modelValue;
      }
      if (this.modelValue === 1) {
        this.inputValue = +this.value;
      }
    },
    methods: {
      _calcValue(type) {
        if (this.disabled) {
          return;
        }
        const scale = this._getDecimalScale();
        let value = this.inputValue * scale;
        let step = this.step * scale;
        if (type === "minus") {
          value -= step;
          if (value < this.min * scale) {
            return;
          }
          if (value > this.max * scale) {
            value = this.max * scale;
          }
        }
        if (type === "plus") {
          value += step;
          if (value > this.max * scale) {
            return;
          }
          if (value < this.min * scale) {
            value = this.min * scale;
          }
        }
        this.inputValue = (value / scale).toFixed(String(scale).length - 1);
        this.$emit("change", +this.inputValue);
        this.$emit("input", +this.inputValue);
        this.$emit("update:modelValue", +this.inputValue);
      },
      _getDecimalScale() {
        let scale = 1;
        if (~~this.step !== this.step) {
          scale = Math.pow(10, String(this.step).split(".")[1].length);
        }
        return scale;
      },
      _onBlur(event) {
        this.$emit("blur", event);
        let value = event.detail.value;
        if (isNaN(value)) {
          this.inputValue = this.min;
          return;
        }
        value = +value;
        if (value > this.max) {
          value = this.max;
        } else if (value < this.min) {
          value = this.min;
        }
        const scale = this._getDecimalScale();
        this.inputValue = value.toFixed(String(scale).length - 1);
        this.$emit("change", +this.inputValue);
        this.$emit("input", +this.inputValue);
        this.$emit("update:modelValue", +this.inputValue);
      },
      _onFocus(event) {
        this.$emit("focus", event);
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-numbox" }, [
      vue.createElementVNode(
        "view",
        {
          onClick: _cache[0] || (_cache[0] = ($event) => $options._calcValue("minus")),
          class: "uni-numbox__minus uni-numbox-btns",
          style: vue.normalizeStyle({ background: $props.background })
        },
        [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-numbox--text", { "uni-numbox--disabled": $data.inputValue <= $props.min || $props.disabled }]),
              style: vue.normalizeStyle({ color: $props.color })
            },
            "-",
            6
            /* CLASS, STYLE */
          )
        ],
        4
        /* STYLE */
      ),
      vue.withDirectives(vue.createElementVNode("input", {
        disabled: $props.disabled,
        onFocus: _cache[1] || (_cache[1] = (...args) => $options._onFocus && $options._onFocus(...args)),
        onBlur: _cache[2] || (_cache[2] = (...args) => $options._onBlur && $options._onBlur(...args)),
        class: "uni-numbox__value",
        type: "number",
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.inputValue = $event),
        style: vue.normalizeStyle({ background: $props.background, color: $props.color })
      }, null, 44, ["disabled"]), [
        [vue.vModelText, $data.inputValue]
      ]),
      vue.createElementVNode(
        "view",
        {
          onClick: _cache[4] || (_cache[4] = ($event) => $options._calcValue("plus")),
          class: "uni-numbox__plus uni-numbox-btns",
          style: vue.normalizeStyle({ background: $props.background })
        },
        [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-numbox--text", { "uni-numbox--disabled": $data.inputValue >= $props.max || $props.disabled }]),
              style: vue.normalizeStyle({ color: $props.color })
            },
            "+",
            6
            /* CLASS, STYLE */
          )
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-7ae2ee72"], ["__file", "E:/jhstudy/gkd-v3/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        userMsg: {
          id: "",
          name: ""
        },
        rules: {
          // 对name字段进行必填验证
          title: {
            rules: [
              {
                required: true,
                errorMessage: "请输入标题"
              },
              {
                minLength: 1,
                maxLength: 20,
                errorMessage: "姓名长度在 {minLength} 到 {maxLength} 个字符"
              }
            ]
          }
        },
        iffbz: false,
        yy_form: {
          title: "",
          nums: 2
        }
      };
    },
    methods: {
      onNavigationBarButtonTap(e) {
        const that = this;
        if (e.text == "发布") {
          if (that.iffbz == false) {
            that.iffbz = true;
            that.checkForm();
          } else {
            uni.showToast({
              title: "莫着急,慢点点",
              duration: 1500,
              icon: "none"
            });
          }
        }
      },
      checkForm() {
        const that = this;
        that.$refs.yyform.validate().then((res) => {
          formatAppLog("log", "at pages/index/addyuyue.vue:67", that.yy_form);
          let date = /* @__PURE__ */ new Date();
          let time = date.getTime();
          let formmsg = {
            userid: that.userMsg.userid,
            title: that.yy_form.title,
            subtime: time,
            master: {
              masterid: that.userMsg.userid,
              mastername: that.userMsg.username
            },
            teammsg: [],
            nums: that.yy_form.nums
          };
          for (let i = 0; i < formmsg.nums - 1; i++) {
            formmsg.teammsg.push(JSON.stringify({ id: "", name: "" }));
          }
          formmsg.master = JSON.stringify(formmsg.master);
          formmsg.teammsg = JSON.stringify(formmsg.teammsg);
          formatAppLog("log", "at pages/index/addyuyue.vue:88", formmsg);
          uni.showModal({
            title: "提示",
            content: "立即发布预约?",
            success() {
              that.$api.postMsg("/addyy", formmsg).then((res2) => {
                formatAppLog("log", "at pages/index/addyuyue.vue:94", res2);
                if (res2.data.state == 0) {
                  uni.showToast({
                    title: res2.data.message,
                    duration: 1500,
                    icon: "success",
                    success() {
                      setTimeout(() => {
                        that.iffbz = false;
                        uni.switchTab({
                          url: "/pages/index/index"
                        });
                      }, 1500);
                    }
                  });
                } else {
                  that.iffbz = false;
                }
              });
            },
            fail() {
              that.iffbz = false;
            }
          });
        }).catch((err) => {
          formatAppLog("log", "at pages/index/addyuyue.vue:118", "失败：", err);
          that.iffbz = false;
        });
      }
    },
    onLoad() {
      const that = this;
      uni.getStorage({
        key: "user_msg",
        success: function(res) {
          that.userMsg = res.data;
        }
      });
      formatAppLog("log", "at pages/index/addyuyue.vue:132", that.userMsg);
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_forms_item = resolveEasycom(vue.resolveDynamicComponent("uni-forms-item"), __easycom_0$2);
    const _component_uni_number_box = resolveEasycom(vue.resolveDynamicComponent("uni-number-box"), __easycom_1);
    const _component_uni_forms = resolveEasycom(vue.resolveDynamicComponent("uni-forms"), __easycom_2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", { class: "formBox_yy" }, [
        vue.createVNode(_component_uni_forms, {
          ref: "yyform",
          rules: $data.rules,
          model: $data.yy_form
        }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_uni_forms_item, {
              label: "",
              name: "title"
            }, {
              default: vue.withCtx(() => [
                vue.createCommentVNode(' <inclass="yyForm_title"  auto-height placeholder-style="title_ph" placeholder="来个标题" /> '),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "yyForm_title",
                    type: "text",
                    "placeholder-style": "title_ph",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.yy_form.title = $event),
                    placeholder: "来个标题"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.yy_form.title]
                ])
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_uni_forms_item, {
              label: "人数:",
              name: "",
              class: "numsItem"
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_uni_number_box, {
                  min: 2,
                  max: 9,
                  modelValue: $data.yy_form.nums,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.yy_form.nums = $event)
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          _: 1
          /* STABLE */
        }, 8, ["rules", "model"])
      ])
    ]);
  }
  const PagesIndexAddyuyue = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "E:/jhstudy/gkd-v3/pages/index/addyuyue.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/user/userinfo", PagesUserUserinfo);
  __definePage("pages/index/addyuyue", PagesIndexAddyuyue);
  const _sfc_main = {
    globalData: {
      userMsg: {
        userid: "",
        username: "",
        yystate: 0
      }
    },
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:11", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:12", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:15", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:18", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/jhstudy/gkd-v3/App.vue"]]);
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
