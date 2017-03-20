class GridItem {

	private _num: number;

	private _rect: eui.Rect;

	public get num(): number {
		return this._num;
	}	

	public get rect(): eui.Rect {
		return this._rect;
	}	

	public constructor(num: number, rect: eui.Rect) {
		this._num = num;
		this._rect = rect;
	}

	public moveTo(deltaX: number, deltaY: number, time: number, animateState) {
		animateState.increase();
		let tw = egret.Tween.get(this.rect);
		tw
		.to({
			x: this.rect.x + deltaX,
			y: this.rect.y + deltaY
		}, time)
		.call(function() {
			animateState.descrease();
		});
	}

	public change(delay: number, numInfo, animateState) {
		animateState.increase();
		this._num = numInfo.num;
		let that = this;
		let tw = egret.Tween.get(this.rect);
		tw
		.wait(delay)
		.call(function() {
			let label = that.rect["label"];
			label.text = "" + numInfo.num;
        	label.size = numInfo.fontSize;
			label.textColor = numInfo.color;
			that.rect.fillColor = numInfo.backgroundColor;
			animateState.descrease();
		});
	}

	public moveToAndFadeOut(deltaX: number, deltaY: number, time: number, animateState) {
		animateState.increase();
		let that = this;
		let tw = egret.Tween.get(this.rect);
		tw
		.to({
			x: this.rect.x + deltaX,
			y: this.rect.y + deltaY
		}, time)
		.to({
			alpha: 0
		}, 250)
		.call(function() {
			animateState.descrease();
		});
	}

}