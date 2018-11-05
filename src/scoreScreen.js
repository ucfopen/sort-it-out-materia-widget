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
		document.querySelectorAll(".item-image").forEach( el => {
			el.style.maxWidth = "300px"
			el.style.maxHeight = "150px"
			el.style.height = "auto"
		})
	}

	const buildFolders = (qset, scoreTable) => {
		let folders = []
		let folderNames = {}
		let imageMap = {}
		$scope.questionValue = 100 / qset.items.length

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
					extraItems: [],  // items that were placed here that don't belong
					correctCount: 0, // number of items correctly placed
					pointsOff: 0
				})
			}
		}

		for (let entry of scoreTable) {
			const text = entry.data[0]
			const userFolderName = entry.data[1]
			const correctFolderName = entry.data[2]

			const correctFolderIndex = folderNames[correctFolderName]
			const userFolderIndex = folderNames[userFolderName]
			const correct = userFolderName == correctFolderName

			folders[userFolderIndex].placeCount++

			const item = {
				text,
				correct,
				userFolderName,
				image: imageMap[text] || false
			}

			// put the correct ones at the beginning of the array
			if (correct) {
				folders[correctFolderIndex].items.unshift(item)
				folders[userFolderIndex].correctCount++
			}
			else {
				folders[correctFolderIndex].items.push(item)
				folders[userFolderIndex].extraItems.push({
					text,
					image: imageMap[text] || false,
					correctFolderName
				})
				folders[correctFolderIndex].pointsOff -= $scope.questionValue
			}
		}

		return folders
	}

	$scope.zoomImage = e => {
		$(e.currentTarget).closest(".item").toggleClass("zoom")
	}

	Materia.ScoreCore.hideResultsTable()
	Materia.ScoreCore.start($scope)
}])
