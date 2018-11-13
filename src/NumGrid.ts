
class NumGrid {

    private _num: number;

    private readonly _grid: eui.Rect;

    isMerged: boolean;

    get num(): number {
        return this._num;
    }

    get grid(): eui.Rect {
        return this._grid;
    }

    constructor(num: number, grid: eui.Rect) {
        this._num = num;
        this._grid = grid;
        this._grid.alpha = 0;
        egret.Tween.get(this._grid).to({
            alpha: 1
        }, 150);
    }

    public moveBy(deltaX: number, deltaY: number, time: number) {
        return new Promise(resolve => {
            egret.Tween.get(this.grid)
                .to({
                    x: this.grid.x + deltaX,
                    y: this.grid.y + deltaY
                }, time, egret.Ease.sineInOut)
                .call(resolve);
        });
    }

    public changeNum(newNum: number, delay: number) {
        return new Promise(resolve => {
            this._num = newNum;
            egret.Tween.get(this.grid).wait(delay)
                .call(() => {
                    let numInfo = UiUtil.getNumInfo(newNum);
                    let label = this.grid["label"] as eui.Label;
                    label.text = "" + numInfo.num;
                    label.size = numInfo.fontSize;
                    label.textColor = numInfo.color;
                    this.grid.fillColor = numInfo.backgroundColor;
                    resolve();
                });
        });
    }

    public moveByAndFadeOut(deltaX: number, deltaY: number, time: number) {
        return new Promise(resolve => {
            egret.Tween.get(this.grid)
                .to({
                    x: this.grid.x + deltaX,
                    y: this.grid.y + deltaY
                }, time, egret.Ease.sineInOut)
                .to({
                    alpha: 0
                }, 250)
                .call(() => {
                    this.grid.parent.removeChild(this.grid);
                    resolve();
                });
        });
    }

}