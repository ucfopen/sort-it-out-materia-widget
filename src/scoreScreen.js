const SortItOut = angular.module("SortItOutScore", [])

SortItOut.controller("SortItOutScoreCtrl", ["$scope", ($scope) => {
	$scope.start = (instance, qset, scoreTable, isPreview, version = '1') => {
		$scope.update(qset, scoreTable)
	}

	$scope.update = (qset, scoreTable) => {
		$scope.folders = buildFolders(qset, scoreTable)
		$scope.$apply()

		Materia.ScoreCore.setHeight( document.documentElement.scrollHeight )

		// need to properly adjust image heights after the scroll height is set
		document.querySelectorAll(".item-image img").forEach( el => {
			el.style.maxWidth = "300px"
			el.style.maxHeight = "150px"
			el.style.height = "auto"
		})
	}

	const buildFolders = (qset, scoreTable) => {
		let folders = []
		let folderNames = {} // map from folder name to folder index
		let imageMap = {}    // map from item name to image url, if available

		for (let item of qset.items) {
			const folderName = item.answers[0].text
			if (item.options.image) {
				imageMap[item.questions[0].text] = item.options.image.url
			}
			if (folderNames[folderName] == undefined) {
				folderNames[folderName] = folders.length
				folders.push({
					name: folderName,
					items: []
				})
			}
		}

		for (let entry of scoreTable) {
			const itemName = entry.data[0]
			const userFolderName = entry.data[1]
			const correctFolderName = entry.data[2]

			const folderIndex = folderNames[userFolderName]
			folders[folderIndex].items.push({
				text: itemName,
				correct: userFolderName == correctFolderName,
				correctFolderName,
				image: imageMap[itemName] || false
			})
		}
		return folders
	}

	$scope.enlargedImageText = "" // text of enlarged image

	$scope.enlargeImage = (e, text) => {
		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation()
		}

		$scope.enlargedImageText = $scope.enlargedImageText == text ? "" : text
	}

	$scope.minimizeImage = () => $scope.enlargedImageText = ""

	Materia.ScoreCore.hideResultsTable()
	Materia.ScoreCore.start($scope)
}])
