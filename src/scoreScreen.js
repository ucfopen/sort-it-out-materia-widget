const SortItOut = angular.module("SortItOutScore", ["ngAnimate"])

SortItOut.controller("SortItOutScoreCtrl", ["$scope", ($scope) => {

	$scope.start = (instance, qset, scoreTable, isPreview, version = '1') => {
		$scope.update(qset, scoreTable)
	}

	$scope.update = (qset, scoreTable) => {
		$scope.folders = buildFolders(qset, scoreTable)
		$scope.showCorrectAnswers = false
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
					items: [],
					missedItems: [] // items that were not placed in the folder but should have been
				})
			}
		}

		for (let entry of scoreTable) {
			const itemName = entry.data[0]
			const userFolderName = entry.data[1]
			const correctFolderName = entry.data[2]

			const folderIndex = folderNames[userFolderName]
			const correct = userFolderName == correctFolderName

			folders[folderIndex].items.push({
				text: itemName,
				correct,
				correctFolderName,
				image: imageMap[itemName] || false
			})

			if (!correct) {
				folders[folderNames[correctFolderName]].missedItems.push({
					text: itemName,
					image: imageMap[itemName] || false,
					userFolder: userFolderName
				})
			}

		}
		return folders
	}

	Materia.ScoreCore.hideResultsTable()
	Materia.ScoreCore.start($scope)
}])
