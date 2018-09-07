const SortItOut = angular.module("SortItOutScore", [])

SortItOut.controller("SortItOutScoreCtrl", ($scope) => {
	$scope.start = (instance, qset, scoreTable, isPreview, version = '1') => {
		$scope.folders = buildFolders(qset, scoreTable)
		$scope.$apply()

		Materia.ScoreCore.setHeight()
	}

	const buildFolders = (qset, scoreTable) => {
		let folders = []
		let folderNames = {}
		for (let item of qset.items) {
			const folderName = item.answers[0].text
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
				correctFolderName
			})
		}
		return folders
	}

	Materia.ScoreCore.hideResultsTable()
	Materia.ScoreCore.start($scope)
})
