
class Game2048 extends egret.DisplayObjectContainer {

    data = {
        isGameOver: false,
        isMerging: false,
        // 当前分数
        curScore: 0,
        // 历史最高分数
        bestScore: localStorage.getItem("Game2048.data.bestScore") || 0,
        // 方格框的大小
        panelSize: 0,
        // 方格框圆角大小
        panelRadius: 16,
        // 每个数字框的大小
        gridSize: 0,
        // 每个数字框的圆角大小
        gridRadius: 12,
        // 每个数字框的间隔
        gridSpacing: 16
    };

    private gameUI: uis.GameUI;

    private gameOver: eui.Group;

    private gridBox: eui.Group;

    private numGrids = new Array<NumGrid>(16);

    $onAddToStage(stage: egret.Stage, nestLevel: number): void {
        super.$onAddToStage(stage, nestLevel);
        this.initUI();
    }

    /**
     * 初始化游戏UI
     */
    private initUI() {
        const uiLayer = new eui.UILayer();
        this.addChild(uiLayer);

        // 通过 exml 初始化游戏场景
        this.gameUI = new uis.GameUI();
        // 绑定data
        this.gameUI["data"] = this.data;
        uiLayer.addChild(this.gameUI);

        // 获取两个开始新游戏的按钮，为其添加点击事件
        this.gameUI["newGame"].addEventListener(egret.TouchEvent.TOUCH_TAP, this.newGame, this);
        this.gameUI["newGameInGameOver"].addEventListener(egret.TouchEvent.TOUCH_TAP, this.newGame, this);

        // 获取游戏主面板，得到其大小，计算数字方格的大小
        this.gridBox = this.gameUI["gridBox"] as eui.Group;
        this.data.panelSize = this.gridBox.width;
        this.data.gridSize = parseInt("" + (this.data.panelSize - this.data.gridSpacing * 5) / 4);

        // 创建圆角方框作为游戏主背景
        this.gridBox.addChild(UiUtil.createRadiusSquare(
            0, 0, this.data.panelSize, this.data.panelRadius, 0xbbada0, 1));

        // 创建16个数字方格的静态背景
        for (let i = 0; i < 16; i++) {
            const row = parseInt("" + i % 4);
            const col = parseInt("" + i / 4);
            this.gridBox.addChild(
                UiUtil.createRadiusSquare(
                    this.data.gridSpacing + (this.data.gridSpacing + this.data.gridSize) * row,
                    this.data.gridSpacing + (this.data.gridSpacing + this.data.gridSize) * col,
                    this.data.gridSize, this.data.gridRadius, 0xeee4da, 0.35)
            );
        }

        // 为 gridBox 添加touch 监听
        const touchInfo = {
            x: 0,
            y: 0,
            finish: true
        };
        this.gridBox.addEventListener(egret.TouchEvent.TOUCH_BEGIN, event => {
            touchInfo.x = event.stageX;
            touchInfo.y = event.stageY;
            touchInfo.finish = false;
        }, this);
        this.gridBox.addEventListener(egret.TouchEvent.TOUCH_MOVE, event => {
            // 该滑动事件已被处理，不再继续处理
            if (touchInfo.finish) {
                return;
            }

            const deltaX = event.stageX - touchInfo.x;
            const deltaY = event.stageY - touchInfo.y;
            if (Math.abs(deltaX - deltaY) <= 40) {
                // 滑动方向还不明确，暂不处理
                return;
            }

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    // 向左滑动
                    this.leftMerge();
                }
                else {
                    // 向右滑动
                    this.rightMerge();
                }
            }
            else if (deltaY < 0) {
                // 向上滑动
                this.upMerge();
            }
            else {
                // 向下滑动
                this.downMerge();
            }
            touchInfo.finish = true;
        }, this);

        // 监听键盘按键弹起事件
        document.addEventListener("keyup", event => {
            let key = event.code;
            switch (key) {
                case "ArrowLeft":
                    this.leftMerge();
                    break;
                case "ArrowRight":
                    this.rightMerge();
                    break;
                case "ArrowUp":
                    this.upMerge();
                    break;
                case "ArrowDown":
                    this.downMerge();
                    break;
            }
        });

        this.gameOver = this.gameUI["gameOver"] as eui.Group;

        // 获取 exml 中定义的动画，并播放
        (this.gameUI["slidIn2048"] as egret.tween.TweenGroup).play();

        this.newGame();
    }

    newGame() {
        this.hideGameOver().then(() => {
           this.data.isGameOver = false;
           this.data.curScore = 0;
           this.resetNumGrids();
        });
    }

    /**
     * 重置数字方格
     */
    private resetNumGrids() {
        for (let i = 0, len = this.numGrids.length; i < len; i++) {
            let numGrid = this.numGrids[i];
            if (numGrid) {
                this.gridBox.removeChild(numGrid.grid);
                this.numGrids[i] = null;
            }
        }
        this.addNewNumGrids(2);
    }

    /**
     * 添加新的随机数字(2或4)方格
     * @param size
     */
    private addNewNumGrids(size: number) {
        const avas = this.availableGridPos(size);
        for (var i = 0, len = avas.length; i < len; i++) {
            let posIndex = avas[i];
            let row = parseInt("" + posIndex % 4);
            let col = parseInt("" + posIndex / 4);
            let numIndex = Math.random() < 0.8 ? 0 : 1;
            const numGrid = UiUtil.createNumGrid(numIndex, row, col,
                this.data.gridSize, this.data.gridRadius, this.data.gridSpacing);
            this.numGrids[posIndex] = numGrid;
            this.gridBox.addChild(numGrid.grid);
            this.increaseSocre(numGrid.num);
        }
    }

    /**
     * 增加分数
     * @param delta
     */
    private increaseSocre(delta: number) {
        this.data.curScore += delta;
        if (this.data.bestScore < this.data.curScore) {
            this.data.bestScore = this.data.curScore;
            localStorage.setItem("Game2048.data.bestScore", "" + this.data.bestScore);
        }
    }

    private availableGridPos(size: number): Array<number> {
        const temp = [];
        for (var i = 0, len = this.numGrids.length; i < len; i++) {
            if (!this.numGrids[i]) {
                temp.push(i);
            }
        }

        const result = [];
        let tempLen = temp.length;
        for (let i = 0; tempLen > 0 && i < size; i++) {
            let random = parseInt("" + Math.random() * temp.length);
            result.push(temp[random]);
            temp.splice(random, 1);
            tempLen -= 1;
        }
        return result;
    }

    /**
     * 向左合并
     */
    private leftMerge() {
        // 0, 4, 8, 12 表示 4*4方格中最左边的一列的indexs
        this.merge([0, 4, 8, 12], 1);
    }

    /**
     * 向右合并
     */
    private rightMerge() {
        // 3, 7, 11, 15 表示 4*4方格中最右边的一列的indexs
        this.merge([3, 7, 11, 15], -1);
    }

    /**
     * 向上合并
     */
    private upMerge() {
        // 0, 1, 2, 3 表示 4*4方格中最上边的一列的indexs
        this.merge([0, 1, 2, 3], 4);
    }

    /**
     * 向下合并
     */
    private downMerge() {
        // 12, 13, 14, 15 表示 4*4方格中最下边的一列的indexs
        this.merge([12, 13, 14, 15], -4);
    }

    /**
     * 按某个方向合并相同的数字方格，或者移动到空位置
     */
    private merge(fromIndexs: number[], nextDelta: number) {
        if (this.data.isGameOver || this.data.isMerging) {
            // 游戏结束 或 正在合并，则立即返回，不进行合并
            return;
        }

        this.data.isMerging = true;
        const mergePromises = [];
        for (let fromIndex of fromIndexs) {
            // 将 fromIndex, fromIndex + nextDelta, fromIndex + nextDelta * 2, fromIndex + nextDelta * 3 三个数字方格合并
            for (let posIndex = fromIndex, end = fromIndex + nextDelta * 4; posIndex != end; posIndex += nextDelta) {
                const curNumGrid = this.numGrids[posIndex];
                if (curNumGrid ) {
                    curNumGrid.isMerged = false;
                    const reachable = this.findReachablePosIndex(posIndex, nextDelta, fromIndex - nextDelta);
                    if (reachable != -1) {
                        // 计算移动的距离和时间
                        let deltaX = (parseInt("" + reachable % 4) - parseInt("" + posIndex % 4)) * (this.data.gridSpacing + this.data.gridSize);
                        let deltaY = (parseInt("" + reachable / 4) - parseInt("" + posIndex / 4)) * (this.data.gridSpacing + this.data.gridSize);
                        let time = (Math.abs(deltaX) + Math.abs(deltaY)) / (this.data.gridSpacing + this.data.gridSize) * 80;

                        let lastNumGrid = this.numGrids[reachable];
                        if (lastNumGrid) {
                            // 两个相同数字合并
                            if (lastNumGrid.isMerged == false) {
                                this.numGrids[posIndex] = null;
                                lastNumGrid.isMerged = true;
                                mergePromises.push(lastNumGrid.changeNum(lastNumGrid.num * 2, time + 50));
                                mergePromises.push(curNumGrid.moveByAndFadeOut(deltaX, deltaY, time));
                            }
                        }
                        else {
                            // 移动到空位置
                            this.numGrids[reachable] = curNumGrid;
                            this.numGrids[posIndex] = null;
                            mergePromises.push(curNumGrid.moveBy(deltaX, deltaY, time));
                        }
                    }
                }
            }
        }
        if (mergePromises.length > 0) {
            // 待所有动画结束后， 将 this.data.isMerging 置为 false
            Promise.all(mergePromises).then(() => {
                this.data.isMerging = false;
                this.addNewNumGrids(1);
                this.checkGameOver();
            });
        }
        else {
            this.data.isMerging = false;
        }
    }

    /**
     * 朝合并方向寻找可合并的位置
     * @param curIndex
     * @param nextDelta
     * @param end
     */
    private findReachablePosIndex(curIndex: number, nextDelta: number, end: number): number {
        let reachable = -1;
        const curNumGrid = this.numGrids[curIndex];
        const isCurGridMerged = curNumGrid.isMerged;
        while ((curIndex = curIndex - nextDelta) != end) {
            let tempGrid = this.numGrids[curIndex];
            if (tempGrid == null || (!isCurGridMerged && tempGrid.num == curNumGrid.num && !tempGrid.isMerged)) {
                reachable = curIndex;
            }
            else {
                break;
            }
        }
        return reachable;
    }

    /**
     * 检查游戏是否结束
     */
    private checkGameOver() {
        for (let i = 0; i < 16; i++) {
            let numGrid = this.numGrids[i];
            if (numGrid == null) {
                return;
            }
            else {
                if (i % 4 < 3) {
                    let rightNumGrid = this.numGrids[i + 1];
                    if (rightNumGrid == null || numGrid.num == rightNumGrid.num) {
                        return;
                    }
                }

                if (i / 4 < 3) {
                    let downNumGrid = this.numGrids[i + 4];
                    if (downNumGrid == null || numGrid.num == downNumGrid.num) {
                        return;
                    }
                }
            }
        }

        this.data.isGameOver = true;
        this.showGameOver();
    }

    /**
     * gameover面板fadeIn
     */
    private showGameOver() {
        return new Promise(resolve => {
            if (!this.gameOver.visible) {
                this.gameOver.alpha = 0;
                this.gameOver.visible = true;
                egret.Tween.get(this.gameOver).to({
                    alpha: 1
                }, 300).call(() => {
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }

    /**
     * gameover面板fadeOut
     */
    private hideGameOver() {
        return new Promise(resolve => {
            if (this.gameOver.visible) {
                egret.Tween.get(this.gameOver).to({
                    alpha: 0
                }, 300).call(() => {
                    this.gameOver.visible = false;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }

}