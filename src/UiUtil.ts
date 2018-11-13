
class UiUtil {

    /**
     * 所有数字(2, 4, 8, ..., 8192)的信息
     */
    private static nums =
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

    static getNumInfo(num: number) {
        for (let numInfo of this.nums) {
            if (numInfo.num == num) {
                return numInfo;
            }
        }
        return null;
    }

    // 创建圆角正方形
    static createRadiusSquare(
        x: number,
        y: number,
        size: number,
        radius: number,
        color: number,
        alpha: number
    ): eui.Rect {
        const rect = new eui.Rect(size, size, color);
        rect.x = x;
        rect.y = y;
        rect.alpha = alpha;
        rect.ellipseWidth = radius;
        rect.ellipseHeight = radius;
        return rect;
    }

    /**
     * 创建 2, 4, ... 等数字的方格
     * @param numIndex 2, 4, ...等数字在 nums 中的index
     * @param posX 放在第几行（从0开始算）
     * @param posY 放在第几列（从0开始算）
     * @param gridSize
     * @param gridRadius
     * @param gridSpacing
     */
    static createNumGrid(
        numIndex: number,
        posX: number,
        posY: number,
        gridSize: number,
        gridRadius: number,
        gridSpacing: number
    ) {
        let numInfo = this.nums[numIndex];
        let rect = new eui.Rect(gridSize, gridSize, numInfo.backgroundColor);
        rect.x = gridSpacing + (gridSpacing + gridSize) * posX;
        rect.y = gridSpacing + (gridSpacing + gridSize) * posY;
        rect.ellipseWidth = gridRadius;
        rect.ellipseHeight = gridRadius;

        let label = new eui.Label();
        label.text = "" + numInfo.num;
        label.size = numInfo.fontSize;
        label.bold = true;
        label.textColor = numInfo.color;
        label.width = gridSize;
        label.height = gridSize;
        label.textAlign = egret.HorizontalAlign.CENTER;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;

        rect.addChild(label);
        rect["label"] = label;

        return new NumGrid(numInfo.num, rect);
    }

}