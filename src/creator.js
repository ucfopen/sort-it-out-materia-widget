const SortItOut = angular.module("SortItOutCreator", ['ngMaterial', 'ngMessages', 'ngSanitize'])

SortItOut.config(["$mdThemingProvider", ($mdThemingProvider) =>
	$mdThemingProvider.theme('toolbar-dark', 'default').primaryPalette('indigo').dark()
])

SortItOut.controller("SortItOutController", ["$scope", "$mdDialog", "$sanitize", ($scope, $mdDialog, $sanitize) => {

	$scope.MAX_ITEM_LENGTH = 30
	$scope.MAX_NUM_BUCKETS = 5

	$scope.folders = [
		{
			name: "Sample Folder",
			items: [
				{ text: "Sample Item" },
			]
		}
	]
	$scope.editFolderIndex = 0
	$scope.ready = false
	$scope.showDialog = false
	$scope.newFolder = { name: "" }

	$scope.initNewWidget = (widget) => {
		console.log("initNewWidget")
		$scope.title = "My Sort-It-Out Widget"
		$scope.ready = true
		$scope.$apply()
	}

	$scope.initExistingWidget = (title, widget, qset) => {
		console.log("initExistingWidget")
		$scope.title = title
		console.log(qset)
		$scope.folders = generateFolders(qset.items)
		$scope.ready = true
		$scope.$apply()
	}

	const generateFolders = (qsetItems) => {
		let folders = []
		let folderNameMatching = {}
		let numFolders = 0

		for (let qsetItem of qsetItems) {
			const folderName = qsetItem.answers[0].text
			const item = qsetItem.questions[0]
			if (folderNameMatching[folderName] == undefined) {
				folders.push({
					name: folderName,
					items: []
				})
				folderNameMatching[folderName] = numFolders++
			}
			folders[folderNameMatching[folderName]].items.push(item)
		}
		return folders
	}

	$scope.addItem = (folderIndex) => {
		$scope.folders[folderIndex].items.push( { text: "" } )
	}

	$scope.removeItem = (folderIndex, itemIndex) => {
		$scope.folders[folderIndex].items.splice(itemIndex, 1)
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
		return $scope.folders[folderIndex].items.length > 0 // TODO should we allow empty folders?
	}

	const allUnique = () => {
		let uniqueItems = {}
		let uniqueFolderNames = {}

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
			}
		}
		return true
	}

	const getSaveError = () => {
		if (!allUnique()) {
			return "all folder names and items must be unique"
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
		// TODO should it validate the name before adding it?
		$scope.folders[$scope.editFolderIndex].name = $scope.editFolderName
		$mdDialog.hide()
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

	$scope.onSaveClicked = () => {
		console.log("onSaveClicked")
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
		let qset = { items: [] }

		for (let folder of $scope.folders) {
			const folderName = $sanitize(folder.name)
			folder.items.forEach( (item) => {
				const text = $sanitize(item.text)
				qset.items.push({
					materiaType: "question",
					id: null,
					type: "QA",
					options: {}, // TODO add 'description'
					questions: [{ text }],
					answers: [{ value: 100, text: folderName }]
				})
			})
		}
		return qset
	}

	$scope.onQuestionImportComplete = (items) => {
		console.log("onQuestionImportComplete", items)
		// TODO
		return true
	}

	$scope.onSaveComplete = () => {
		console.log("onSaveComplete")
		// TODO
		return true
	}

	Materia.CreatorCore.start($scope)
}])
