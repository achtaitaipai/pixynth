import AbstractImage from './AbstractImage'

export default class Background extends AbstractImage {
	private _colors = ['#909090', '#C0C0C0']
	private _size = 4
	constructor(width: number, height: number) {
		super(width, height)
		this.clear()
	}
	public clear() {
		for (let y = 0; y <= Math.ceil(this.height / this._size); y++) {
			for (let x = 0; x <= Math.ceil(this.width / this._size); x++) {
				const i = (x + y) % 2
				this.paint({ x: x * this._size, y: y * this._size }, this._size, this._colors[i])
			}
		}
	}
}
