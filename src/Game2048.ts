class Game2048 extends egret.DisplayObjectContainer {

    private static instance: Game2048;

	public constructor() {
		super();
        Game2048.instance = this;

		this.once(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
	}

    private gameUI: GameUI;

    private gamePanel: eui.Group;

    private gameOver: eui.Group;

    private gamePanelRadius: number = 16;

	private gameBoxSize: number;

	private gridSpacing: number = 20;

    private gridRadius: number = 12;

	private gridSize: number;

    private createGameScene() {
        var uiLayer:eui.UILayer = new eui.UILayer();
        this.addChild(uiLayer);

		this.gameUI = new GameUI();
        this.gameUI["data"].curScore = 0;
        this.gameUI["data"].bestScore = localStorage.getItem("Game2048.data.bestScore");
        uiLayer.addChild(this.gameUI);
        
        let newGameBtn = <eui.Button>this.gameUI["newGame"];
        newGameBtn.touchEnabled = true;
        newGameBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.newGame, this);

        let newGameBtnInGameOver = <eui.Button>this.gameUI["newGameInGameOver"];
        newGameBtnInGameOver.touchEnabled = true;
        newGameBtnInGameOver.addEventListener(egret.TouchEvent.TOUCH_TAP, this.newGame, this);

        this.gameBoxSize = this.stage.stageWidth - 40;
		this.gridSize = parseInt("" + (this.gameBoxSize - this.gridSpacing * 5) / 4);

        this.gamePanel = <eui.Group>this.gameUI["gamePanel"];
        this.gamePanel.width = this.gameBoxSize;
        this.gamePanel.height = this.gameBoxSize;
        
        let gamePanelBg = this.createRadiusSquare(0, 0, this.gameBoxSize, this.gamePanelRadius, 0xbbada0, 1);
        this.gamePanel.addChild(gamePanelBg);

        for(var i = 0; i < 16; i++) {
			let row = parseInt("" + i % 4);
			let col = parseInt("" + i / 4);
			this.gamePanel.addChild(
                this.createRadiusSquare(this.gridSpacing + (this.gridSpacing + this.gridSize) * row, this.gridSpacing + (this.gridSpacing + this.gridSize) * col, this.gridSize, this.gridRadius, 0xeee4da, 0.35)
            );
		}
        
        //获取游戏结束提示框
        this.gameOver = <eui.Group>this.gameUI["gameOver"];

        //为 this.gamePanel 添加touch, key 事件
        this.gamePanel.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onGamePanelTouchBegin, this);
        document.addEventListener("keyup", Game2048.onKeyup);

        //运行2048 从左侧滑出的动画
        let slideIn2048 = <egret.tween.TweenGroup>this.gameUI["slidIn2048"];
        slideIn2048.play();

        this.newGame();
    }

    private onGamePanelTouchBegin(event: egret.TouchEvent) {
        let target = event.currentTarget;
        target.touchX = event.stageX;
        target.touchY = event.stageY;
        this.gamePanel.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onGamePanelTouchMove, this);
    }

    private onGamePanelTouchMove(event: egret.TouchEvent) {
        let target = event.currentTarget;
        let deltaX = event.stageX - target.touchX;
        let deltaY = event.stageY - target.touchY;
        if (Math.abs(deltaX - deltaY) <= 40) {
            //方向区分不太明确，忽略操作
            return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                this.leftMerge();
            }
            else {
                this.rightMerge();
            }
        }
        else {
            if (deltaY < 0) {
                this.upMerge();
            }
            else {
                this.downMerge();
            }
        }
        this.gamePanel.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onGamePanelTouchMove, this);
    }

    private static onKeyup(event: KeyboardEvent) {
        let key = event.code;
        switch (key) {
            case "ArrowLeft":
                Game2048.instance.leftMerge();
                break;
            case "ArrowRight":
                Game2048.instance.rightMerge();
                break;
            case "ArrowUp":
                Game2048.instance.upMerge();
                break;
            case "ArrowDown":
                Game2048.instance.downMerge();
                break;
        }
    }

    private createRadiusSquare(x: number, y: number, size: number, radius: number, color: number, alpha: number): eui.Rect {
        let rect = new eui.Rect(size, size, color);
        rect.x = x;
        rect.y = y;
        rect.alpha = alpha;
        rect.ellipseWidth = radius;
        rect.ellipseHeight = radius;
        return rect;
    }

    private createNumGrid(index: number, posX: number, posY: number): eui.Rect {
        let numInfo = this.nums[index];
        let rect = new eui.Rect(this.gridSize, this.gridSize, numInfo.backgroundColor);
        rect.x = this.gridSpacing + (this.gridSpacing + this.gridSize) * posX;
        rect.y = this.gridSpacing + (this.gridSpacing + this.gridSize) * posY;
        rect.ellipseWidth = this.gridRadius;
        rect.ellipseHeight = this.gridRadius;

        let label = new eui.Label();
        label.text = "" + numInfo.num;
        label.size = numInfo.fontSize;
        label.bold = true;
        label.textColor = numInfo.color;
        label.width = this.gridSize;
        label.height = this.gridSize;
        label.textAlign = egret.HorizontalAlign.CENTER;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;
        
        rect.addChild(label);
        rect["label"] = label;
        return rect;
    }

    private grids = new Array<GridItem>(16);

    private isGameOver = false;

    private newGame() {
        let that = this;
        this.hideGameOver(function () {
            that.isGameOver = false;
            that.gameUI["data"].curScore = 0;
            that.resetGrids();
        });
    }

    private leftMerge() {
        this.merge(0, 4, 1);
    }

    private rightMerge() {
        this.merge(3, 4, -1);
    }

    private upMerge() {
        this.merge(0, 1, 4);
    }

    private downMerge() {
        this.merge(12, 1, -4);
    }

    private merge(from: number, fromDelta: number, nextDelta: number) {
        if (this.animateState.running > 0 || this.isGameOver) {
            return;
        }

        for (var i = 0; i < 4; i++) {
            var posIndex = from;
            let fromEnd = from + nextDelta * 3;
            let min = Math.min(from, fromEnd);
            let max = Math.max(from, fromEnd);
            while (posIndex >= min && posIndex <= max) {
                let curGrid = this.grids[posIndex];
                if (curGrid) {
                    curGrid["isMerged"] = false;

                    let reachable = this.findReachablePosIndex(posIndex, nextDelta, min, max);
                    if (reachable != -1) {
                        let deltaX = (parseInt("" + reachable % 4) - parseInt("" + posIndex % 4)) * (this.gridSpacing + this.gridSize);
                        let deltaY = (parseInt("" + reachable / 4) - parseInt("" + posIndex / 4)) * (this.gridSpacing + this.gridSize);
                        let time = (Math.abs(deltaX) + Math.abs(deltaY)) / (this.gridSpacing + this.gridSize) * 80;
                        
                        let lastGrid = this.grids[reachable];
                        if (lastGrid) {
                            if (lastGrid["isMerged"] == false) {
                                if (this.gamePanel.getChildIndex(curGrid.rect) < this.gamePanel.getChildIndex(lastGrid.rect)) {
                                    this.gamePanel.swapChildren(curGrid.rect, lastGrid.rect);
                                }
                                this.grids[posIndex] = null;
                                lastGrid.change(time + 50, this.nums[this.numIndex(lastGrid.num) + 1], this.animateState);
                                lastGrid["isMerged"] = true;
                                curGrid.moveToAndFadeOut(deltaX, deltaY, time, this.animateState);
                            }
                        }
                        else {
                            this.grids[reachable] = curGrid;
                            this.grids[posIndex] = null;
                            curGrid.moveTo(deltaX, deltaY, time, this.animateState);
                        }
                    }
                }
                posIndex += nextDelta;
            }
            from += fromDelta;
        }
    }

    private numIndex(num: number): number {
        for (var i = 0, len = this.nums.length; i < len; i++) {
            if (this.nums[i].num == num) {
                return i;
            }
        }
        return -1;
    }

    private findReachablePosIndex(cur: number, lastDelta: number, min: number, max: number): number {
        var reachable = -1;

        var curGrid = this.grids[cur];
        var isCurGridMerged = curGrid["isMerged"];
        var last = cur - lastDelta;
        while (last >= min && last <= max) {
            let tempGrid = this.grids[last];
            if (tempGrid == null || (!isCurGridMerged && tempGrid.num == curGrid.num && !tempGrid["isMerged"])) {
                reachable = last;
            }
            else {
                break;
            }
            last = last - lastDelta;
        }

        return reachable;
    }

    private animateState = {
        running: 0,
        increase: function() {
            this.running += 1;
        },
        descrease: function() {
            this.running -= 1;
            if (this.running <= 0) {
                this.running = 0;
                //动画结束，添加新的grid，然后检测游戏是否结束
                Game2048.instance.addNewGrids(1);
                Game2048.instance.checkGameOver();
            }
        }
    };

    private checkGameOver() {
        for (var i = 0; i < 16; i++) {
            let grid = this.grids[i];
            if (grid == null) {
                return;
            }
            else {
                if (i % 4 < 3) {
                    let rightGrid = this.grids[i + 1];
                    if (rightGrid == null || grid.num == rightGrid.num) {
                        return;
                    }
                }

                if (i / 4 < 3) {
                    let downGrid = this.grids[i + 4];
                    if (downGrid == null || grid.num == downGrid.num) {
                        return;
                    }
                }
            }
        }

        this.isGameOver = true;
        this.showGameOver();
    }

    private showGameOver() {
        this.gameOver.parent.setChildIndex(this.gameOver, this.gameOver.parent.numChildren);
        this.gameOver.alpha = 0;
        this.gameOver.visible = true;
        let fadeIn = egret.Tween.get(this.gameOver);
        fadeIn.to({
            alpha: 1
        }, 300);
    }

    private hideGameOver(callback) {
        let that = this;
        if (this.gameOver.visible) {
            this.gameOver.alpha = 1;
            let fadeOut = egret.Tween.get(this.gameOver);
            fadeOut.to({
                alpha: 0
            }, 300).call(function () {
                that.gameOver.visible = false;
                callback();
            });
        }
        else {
            callback();
        }
    }

    private canMerge(from: number, fromDelta: number, nextDelta: number): boolean {
        for (var i = 0; i < 4; i++) {
            var posIndex = from;
            let fromEnd = from + nextDelta * 3;
            let min = Math.min(from, fromEnd);
            let max = Math.max(from, fromEnd);
            while (posIndex >= min && posIndex <= max) {
                let curGrid = this.grids[posIndex];
                if (curGrid) {
                    let reachable = this.findReachablePosIndex(posIndex, nextDelta, min, max);
                    if (reachable != -1) {
                        return true;
                    }
                }
                posIndex += nextDelta;
            }
            from += fromDelta;
        }
        return false;
    }

    private resetGrids() {
        for (var i = 0, len = this.grids.length; i < len; i++) {
            let grid = this.grids[i];
            if (grid) {
                this.gamePanel.removeChild(grid.rect);
                this.grids[i] = null;
            }
        }

        this.addNewGrids(2);
        // this.testAddNewGrids();
    }

    private addNewGrids(size: number) {
        let avas = this.availableGridPos(size);
        for (var i = 0, len = avas.length; i < len; i++) {
            let posIndex = avas[i];
            let row = parseInt("" + posIndex % 4);
			let col = parseInt("" + posIndex / 4);
            let numIndex = Math.random() < 0.8 ? 0 : 1;
            let num = this.nums[numIndex].num;
            this.grids[posIndex] = new GridItem(num, this.createNumGrid(numIndex, row, col));
            this.gamePanel.addChild(this.grids[posIndex].rect);

            this.increaseSocre(num);
        }
    }

    private increaseSocre(delta: number) {
        this.gameUI["data"].curScore += delta;
        if (!this.gameUI["data"].bestScore || this.gameUI["data"].bestScore < this.gameUI["data"].curScore) {
            this.gameUI["data"].bestScore = this.gameUI["data"].curScore;
            localStorage.setItem("Game2048.data.bestScore", this.gameUI["data"].bestScore);
        }
    }

    /**
     * 仅测试游戏结束状态使用
     */
    private testAddNewGrids() {
        for (var i = 0, len = 15; i < len; i++) {
            let row = parseInt("" + i % 4);
			let col = parseInt("" + i / 4);
            let numIndex = i % this.nums.length;
            let num = this.nums[numIndex].num;
            this.grids[i] = new GridItem(num, this.createNumGrid(numIndex, row, col));
            this.gamePanel.addChild(this.grids[i].rect);

            this.increaseSocre(num);
        }
    }

    private availableGridPos(size: number): Array<number> {
        let temp = new Array<number>();
        for (var i = 0, len = this.grids.length; i < len; i++) {
            if (!this.grids[i]) {
                temp.push(i);
            }
        }

        var lenTemp = temp.length;
        let result = new Array<number>();
        for (var i = 0; lenTemp > 0 && i < size; i++) {
                let random = parseInt("" + Math.random() * temp.length);
                if (random == lenTemp - 1) {
                    result.push(temp.pop());
                }
                else {
                    let g = temp[random];
                    temp[random] = temp[lenTemp - 1];
                    temp.pop();
                    result.push(g);
                }
                lenTemp -= 1;
            }
        return result;
    }

    private nums = 
    [
        {
            "num": 2,
            "color": 0x776e65,
            "backgroundColor": 0xeee4da,
            "fontSize": 65
        },
        {
            "num": 4,
            "color": 0x776e65,
            "backgroundColor": 0xede0c8,
            "fontSize": 65
        },
        {
            "num": 8,
            "color": 0xf9f6f2,
            "backgroundColor": 0xf2b179,
            "fontSize": 55
        },
        {
            "num": 16,
            "color": 0xf9f6f2,
            "backgroundColor": 0xf59563,
            "fontSize": 55
        },
        {
            "num": 32,
            "color": 0xf9f6f2,
            "backgroundColor": 0xf67c5f,
            "fontSize": 55
        },
        {
            "num": 64,
            "color": 0xf9f6f2,
            "backgroundColor": 0xf65e3b,
            "fontSize": 55
        },
        {
            "num": 128,
            "color": 0xf9f6f2,
            "backgroundColor": 0xedcf72,
            "fontSize": 45
        },
        {
            "num": 256,
            "color": 0xf9f6f2,
            "backgroundColor": 0xedcc61,
            "fontSize": 45
        },
        {
            "num": 512,
            "color": 0xf9f6f2,
            "backgroundColor": 0xedc850,
            "fontSize": 45
        },
        {
            "num": 1024,
            "color": 0xf9f6f2,
            "backgroundColor": 0xabe358,
            "fontSize": 35
        },
        {
            "num": 2048,
            "color": 0xf9f6f2,
            "backgroundColor": 0x4dd9cf,
            "fontSize": 35
        },
        {
            "num": 4096,
            "color": 0xf9f6f2,
            "backgroundColor": 0xa283f9,
            "fontSize": 35
        },
        {
            "num": 8192,
            "color": 0xf9f6f2,
            "backgroundColor": 0xf98383,
            "fontSize": 35
        }
    ];

}