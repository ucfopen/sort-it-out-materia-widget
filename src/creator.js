const SortItOut = angular.module('SortItOutCreator', ['ngMaterial', 'ngMessages', 'ngSanitize'])

SortItOut.config([
	'$mdThemingProvider',
	function($mdThemingProvider) {
		$mdThemingProvider.theme('default').primaryPalette('indigo', {
			default: '300'
		})
	}
])

SortItOut.controller('SortItOutController', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'sanitizeHelper',
	function($scope, $mdDialog, $mdToast, sanitizeHelper) {
		$scope.MAX_ITEM_LENGTH = 48
		$scope.MAX_NUM_FOLDERS = 6

		$scope.folders = [
			{
				name: 'Sample Folder',
				items: [{ text: 'Sample Item' }]
			}
		]
		$scope.editFolderIndex = 0
		let editImageIndices = {}
		$scope.ready = false
		$scope.showDialog = false
		$scope.newFolder = { name: '' }
		$scope.imagePresets = [
			{
				name: 'Solid Blue',
				url: 'assets/blue.png'
			},
			{
				name: 'Classic',
				url: 'assets/desktop.jpg'
			},
			{
				name: 'Canvas',
				url: 'assets/canvas.jpg'
			},
			{
				name: 'Corkboard',
				url: 'assets/corkboard.jpg'
			}
		]
		$scope.undoInfo = {}
		$scope.customBackground = false
		$scope.questionImportQueue = []

		$scope.initNewWidget = widget => {
			$scope.title = 'My Sort-It-Out Widget'
			$scope.ready = true
			$scope.backgroundImage = 'assets/blue.png'
			$scope.$apply()
		}

		$scope.initExistingWidget = (title, widget, qset) => {
			$scope.title = title
			$scope.folders = generateFolders(qset.items)
			$scope.ready = true
			$scope.backgroundImage = 'assets/blue.png'
			if (qset.options.backgroundImageId) {
				$scope.backgroundImage = Materia.CreatorCore.getMediaUrl(qset.options.backgroundImageId)
				$scope.backgroundImageId = qset.options.backgroundImageId
				$scope.customBackground = true
			} else if (qset.options.backgroundImageAsset) {
				$scope.backgroundImage = qset.options.backgroundImageAsset
			}
			$scope.$apply()
		}

		const generateFolders = qsetItems => {
			let folders = []
			let folderNames = {} // map from folder name to folder index

			for (let qsetItem of qsetItems) {
				const folderName = sanitizeHelper.desanitize(qsetItem.answers[0].text)
				const item = qsetItem.questions[0]
				if (qsetItem.options.image) {
					item.image = {
						id: qsetItem.options.image,
						url: Materia.CreatorCore.getMediaUrl(qsetItem.options.image)
					}
				}
				if (folderNames[folderName] == undefined) {
					folderNames[folderName] = folders.length
					folders.push({
						name: folderName,
						items: []
					})
				}
				item.text = sanitizeHelper.desanitize(item.text)
				folders[folderNames[folderName]].items.push(item)
			}
			return folders
		}

		$scope.addItem = (folderIndex, itemText = '', itemImage = null) => {
			// if itemText or itemImage is set, assume it's an imported question & skip folder validation check
			// otherwise perform the validFolder check for newly created items
			if (itemText || itemImage || $scope.validFolder(folderIndex)) {
				$scope.folders[folderIndex].items.push({ text: itemText })
				if (itemImage) {
					let lastIndex = $scope.folders[folderIndex].items.length - 1
					$scope.folders[folderIndex].items[lastIndex].image = {
						id: itemImage,
						url: Materia.CreatorCore.getMediaUrl(itemImage)
					}
				}
			} else {
				$mdToast.show(
					$mdToast
						.simple()
						.textContent(
							'Folder contains invalid/empty item(s). Fix item(s) before adding another item.'
						)
						.position('top left')
						.hideDelay(10000)
						.toastClass('toast-error')
				)
			}
		}

		$scope.removeItem = (folderIndex, itemIndex) => {
			const removed = $scope.folders[folderIndex].items.splice(itemIndex, 1)
			$scope.undoInfo = {
				data: removed[0],
				folderIndex,
				itemIndex
			}

			const toast = $mdToast
				.simple()
				.textContent('Item removed')
				.action('UNDO')
				.highlightAction(true)
				.position('top left')

			$mdToast
				.show(toast)
				.then(res => {
					if (res == 'ok') {
						const { data, folderIndex, itemIndex } = $scope.undoInfo
						$scope.folders[folderIndex].items.splice(itemIndex, 0, data)
					}
				})
				.catch(
					// if another toast is triggered before this one leaves, do nothing
					e => null
				)
		}

		$scope.editImage = (folderIndex, itemIndex) => {
			editImageIndices = { folderIndex, itemIndex }
			Materia.CreatorCore.showMediaImporter()
		}

		$scope.removeImage = (folderIndex, itemIndex) => {
			const data = $scope.folders[folderIndex].items[itemIndex].image
			delete $scope.folders[folderIndex].items[itemIndex].image
			$scope.undoInfo = { data, folderIndex, itemIndex }

			const toast = $mdToast
				.simple()
				.textContent('Image removed')
				.action('UNDO')
				.highlightAction(true)
				.position('top left')

			$mdToast
				.show(toast)
				.then(res => {
					if (res == 'ok') {
						const { data, folderIndex, itemIndex } = $scope.undoInfo
						$scope.folders[folderIndex].items[itemIndex].image = data
					}
				})
				.catch(
					// if another toast is triggered before this one leaves, do nothing
					e => null
				)
		}

		$scope.showAddDialog = ev => {
			$scope.showDialog = true
			$mdDialog.show({
				contentElement: '#create-dialog-container',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				openFrom: ev.currentTarget,
				closeTo: ev.currentTarget
			})
		}

		$scope.createFolder = () => {
			if (!$scope.newFolder.name.length) {
				return
			}
			$scope.folders.push({
				name: $scope.newFolder.name,
				items: [{ text: '' }]
			})
			$scope.newFolder.name = ''
			$scope.hideDialog()
		}

		$scope.canAddFolder = () => {
			return $scope.folders.length < $scope.MAX_NUM_FOLDERS
		}

		$scope.canDeleteFolder = () => {
			return $scope.folders.length > 1
		}

		$scope.validFolder = folderIndex => {
			for (let item of $scope.folders[folderIndex].items) {
				const validLength =
					item.text && item.text.length && item.text.length <= $scope.MAX_ITEM_LENGTH
				if (!validLength) {
					return false
				}
			}
			return $scope.folders[folderIndex].items.length > 0
		}

		const allUnique = () => {
			let uniqueItems = {}
			let uniqueFolderNames = {}
			let uniqueImageIds = {}

			for (let folder of $scope.folders) {
				if (uniqueFolderNames[folder.name]) {
					return false
				}
				uniqueFolderNames[folder.name] = true

				for (let item of folder.items) {
					if (uniqueItems[item.text]) {
						return false
					}
					uniqueItems[item.text] = true

					if (item.image) {
						if (uniqueImageIds[item.image.id]) {
							return false
						}
						uniqueImageIds[item.image.id] = true
					}
				}
			}
			return true
		}

		const getSaveError = () => {
			for (let i = 0; i < $scope.folders.length; i++) {
				if (!$scope.validFolder(i)) {
					const folderName = $scope.folders[i].name
					return `folder "${folderName}" contains an invalid item`
				}
			}

			for (let folder of $scope.folders) {
				if (!folder.name || !folder.name.length) {
					return 'all folders must have names'
				}
			}

			if (!allUnique()) {
				return 'all folder names, items, and images must be unique'
			}

			if (!$scope.title || !$scope.title.length) {
				return 'widget needs a valid title'
			}

			return false
		}

		$scope.hideDialog = () => {
			$mdDialog.hide()
			$scope.showDialog = false
		}

		$scope.showConfirmDelete = (ev, folderIndex) => {
			const confirm = $mdDialog
				.confirm()
				.title('Are you sure you want to delete this folder?')
				.textContent('This will delete all items in this folder as well.')
				.ariaLabel('Folder Delete Confirm')
				.targetEvent(ev)
				.ok('Delete')
				.cancel('Cancel')
			$mdDialog.show(confirm).then(
				() => $scope.deleteFolder(folderIndex),
				() => null
			)
		}

		$scope.deleteFolder = folderIndex => {
			const removed = $scope.folders.splice(folderIndex, 1)
			$scope.undoInfo = {
				data: removed[0],
				folderIndex
			}
			const toast = $mdToast
				.simple()
				.textContent('Folder removed')
				.action('UNDO')
				.highlightAction(true)
				.position('top left')

			$mdToast
				.show(toast)
				.then(res => {
					if (res == 'ok') {
						const { data, folderIndex } = $scope.undoInfo
						$scope.folders.splice(folderIndex, 0, data)
					}
				})
				.catch(
					// if another toast is triggered before this one leaves, do nothing
					e => null
				)
		}

		$scope.changeBackgroundImage = e => {
			$mdDialog.show({
				contentElement: '#background-image-dialog-container',
				parent: angular.element(document.body),
				targetEvent: e,
				clickOutsideToClose: true,
				openFrom: e.currentTarget,
				closeTo: e.currentTarget
			})
		}

		$scope.getCustomBackground = () => {
			editImageIndices = { editBackground: true }
			Materia.CreatorCore.showMediaImporter()
			$mdDialog.hide()
		}

		$scope.setBackground = url => {
			$scope.backgroundImage = url
			$scope.customBackground = false
			$mdDialog.hide()
		}

		$scope.checkEnter = (e, cb) => {
			if (e.keyCode == 13) {
				cb()
			}
		}

		$scope.onSaveClicked = (mode) => {
			const saveError = getSaveError()
			if (saveError && mode != 'history') {
				return Materia.CreatorCore.cancelSave(saveError)
			}

			const qset = generateQset()
			return Materia.CreatorCore.save($scope.title, qset)
		}

		const generateQset = () => {
			const customBg = $scope.customBackground
			let qset = {
				items: [],
				options: {
					backgroundImageId: customBg ? $scope.backgroundImageId : false,
					backgroundImageAsset: !customBg ? $scope.backgroundImage : false
				}
			}

			for (let folder of $scope.folders) {
				const folderName = sanitizeHelper.sanitize(folder.name)
				folder.items.forEach(item => {
					const text = sanitizeHelper.sanitize(item.text)
					const image = item.image
					qset.items.push({
						materiaType: 'question',
						id: null,
						type: 'QA',
						options: image ? { image: image.id } : {},
						questions: [{ text }],
						answers: [{ value: 100, text: folderName }]
					})
				})
			}
			return qset
		}

		$scope.onQuestionImportComplete = items => {
			// add items to queue
			for (let item of items) {
				$scope.questionImportQueue.push(item)
			}
			// display importer dialog
			$mdDialog
				.show({
					contentElement: '#question-import-container',
					parent: angular.element(document.body),
					clickOutsideToClose: true,
					onComplete: () => {
						// For form validation to work properly, have to manually set $touched of the item text controls to true
						// doing so ensures the max length and pattern validation is made and disallows users to import > 30 char text
						for (let control of $scope.questionImportForm.$$controls) {
							if (control.$viewValue != undefined) control.$setTouched()
						}
					}
				})
				// handler for dialog close
				.finally(() => {
					$scope.cancelImportDialog()
				})
		}

		$scope.cancelImportDialog = () => {
			$mdDialog.hide()
			$scope.questionImportQueue = []
		}

		$scope.confirmQuestionImport = () => {
			for (let item of $scope.questionImportQueue) {
				// add each item to their specified folder, and import media if necessary
				for (let [index, folder] of $scope.folders.entries()) {
					if (folder.name == item.selectedFolderForImport) {
						let itemImage = item.options && item.options.asset ? item.options.asset.id : null
						$scope.addItem(index, item.questions[0].text, itemImage)
					}
				}
			}
			$mdToast.show(
				$mdToast
					.simple()
					.textContent('Successfully imported ' + $scope.questionImportQueue.length + ' questions!')
					.position('top left')
					.hideDelay(10000)
			)
			$scope.cancelImportDialog()
		}

		$scope.onSaveComplete = () => true

		// called from Materia creator page
		$scope.onMediaImportComplete = media => {
			const id = media[0].id
			const url = Materia.CreatorCore.getMediaUrl(id)

			const { folderIndex, itemIndex, editBackground } = editImageIndices
			if (editBackground) {
				$scope.backgroundImage = url
				$scope.backgroundImageId = id
				$scope.customBackground = true
			} else if (folderIndex != undefined && itemIndex != undefined) {
				$scope.folders[folderIndex].items[itemIndex].image = { id, url }
			}

			$scope.$apply()
		}

		Materia.CreatorCore.start($scope)
	}
])

SortItOut.service('sanitizeHelper', [
	function() {
		const SANITIZE_CHARACTERS = {
			'&': '&amp;',
			'>': '&gt;',
			'<': '&lt;',
			'"': '&#34;'
		}

		const sanitize = input => {
			if (!input) return
			for (var k in SANITIZE_CHARACTERS) {
				let v = SANITIZE_CHARACTERS[k]
				let re = new RegExp(k, 'g')
				input = input.replace(re, v)
			}
			return input
		}

		const desanitize = input => {
			if (!input) return
			for (var k in SANITIZE_CHARACTERS) {
				let v = SANITIZE_CHARACTERS[k]
				let re = new RegExp(v, 'g')
				input = input.replace(re, k)
			}
			return input
		}
		return {
			sanitize: sanitize,
			desanitize: desanitize
		}
	}
])
