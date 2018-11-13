"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var BricksPlugin = /** @class */ (function () {
    function BricksPlugin() {
    }
    BricksPlugin.prototype.onFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, contents, jsonData, content, _i, _a, item, _b, _c, item, content, result;
            return __generator(this, function (_d) {
                filename = file.basename;
                if (filename == 'manifest.json') {
                    contents = file.contents.toString();
                    jsonData = JSON.parse(contents);
                    content = '';
                    content += "BK.Script.loadlib(\"GameRes://js/promise.js\");\n";
                    for (_i = 0, _a = jsonData.initial; _i < _a.length; _i++) {
                        item = _a[_i];
                        if (item != 'js/promise.js' && item != 'js/promise.min.js') {
                            content += "BK.Script.loadlib(\"GameRes://" + item + "\");\n";
                        }
                    }
                    for (_b = 0, _c = jsonData.game; _b < _c.length; _b++) {
                        item = _c[_b];
                        content += "BK.Script.loadlib(\"GameRes://" + item + "\");\n";
                    }
                    content += "BK.Script.loadlib(\"GameRes://egret.bricks.js\");\n";
                    file.path = file.dirname + '/manifest.js';
                    file.contents = new Buffer(content);
                }
                else if (filename == 'main.js') {
                    content = file.contents.toString();
                    result = content.replace(/RES\.loadConfig\("resource\/default\.res\.json", "resource\/"\)/gm, 'RES.loadConfig("GameRes://resource/default.res.json", "GameRes://resource/")');
                    result = result.replace(/eui\.Theme\("resource\/default\.thm\.json", _this\.stage\)/gm, 'eui.Theme("GameRes://resource/default.thm.json", _this.stage)');
                    result += ";global.Main = Main;";
                    file.path = file.dirname + '/main.js';
                    file.contents = new Buffer(result);
                }
                else if (filename == 'promise.js') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, file];
            });
        });
    };
    BricksPlugin.prototype.onFinish = function (pluginContext) {
        return __awaiter(this, void 0, void 0, function () {
            var mainJSPath, mainJSContent, projectConfig;
            return __generator(this, function (_a) {
                mainJSPath = path.join(pluginContext.outputDir, 'main.js');
                mainJSContent = fs.readFileSync(mainJSPath, { encoding: "utf8" });
                projectConfig = pluginContext.buildConfig.projectConfig;
                mainJSContent = mainJSContent.replace(/frameRate: 30/gm, "frameRate: " + projectConfig.frameRate);
                mainJSContent = mainJSContent.replace(/contentWidth: 640/gm, "contentWidth: " + projectConfig.contentWidth);
                mainJSContent = mainJSContent.replace(/contentHeight: 1136/gm, "contentHeight: " + projectConfig.contentHeight);
                mainJSContent = mainJSContent.replace(/entryClassName: "Main"/gm, "entryClassName: " + projectConfig.entryClassName);
                mainJSContent = mainJSContent.replace(/scaleMode: "showAll"/gm, "scaleMode: " + projectConfig.scaleMode);
                mainJSContent = mainJSContent.replace(/orientation: "auto"/gm, "orientation: " + projectConfig.orientation);
                fs.writeFileSync(mainJSPath, mainJSContent);
                return [2 /*return*/];
            });
        });
    };
    return BricksPlugin;
}());
exports.BricksPlugin = BricksPlugin;
