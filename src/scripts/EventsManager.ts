import Listener from './Listener'
import { Coordinate, DragEventType, PointerMove, PointerUpType, ZoomEventType } from './types'
import { distance } from './utils'

type EventsType = 'click' | 'rightClick' | 'drag' | 'pointerMove' | 'pointerUp' | 'pointerOut' | 'zoom'

export default class EventsManager {
	private _clickObservers = new Listener<Coordinate>()
	private _rightClickObservers = new Listener<Coordinate>()
	private _dragObservers = new Listener<DragEventType>()
	private _pointerMoveObservers = new Listener<PointerMove>()
	private _pointerUpObservers = new Listener<PointerUpType>()
	private _pointerOutObservers = new Listener<Coordinate>()
	private _zoomObservers = new Listener<ZoomEventType>()

	private _evtCache: PointerEvent[] = []
	private _prevDist: number | null = null
	private _prevCenter: Coordinate | null = null

	private _oldPos: Coordinate | null = null
	private _initPos: Coordinate | null = null
	private _buttonDown: number | null = null

	constructor(el: HTMLElement) {
		el.addEventListener('pointerdown', e => {
			this._handleTouch(e)
		})
		el.addEventListener('pointermove', e => {
			this._handleDrag(e)
		})
		el.addEventListener('pointerup', e => {
			if (this._initPos) this._pointerUpObservers.notify({ button: e.button, initPos: this._initPos, newPos: { x: e.clientX, y: e.clientY } })
			this._handleOut(e)
		})
		el.addEventListener('pointercancel', e => {
			this._handleOut(e)
		})
		el.addEventListener('pointerout', e => {
			this._handleOut(e)
		})
		el.addEventListener('wheel', e => {
			const pos = { x: e.clientX, y: e.clientY }
			const dir = Math.sign(e.deltaY)
			this._zoomObservers.notify({ pos, dir })
		})
		el.addEventListener('contextmenu', e => e.preventDefault())
	}

	private _handleTouch(e: PointerEvent) {
		this._evtCache.push(e)
		if (this._evtCache.length === 1) {
			const pos = { x: e.clientX, y: e.clientY }
			this._buttonDown = e.button
			this._oldPos = pos
			if (e.button === 2) this._rightClickObservers.notify(pos)
			if (e.button === 0) {
				this._initPos = pos
				this._clickObservers.notify(pos)
			}
		}
	}

	private _handleDrag(e: PointerEvent) {
		const pos = { x: e.clientX, y: e.clientY }
		// Trouve le pointeur en cours dans le cache et le met à jour avec cet événement
		for (var i = 0; i < this._evtCache.length; i++) {
			if (e.pointerId == this._evtCache[i].pointerId) {
				this._evtCache[i] = e
				break
			}
		}
		if (this._evtCache.length === 2) {
			// console.log(this._evtCache)
			const newPos = { x: this._evtCache[1].clientX, y: this._evtCache[1].clientY }
			const oldPos = { x: this._evtCache[0].clientX, y: this._evtCache[0].clientY }
			const dist = distance(oldPos, newPos)
			const centerX = this._evtCache[0].clientX + (this._evtCache[1].clientX - this._evtCache[0].clientX) / 2
			const centerY = this._evtCache[0].clientY + (this._evtCache[1].clientY - this._evtCache[0].clientY) / 2
			const center = { x: centerX, y: centerY }
			if (this._prevDist !== null) {
				const diff = dist - this._prevDist
				if (this._prevCenter !== null && dist < 100) {
					this._dragObservers.notify({ button: 1, oldPos: this._prevCenter, newPos: center, initPos: this._initPos || { x: 0, y: 0 } })
				} else if (diff > 0.5) {
					this._zoomObservers.notify({ pos: center, dir: -1 })
				} else if (-diff > 0.5) {
					this._zoomObservers.notify({ pos: center, dir: 1 })
				}
			}
			this._prevDist = dist
			this._prevCenter = center
		} else {
			if (this._buttonDown === null) {
				this._pointerMoveObservers.notify({ oldPos: this._oldPos || { x: -1, y: -1 }, newPos: pos })
			} else if (this._buttonDown !== null && this._oldPos) {
				this._dragObservers.notify({ oldPos: this._oldPos, newPos: pos, button: this._buttonDown, initPos: this._initPos || { x: 0, y: 0 } })
				this._oldPos = pos
			}
		}
	}

	private _handleOut(e: PointerEvent) {
		const pos = { x: e.clientX, y: e.clientY }
		this._buttonDown = null
		this._pointerOutObservers.notify(pos)
		this._evtCache = this._evtCache.filter(evt => evt.pointerId !== e.pointerId)
		this._prevDist = null
		this._prevCenter = null
		this._initPos = null
	}

	public addObserver(type: EventsType, callback: Function) {
		switch (type) {
			case 'click':
				return this._clickObservers.subscribe(callback)
			case 'rightClick':
				return this._rightClickObservers.subscribe(callback)
			case 'drag':
				return this._dragObservers.subscribe(callback)
			case 'pointerMove':
				return this._pointerMoveObservers.subscribe(callback)
			case 'pointerUp':
				return this._pointerUpObservers.subscribe(callback)
			case 'pointerOut':
				return this._pointerOutObservers.subscribe(callback)
			case 'zoom':
				return this._zoomObservers.subscribe(callback)
			default:
				return -1
		}
	}
	public removeObserver(type: EventsType, id: number) {
		switch (type) {
			case 'click':
				return this._clickObservers.unsubscribe(id)
			case 'rightClick':
				return this._rightClickObservers.unsubscribe(id)
			case 'drag':
				return this._dragObservers.unsubscribe(id)
			case 'pointerMove':
				return this._pointerMoveObservers.unsubscribe(id)
			case 'pointerUp':
				return this._pointerUpObservers.unsubscribe(id)
			case 'pointerOut':
				return this._pointerOutObservers.unsubscribe(id)
			case 'zoom':
				return this._zoomObservers.unsubscribe(id)
			default:
				return null
		}
	}

	// public removeClickObserver(id: number) {
	// 	this._clickObservers.unsubscribe(id)
	// }
}
