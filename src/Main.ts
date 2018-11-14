//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends eui.UILayer {


    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        });

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        };

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        };

        this.start().catch(e => {
            console.log(e);
        });
    }

    private async start() {
        await this.loadResource();
        this.createGameScene();
    }

    private async loadResource() {
        try {
            //注入自定义的素材解析器
            egret.registerImplementation("eui.IAssetAdapter", new AssetAdapter());
            egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

            // 加载默认资源配置
            await RES.loadConfig("resource/default.res.json", "resource/");

            // 加载主题（由于加载资源组中要用到 LoadingUI 的exml，所以需要先加载主题配置文件）
            await new Promise(resolve => new eui.Theme("resource/default.thm.json", this.stage)
                .addEventListener(eui.UIEvent.COMPLETE, resolve, this));

            // 加载资源组
            await new Promise(resolve => {
                // 显示loadingUI
                const loadingUI = new uis.LoadingUI();
                this.addChild(loadingUI);
                // 立即重绘loadingUI，否则之后获取宽度可能不正确
                loadingUI.validateNow();

                const data = loadingUI["data"] = {
                    maxWidth: (loadingUI["back"] as eui.Rect).width,
                    width: 0,
                    label: "0%"
                };

                // 更新加载进度
                const onProgress = (event:RES.ResourceEvent) => {
                    if (event.groupName == "preload") {
                        if (event.itemsTotal > 0) {
                            const progress = event.itemsLoaded / event.itemsTotal;
                            data.width = parseInt("" + data.maxWidth * progress);
                            data.label = parseInt("" + progress * 100) + "%";
                        }
                    }
                };
                RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, onProgress, this);

                // 开始加载资源组
                RES.loadGroup("preload").then(() => {
                    // 移除监听
                    RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, onProgress, this);
                    // 进度改为 100%
                    data.width = data.maxWidth;
                    data.label = "100%";
                    egret.Tween.get(loadingUI).to({
                        alpha: 0
                    }, 300).call(() => {
                        // loadingUI在300毫秒内fadeOut，然后移除
                        this.removeChild(loadingUI);
                        resolve();
                    });
                });
            });

        }
        catch (e) {
            console.error(e);
        }
    }

    protected createGameScene(): void {
        this.addChild(new Game2048());
    }

}
