import EventsManager from '../Events/EventsManager'
import Drawing from '../Images/Drawing'
import Sketch from '../Sketch'
import { Coordinate, DragEventType, PointerMove, ZoomEventType } from '../types/eventsTypes'
import Bucket from './Bucket'
import Handle from './Handle'
import Erase from './Erase'
import Line from './Line'
import Paint from './Paint'
import Tool from './AbstractTool'
import unZoom from './UnZoom'
import Zoom from './Zoom'
import Rect from './Rect'
import Circle from './Circle'
import Drag from './Drag'
import Crop from './Crop'

export default class ToolsManager {
	private _eventsManager: EventsManager
	private _tools: { [key: string]: Tool }
	private _currentTool: Tool
	private _sketch
	private _cursor

	constructor(sketch: Sketch, drawing: Drawing, cursor: Drawing) {
		this._sketch = sketch
		this._cursor = cursor
		this._tools = {
			paint: new Paint(sketch, drawing, cursor),
			erase: new Erase(sketch, drawing, cursor),
			line: new Line(sketch, drawing, cursor),
			rect: new Rect(sketch, drawing, cursor),
			circle: new Circle(sketch, drawing, cursor),
			bucket: new Bucket(sketch, drawing, cursor),
			crop: new Crop(sketch, drawing, cursor),
			zoom: new Zoom(sketch, drawing, cursor),
			unzoom: new unZoom(sketch, drawing, cursor),
			drag: new Drag(sketch, drawing, cursor),
			handle: new Handle(sketch, drawing, cursor),
		}
		this._currentTool = this._tools.paint
		this._eventsManager = new EventsManager(sketch)
		this._addEvents()
	}

	set tool(value: string) {
		if (this._tools[value]) {
			this._currentTool.exit()
			this._currentTool = this._tools[value]
			this._currentTool.init()
		}
	}

	private _addEvents() {
		this._eventsManager.addObserver('click', (e: Coordinate) => {
			this._currentTool.click(e)
		})

		this._eventsManager.addObserver('rightClick', (e: Coordinate) => {
			this._currentTool.rightClick(e)
		})
		this._eventsManager.addObserver('pointerUp', (e: DragEventType) => {
			this._currentTool.unClick(e)
		})
		this._eventsManager.addObserver('drag', (e: DragEventType) => {
			const { button, oldPos, newPos } = e
			switch (button) {
				case 1:
					this._sketch.camera.drag(oldPos, newPos)
					break
				case 2:
					this._currentTool.rightClick(newPos)
					break
				default:
					this._currentTool.drag(e)
					break
			}
		})
		this._eventsManager.addObserver('pointerMove', (e: PointerMove) => {
			this._currentTool.move(e)
		})
		this._eventsManager.addObserver('pointerOut', () => {
			this._cursor.actif = false
			this._sketch.updatePreview()
		})
		this._eventsManager.addObserver('zoom', (e: ZoomEventType) => {
			this._currentTool.zoom(e)
		})
	}
}