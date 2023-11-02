const SRC_DESKTOP = -1 // indicates drag started on desktop, otherwise itemSource is folderIndex
const DEFAULT_BG_IMAGE = 'assets/desktop.jpg'

let previewScrollContainerEl
let prevPosition // start position of drag
let selectedElement // element that is being dragged
let pickupCount = 1 // every new item picked up will go to the top (z-index)
let itemSource // to track where the dragged item came from
let _assistiveFolderSelectIndex = -1
let _inAssistiveFolderSelectMode = false

export const peekFolder = index => {
	const folders = document.querySelectorAll(`.folder[data-index="${index}"]`)
	folders.forEach(f => f.classList.add('peeked'))
}

// this is used to prevent dragging of the images on macOS
export const preventDefault = (e, stopPropagation) => {
	if (e.preventDefault) {
		e.preventDefault()
	}
	if (stopPropagation && e.stopPropagation) {
		e.stopPropagation()
	}
}

export const handleAssistiveRepeat = event => {
	// spacebar?
	if (event.which == 32) {
		document.getElementsByClassName('desktop-item')[0].focus()
	}
}

export const setItemPos = (el, top, left) => {
	el.style.top = `${top}px`
	el.style.left = `${left}px`
}

export const generateBounds = () => {
	const desktopEl = document.getElementById('desktop')
	const style = getComputedStyle(desktopEl, null)
	const width = parseFloat(style.width.replace('px', ''))
	const height = parseFloat(style.height.replace('px', ''))
	const menuBarHeight = document.getElementById('menu-bar').offsetHeight

	const placementBounds = {
		x: {
			min: 15,
			max: width - 150
		},
		y: {
			min: menuBarHeight + 5,
			max: height - 15
		}
	}

	const dragBounds = {
		x: {
			min: 15,
			max: width - 15
		},
		y: {
			min: menuBarHeight + 5,
			max: menuBarHeight + height - 15
		}
	}

	return { placementBounds, dragBounds }
}

// fisher-yates shuffle algorithm
export const shuffleArray = array => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const x = array[i]
		array[i] = array[j]
		array[j] = x
	}

	return array
}

export const makeFoldersFromQset = qset => {
	const folderNames = new Set()
	qset.items.forEach(item => {
		folderNames.add(desanitize(item.answers[0].text))
	})

	return Array.from(folderNames).map(text => ({ text, items: [] }))
}

export const generateRandomPosition = (placementBounds, hasImage) => {
	const DOCK_HEIGHT = 125
	const pb = placementBounds

	const yRange = pb.y.max - pb.y.min - DOCK_HEIGHT - (hasImage ? 150 : 0)
	const y = ~~(Math.random() * yRange) + pb.y.min

	const xRange = pb.x.max - pb.x.min
	const x = ~~(Math.random() * xRange) + pb.x.min

	return { left: `${x}px`, top: `${y}px` }
}

export const makeItemsFromQset = (qset, placementBounds) => {
	return qset.items.map(item => {
		const image = item.options.image ? Materia.Engine.getMediaUrl(item.options.image) : false

		return {
			id: item.id,
			text: desanitize(item.questions[0].text),
			image,
			position: generateRandomPosition(placementBounds, Boolean(item.options.image)),
			folder: SRC_DESKTOP
		}
	})
}

export const tutorialForward = ($scope, $timeout) => {
	$scope.tutorialPage = 2
	$timeout(() => {
		document.getElementById('gotitbtn').focus()
	})
}

export const tutorialBack = ($scope, $timeout) => {
	$scope.tutorialPage = 1
	$timeout(() => {
		document.getElementById('tutorial-next-btn').focus()
	})
}

export const hideTutorial = ($scope, $timeout) => {
	$scope.showTutorialDialog = false
}

export const hideModals = ($scope) => {
	$scope.showKeyboardDialog = false
	$scope.showTutorialDialog = false
}

export const toggleKeyboardDialog = ($scope, $timeout) => {
	$scope.showKeyboardDialog = !$scope.showKeyboardDialog

	$timeout(() => {
		if ($scope.showKeyboardDialog) {
			document.getElementById('keyboard-instructions-close').focus()
		}
		else {
			document.getElementById('keyboard-instructions-btn').focus()
		}
	})
}

// aria-live regions don't work well with normal angular data binding with scope variables
// to overcome this, we gotta go old school and edit the DOM node manually
export const assistiveAlert = text => {
	if (document.getElementById('assistive-alert'))
		document.getElementById('assistive-alert').innerHTML = text
}

export const removeClassShrink = () => {
	const shrunk = document.getElementsByClassName('shrink')
	Array.from(shrunk).forEach(el => el.classList.remove('shrink'))
}

export const removeClassPeek = () => {
	const peeked = document.getElementsByClassName('peeked')
	Array.from(peeked).forEach(el => el.classList.remove('peeked'))
}

export const isOutOfBounds = (x, y, dragBounds) => {
	const outOfBoundsX = x < dragBounds.x.min || x > dragBounds.x.max
	const outOfBoundsY = y < dragBounds.y.min || y > dragBounds.y.max
	return outOfBoundsX || outOfBoundsY
}

export const SANITIZE_CHARACTERS = {
	'&': '&amp;',
	'>': '&gt;',
	'<': '&lt;',
	'"': '&#34;'
}

export const sanitize = input => {
	if (!input) return

	for (const k in SANITIZE_CHARACTERS) {
		const reg = new RegExp(k, 'g')
		input = input.replace(reg, SANITIZE_CHARACTERS[k])
	}

	return input
}

export const desanitize = input => {
	if (!input) return

	for (const k in SANITIZE_CHARACTERS) {
		const reg = new RegExp(SANITIZE_CHARACTERS[k], 'g')
		input = input.replace(reg, k)
	}

	return input
}

// hammer event properties are different from native
export const standardizeEvent = hammerEvent => {
	hammerEvent.clientX = hammerEvent.center.x
	hammerEvent.clientY = hammerEvent.center.y
	hammerEvent.currentTarget = hammerEvent.target
	return hammerEvent
}

export const onMateriaStart = ($scope, instance, qset, version) => {
	const { placementBounds, dragBounds } = generateBounds()
	$scope.placementBounds = placementBounds
	$scope.dragBounds = dragBounds
	$scope.title = instance.name
	$scope.folders = makeFoldersFromQset(qset)
	$scope.desktopItems = shuffleArray(makeItemsFromQset(qset, placementBounds))

	$scope.backgroundImage = DEFAULT_BG_IMAGE
	if (qset.options.backgroundImageId) {
		$scope.backgroundImage = Materia.Engine.getMediaUrl(qset.options.backgroundImageId)
	} else if (qset.options.backgroundImageAsset) {
		$scope.backgroundImage = qset.options.backgroundImageAsset
	}

	$scope.$apply()
}

export const handleItemFocus = ($scope, event, item) => {
	if ($scope.selectedItem != item) {
		$scope.selectedItem = item

		removeClassPeek()

		// if the item is already placed in a folder, peek the folder so we can see it
		if (item.folder > -1) {
			_assistiveFolderSelectIndex = item.folder
			_inAssistiveFolderSelectMode = true
			peekFolder(_assistiveFolderSelectIndex)
		}
		else {
			_assistiveFolderSelectIndex = -1
			_inAssistiveFolderSelectMode = false
		}
		
		assistiveAlert(item.text + ' is selected.')
	}
}

// computes the sequence of items that "peek" out of a folder
// by default it's chronological, with the last item placed in the folder at the top of the stack
// when using tab and shift+tab to navigate the list of items, the currently focused item is moved to the top of the stack
export const computePeekDisplay = ($scope, items) => {
	if ($scope.selectedItem) {
		const selectedItemIndex = items.findIndex(item => item.id === $scope.selectedItem.id)
		if (selectedItemIndex !== -1) {
			const sliced = items.slice()
			const selectedItem = sliced.splice(selectedItemIndex, 1)[0]
			return [selectedItem, ...sliced.reverse()]
		}
	}
	return items.slice().reverse()
}

export const handleAssistiveSelection = ($scope, event, item) => {
	switch (event.keyCode) {
		case 32: // space
			// prevent unwanted behavior folder selection behavior
			if ($scope.selectedItem.folder == _assistiveFolderSelectIndex) return
			// item has been selected, and a target folder is currently selected
			if (_inAssistiveFolderSelectMode) {
				$scope.mouseUpOverFolder(_assistiveFolderSelectIndex)
				assistiveAlert(
					item.text + ' has been placed in ' + $scope.folders[_assistiveFolderSelectIndex].text
				)
				removeClassPeek()
				$scope.selectedItem = item // set selectedItem back to the item that was placed, overriding the default behavior
			}
			break

		case 40: // down arrow. inits assistive folder selection mode. Folder element is NOT focused but we peek it to provide a visual indicator of selection
			event.preventDefault()
			removeClassPeek()
			if (_assistiveFolderSelectIndex >= $scope.folders.length - 1) _assistiveFolderSelectIndex = 0
			else _assistiveFolderSelectIndex++
			peekFolder(_assistiveFolderSelectIndex)
			assistiveAlert(
				$scope.folders[_assistiveFolderSelectIndex].text +
					' folder selected. Press space to place this item in the folder.'
			)
			_inAssistiveFolderSelectMode = true
			break

		case 38: // up arrow. inits assistive folder selection mode. Folder element is NOT focused but we peek it to provide a visual indicator of selection
			event.preventDefault()
			removeClassPeek()
			if (_assistiveFolderSelectIndex <= 0) _assistiveFolderSelectIndex = $scope.folders.length - 1
			else _assistiveFolderSelectIndex--
			peekFolder(_assistiveFolderSelectIndex)
			assistiveAlert(
				$scope.folders[_assistiveFolderSelectIndex].text +
					' folder selected. Press space to place this item in the folder.'
			)
			_inAssistiveFolderSelectMode = true
			break

		default:
			return false
	}
}

// available when a user tabs to the hidden assistive element indicating you can submit
// they can hit space to submit, tabbing clears the submit window (to prevent unintended interactions)
export const handleAssistiveSubmit = ($scope, event) => {
	if (event.which == 32) {
		$scope.submitClick()
	} else if (event.which == 9) {
		$scope.showSubmitDialog = false
	}
}

export const hideFolderPreview = $scope => {
	$scope.showFolderPreview = false
	$scope.folderPreviewIndex = -1
}

export const itemMouseDown = ($scope, e, item) => {
	$scope.selectedItem = item

	// hammer events store the element differently
	selectedElement = e.element ? e.element[0] : e.currentTarget
	const computedStyle = getComputedStyle(selectedElement)
	const left = parseInt(computedStyle.left, 10)
	const top = parseInt(computedStyle.top, 10)

	$scope.offsetLeft = left - e.clientX
	$scope.offsetTop = top - e.clientY
	pickupCount++

	setItemPos(selectedElement, top, left)
	selectedElement.style.zIndex = pickupCount

	prevPosition = { top, left }
	itemSource = SRC_DESKTOP
}

export const panMove = ($scope, e) => {
	const underElem = document.elementFromPoint(e.clientX, e.clientY)
	const folderElem = underElem ? underElem.closest('.folder') : null
	if (folderElem) {
		const index = folderElem.dataset.index
		peekFolder(index)
		if (selectedElement) selectedElement.classList.add('shrink')
	} else {
		removeClassPeek()
		removeClassShrink()
	}

	if (selectedElement) {
		if (isOutOfBounds(e.clientX, e.clientY, $scope.dragBounds)) {
			return $scope.mouseUp(e)
		}
		const left = e.clientX + $scope.offsetLeft
		const top = e.clientY + $scope.offsetTop
		setItemPos(selectedElement, top, left)
	}
}

export const mouseUp = ($scope, e) => {
	removeClassPeek()
	if (!selectedElement) {
		return
	}

	if (e.stopPropagation) {
		e.stopPropagation()
	}

	const underElemId = document.elementFromPoint(e.clientX, e.clientY).id

	// put it back if it's out of bounds or over the dock but not a folder
	if (isOutOfBounds(e.clientX, e.clientY, $scope.dragBounds) || underElemId == 'dock-main') {
		removeClassShrink()
		setItemPos(
			selectedElement,
			Math.min(prevPosition.top, $scope.placementBounds.y.max),
			prevPosition.left
		)
	} else {
		const underElem = document.elementFromPoint(e.clientX, e.clientY)
		// dragged item INTO a folder
		const folderElem = underElem ? underElem.closest('.folder') : null
		if (folderElem) {
			$scope.mouseUpOverFolder(folderElem.dataset.index)
		}

		// draged item OUT of a folder
		if (itemSource != SRC_DESKTOP && underElem.classList.contains('desktop-zone')) {
			$scope.folders[itemSource].items = $scope.folders[itemSource].items.filter(
				item => item.text != $scope.selectedItem.text
			)

			$scope.selectedItem.position = {
				top: `${e.clientY + $scope.offsetTop}px`,
				left: `${e.clientX + $scope.offsetLeft}px`
			}

			for (const [index, item] of Object.entries($scope.desktopItems)) {
				if ($scope.selectedItem.text == item.text) {
					$scope.desktopItems[index].sorted = false
					$scope.desktopItems[index].folder = SRC_DESKTOP
					$scope.numSorted--
				}
			}
		}
	}

	selectedElement = false
	$scope.selectedItem = false
	itemSource = SRC_DESKTOP
}

export const mouseUpOverFolder = ($scope, $timeout, targetFolderIndex, event) => {

	// represents a click action on a folder when in assistiveFolderSelectMode
	// this effectively cancels assistiveFolderSelectMode. Treat the click as a normal click on a folder (to open it)
	if (event && _inAssistiveFolderSelectMode) {
		_inAssistiveFolderSelectMode = false
		$scope.selectedItem = false

		$scope.showFolderPreview = true
		$scope.folderPreviewIndex = targetFolderIndex
		return
	}

	// item dropped to where it already is
	if (targetFolderIndex == itemSource) {
		return
	}

	// clicked on an open folder, close it
	if (targetFolderIndex == $scope.folderPreviewIndex) {
		$scope.hideFolderPreview()
		return
	}

	// clicked on a folder that wasn't open, open it
	if (!$scope.selectedItem) {
		$scope.showFolderPreview = true
		$scope.folderPreviewIndex = targetFolderIndex
		return
	}

	// add selected item to this folder's items
	$scope.folders[targetFolderIndex].items.push($scope.selectedItem)

	const desktopIndex = $scope.desktopItems.indexOf($scope.selectedItem)

	itemSource = $scope.desktopItems[desktopIndex].folder

	if (itemSource == SRC_DESKTOP) {
		// item is moving from the desktop
		$scope.desktopItems[desktopIndex].sorted = true
		$scope.numSorted++
	} else {
		// item moving from another folder
		// remove it from the folder's items
		const previousFolder = $scope.folders[itemSource]
		previousFolder.items = previousFolder.items.filter(
			item => item.text != $scope.selectedItem.text
		)
	}

	// update what folder this item is in
	$scope.desktopItems[desktopIndex].folder = targetFolderIndex

	// reset our dragging state
	selectedElement = false
	$scope.selectedItem = false
	itemSource = SRC_DESKTOP

	if ($scope.readyToSubmit()) {
		assistiveAlert(
			'You are ready to submit this widget. You can press escape or tab to cancel and continue sorting items.'
		)
		$timeout(() => {
			document.getElementById('submit-dialog-cancel').focus()
		},500)
	}
}

export const previewMouseDown = ($scope, e, item) => {
	selectedElement = document.getElementById('preview-selected-item')
	$scope.selectedItem = item

	const rect = e.currentTarget.getBoundingClientRect()
	let top = rect.top + document.body.scrollTop
	let left = rect.left + document.body.scrollLeft

	// slight shift to keep things looking good
	left -= 10
	top -= 10

	// if there's an image, move it down so it seems more centered
	if (item.image) {
		top -= 25
	}

	// if preview item is long, shift drag item to match
	if (e.clientX - left > 150) {
		left += (e.clientX - left) / 2
	}

	$scope.offsetLeft = left - e.clientX
	$scope.offsetTop = top - e.clientY

	setItemPos(selectedElement, top, left)
	itemSource = $scope.folderPreviewIndex
}

export const enlargeImage = ($scope, url, e) => {
	if (e.stopPropagation) {
		e.stopPropagation()
	}
	$scope.enlargedImage.url = url
	$scope.enlargedImage.show = true
}

export const canScroll = $scope => {
	return previewScrollContainerEl.scrollHeight > previewScrollContainerEl.clientHeight
}

export const scrollUp = $scope => {
	previewScrollContainerEl.scrollTop -= 100
}

export const scrollDown = $scope => {
	previewScrollContainerEl.scrollTop += 100
}

export const readyToSubmit = $scope => {
	return $scope.numSorted >= $scope.desktopItems.length
}

export const submitClick = ($scope, $timeout) => {
	if (!$scope.readyToSubmit()) {
		$scope.showNoSubmit = true
		$timeout(() => {
			$scope.showNoSubmit = false
		}, 5000)
		return
	}

	// submit which folder each item is in
	$scope.folders.forEach(({ text: folderText, items }) => {
		items.forEach(item => {
			Materia.Score.submitQuestionForScoring(item.id, folderText)
		})
	})

	Materia.Engine.end()
}

export const ControllerSortItOutPlayer = ($scope, $rootScope, $timeout) => {
	// initialize 'globals'
	previewScrollContainerEl = document.getElementById('preview-scroll-container')
	prevPosition = null // start position of drag
	selectedElement = null // element that is being dragged
	pickupCount = 1 // every new item picked up will go to the top (z-index)
	itemSource = null // to track where the dragged item came from
	_assistiveFolderSelectIndex = -1
	_inAssistiveFolderSelectMode = false

	// set up scope vars
	$scope.numSorted = 0
	$scope.tutorialPage = 1
	$scope.showFolderPreview = false
	$scope.showNoSubmit = false
	$scope.showSubmitDialog = true
	$scope.selectedItem = false
	$scope.desktopItems = []
	$scope.folders = []
	$scope.enlargedImage = {
		show: false,
		url: ''
	}
	$scope.showKeyboardDialog = false
	$scope.showTutorialDialog = true

	// set up scope functions
	// NOTE: these don't need te be bound because they don't use $scope internally
	// therefore, they can be called directly
	$scope.standardizeEvent = standardizeEvent
	$scope.handleAssistiveRepeat = handleAssistiveRepeat
	$scope.peekFolder = peekFolder
	$scope.preventDefault = preventDefault

	// set up scope functions with dependencies
	// NOTE: if you need to call any of these methods, call them
	$scope.tutorialForward = tutorialForward.bind(null, $scope, $timeout)
	$scope.tutorialBack = tutorialBack.bind(null, $scope, $timeout)
	$scope.hideTutorial = hideTutorial.bind(null, $scope, $timeout)
	$scope.hideModals = hideModals.bind(null, $scope)
	$scope.toggleKeyboardDialog = toggleKeyboardDialog.bind(null, $scope, $timeout)
	$scope.handleItemFocus = handleItemFocus.bind(null, $scope)
	$scope.handleAssistiveSelection = handleAssistiveSelection.bind(null, $scope)
	$scope.handleAssistiveSubmit = handleAssistiveSubmit.bind(null, $scope)
	$scope.hideFolderPreview = hideFolderPreview.bind(null, $scope)
	$scope.itemMouseDown = itemMouseDown.bind(null, $scope)
	$scope.panMove = panMove.bind(null, $scope)
	$scope.mouseUp = mouseUp.bind(null, $scope)
	$scope.mouseUpOverFolder = mouseUpOverFolder.bind(null, $scope, $timeout)
	$scope.hidePeek = removeClassPeek.bind(null)
	$scope.computePeekDisplay = computePeekDisplay.bind(null, $scope)
	$scope.previewMouseDown = previewMouseDown.bind(null, $scope)
	$scope.enlargeImage = enlargeImage.bind(null, $scope)
	$scope.canScroll = canScroll.bind(null, $scope)
	$scope.scrollUp = scrollUp.bind(null, $scope)
	$scope.scrollDown = scrollDown.bind(null, $scope)
	$scope.readyToSubmit = readyToSubmit.bind(null, $scope)
	$scope.submitClick = submitClick.bind(null, $scope, $timeout)

	// setup listeners
	$rootScope.$on('tabMonitor', () => {
		$scope.$apply(() => {
			$scope.hideTutorial()
		})
	})

	// Tell Materia we're ready to start w/ callback
	Materia.Engine.start({ start: onMateriaStart.bind(null, $scope) })
}
