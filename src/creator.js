const SortItOut = angular.module("SortItOutCreator", ['ngMaterial', 'ngMessages', 'ngSanitize'])

SortItOut.config(["$mdThemingProvider", ($mdThemingProvider) =>
	$mdThemingProvider.theme('default')
		.primaryPalette('purple', {
			'default': '300'
		})
])

SortItOut.controller("SortItOutController", ["$scope", "$mdDialog", "$sanitize", ($scope, $mdDialog, $sanitize) => {
	$scope.MAX_ITEM_LENGTH = 30
	$scope.MAX_NUM_BUCKETS = 5

	$scope.folders = [
		{
			name: "Sample Folder",
			items: [
				{ text: "Sample Item" }
			]
		}
	]
	$scope.editFolderIndex = 0
	let editImageIndices = {}
	$scope.ready = false
	$scope.showDialog = false
	$scope.newFolder = { name: "" }
	$scope.imagePresets = [
		{
			name: "Classic",
			url: "assets/desktop.jpg",
		},
		{
			name: "Canvas",
			url: "assets/canvas.jpg",
		},
		{
			name: "Corkboard",
			url: "assets/corkboard.jpg"
		}
	]

	$scope.initNewWidget = (widget) => {
		$scope.title = "My Sort-It-Out Widget"
		$scope.ready = true
		$scope.backgroundImage = "assets/desktop.jpg"
		$scope.$apply()
	}

	$scope.initExistingWidget = (title, widget, qset) => {
		$scope.title = title
		$scope.folders = generateFolders(qset.items)
		$scope.ready = true
		$scope.backgroundImage = "assets/desktop.jpg"
		if (qset.options && qset.options.backgroundImage) {
			$scope.backgroundImage = qset.options.backgroundImage
		}
		$scope.$apply()
	}

	const generateFolders = (qsetItems) => {
		let folders = []
		let folderNames = {} // map from folder name to folder index

		for (let qsetItem of qsetItems) {
			const folderName = qsetItem.answers[0].text
			const item = qsetItem.questions[0]
			if (qsetItem.options.image) {
				item.image = qsetItem.options.image
			}
			if (folderNames[folderName] == undefined) {
				folderNames[folderName] = folders.length
				folders.push({
					name: folderName,
					items: []
				})
			}
			folders[folderNames[folderName]].items.push(item)
		}
		return folders
	}

	$scope.addItem = (folderIndex) => {
		$scope.folders[folderIndex].items.push( { text: "" } )
	}

	$scope.removeItem = (folderIndex, itemIndex) => {
		$scope.folders[folderIndex].items.splice(itemIndex, 1)
	}

	$scope.editImage = (folderIndex, itemIndex) => {
		editImageIndices = { folderIndex, itemIndex }
		Materia.CreatorCore.showMediaImporter()
	}

	$scope.removeImage = (folderIndex, itemIndex) => {
		delete $scope.folders[folderIndex].items[itemIndex].image
	}

	$scope.showAddDialog = (ev) => {
		$scope.showDialog = true
		$mdDialog.show({
			contentElement: "#create-dialog-container",
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
			items: [{ text: "" }]
		})
		$scope.newFolder.name = ""
		$scope.hideDialog()
	}

	$scope.canAddFolder = () => {
		return $scope.folders.length < $scope.MAX_NUM_BUCKETS
	}

	$scope.canDeleteFolder = () => {
		return $scope.folders.length > 1
	}

	$scope.validFolder = (folderIndex) => {
		for (let item of $scope.folders[folderIndex].items) {
			const validLength = (
				item.text &&
				item.text.length &&
				item.text.length <= $scope.MAX_ITEM_LENGTH
			)
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
		if (!allUnique()) {
			return "all folder names, items, and images must be unique"
		}

		for (let i = 0; i < $scope.folders.length; i++) {
			if (!$scope.validFolder(i)) {
				const folderName = $scope.folders[i].name
				return `folder "${folderName}" contains an invalid item`
			}
		}

		for (let folder of $scope.folders) {
			if (!folder.name || !folder.name.length) {
				return "all folders must have names"
			}
		}

		if (!$scope.title || !$scope.title.length) {
			return "widget needs a valid title"
		}

		return false
	}

	$scope.showEditDialog = (ev, folderIndex) => {
		$scope.editFolderIndex = folderIndex
		$scope.editFolderName = $scope.folders[folderIndex].name
		$mdDialog.show({
			contentElement: "#edit-dialog-container",
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			openFrom: ev.currentTarget,
			closeTo: ev.currentTarget
		})
	}

	$scope.updateName = () => {
		if ($scope.editFolderName.length) {
			$scope.folders[$scope.editFolderIndex].name = $scope.editFolderName
			$mdDialog.hide()
		}
	}

	$scope.hideDialog = () => {
		$mdDialog.hide()
		$scope.showDialog = false
	}

	$scope.showConfirmDelete = (ev) => {
		const confirm = $mdDialog.confirm()
			.title("Are you sure you want to delete this folder?")
			.textContent("This will delete all items in this folder as well.")
			.ariaLabel("Folder Delete Confirm")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel")
		$mdDialog.show(confirm).then(
			() => $scope.folders.splice($scope.editFolderIndex, 1),
			() => null
		)
	}

	$scope.changeBackgroundImage = e => {
		$mdDialog.show({
			contentElement: "#background-image-dialog-container",
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
		$mdDialog.hide()
	}

	$scope.checkEnter = (e, cb) => {
		if (e.keyCode == 13) {
			cb()
		}
	}

	$scope.onSaveClicked = () => {
		const saveError = getSaveError()
		if (saveError) {
			Materia.CreatorCore.cancelSave(saveError)
		}
		else {
			const qset = generateQset()
			Materia.CreatorCore.save($scope.title, qset)
		}
	}

	const generateQset = () => {
		let qset = {
			items: [],
			options: {
				backgroundImage: $scope.backgroundImage
			}
		}

		for (let folder of $scope.folders) {
			const folderName = $sanitize(folder.name)
			folder.items.forEach( (item) => {
				const text = $sanitize(item.text)
				const image = item.image
				qset.items.push({
					materiaType: "question",
					id: null,
					type: "QA",
					options: image ? { image } : {},
					questions: [{ text }],
					answers: [{ value: 100, text: folderName }]
				})
			})
		}
		return qset
	}

	$scope.onQuestionImportComplete = (items) => true

	$scope.onSaveComplete = () => true

	// called from Materia creator page
	$scope.onMediaImportComplete = media => {
		const id = media[0].id
		const url = Materia.CreatorCore.getMediaUrl(id)

		const { folderIndex, itemIndex, editBackground } = editImageIndices
		if (editBackground) {
			$scope.backgroundImage = url
		}
		else if (folderIndex != undefined && itemIndex != undefined) {
			$scope.folders[folderIndex].items[itemIndex].image = { id, url }
		}

		$scope.$apply()
	}

	Materia.CreatorCore.start($scope)
}])
