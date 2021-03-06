import Sketch from '../Sketch/Index'

export default class ToolsBtn {
	static init(selector: string, sketch: Sketch) {
		const btns = document.querySelectorAll<HTMLInputElement>(selector)
		btns.forEach(btn => {
			btn.addEventListener('click', _ => {
				sketch.tool = btn.value
			})
		})
	}
}
