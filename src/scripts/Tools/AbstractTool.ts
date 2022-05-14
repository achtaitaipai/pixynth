import Drawing from '../Layer/Drawing'
import Sketch from '../Sketch'
import { Coordinate, DragEventType, PointerMove, PointerUpType, ZoomEventType } from '../types/eventsTypes'

export default abstract class Tool {
	protected _sketch: Sketch
	protected _drawing: Drawing
	protected _cursor: Drawing
	constructor(sketch: Sketch, drawing: Drawing, cursor: Drawing) {
		this._sketch = sketch
		this._drawing = drawing
		this._cursor = cursor
	}
	public click(_: Coordinate) {}
	public rightClick(e: Coordinate): void {
		this._drawing.erase(this._sketch.gridCoordinate(e), this._sketch.size)
		this._sketch.updatePreview()
		this._cursor.actif = false
	}
	public drag(_: DragEventType) {}
	public move(_: PointerMove) {}
	public unClick(_: PointerUpType) {}
	public out(_: Coordinate) {}
	public zoom(e: ZoomEventType) {
		this._sketch.camera.zoom(this._sketch.gridCoordinate(e.pos), e.dir)
	}
}