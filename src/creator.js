const SortItOut = angular.module("SortItOutCreator", ['ngMaterial', 'ngMessages', 'ngSanitize']);

SortItOut.config( ($mdThemingProvider) =>
	$mdThemingProvider.theme('toolbar-dark', 'default').primaryPalette('indigo').dark()
);

SortItOut.controller("SortItOutController", ($scope, $mdDialog, $sanitize) => {

	$scope.MAX_ITEM_LENGTH = 30;
	$scope.MAX_NUM_BUCKETS = 4;

	$scope.buckets = [
		{
			name: "Sample Bucket",
			items: [
				{ text: "Sample Item" },
			]
		}
	];
	$scope.editBucketIndex = 0;
	$scope.ready = false;

	$scope.initNewWidget = (widget) => {
		console.log("initNewWidget");
		$scope.title = "My Sort-It-Out Widget";
		$scope.ready = true;
		$scope.$apply();
	};

	$scope.initExistingWidget = (title, widget, qset) => {
		console.log("initExistingWidget");
		$scope.title = title;
		console.log(qset);
		$scope.buckets = generateBuckets(qset.items);
		$scope.ready = true;
		$scope.$apply();
	};

	const generateBuckets = (qsetItems) => {
		let buckets = [];
		let bucketNameMatching = {};
		let numBuckets = 0;

		for (let qsetItem of qsetItems) {
			const bucketName = qsetItem.answers[0].text;
			const item = qsetItem.questions[0];
			if (bucketNameMatching[bucketName] == undefined) {
				buckets.push({
					name: bucketName,
					items: []
				});
				bucketNameMatching[bucketName] = numBuckets++;
			}
			buckets[bucketNameMatching[bucketName]].items.push(item);
		}
		return buckets;
	}

	$scope.addItem = (bucketIndex) => {
		$scope.buckets[bucketIndex].items.push( { text: "" } );
	};

	$scope.removeItem = (bucketIndex, itemIndex) => {
		$scope.buckets[bucketIndex].items.splice(itemIndex, 1);
	};

	$scope.showAddDialog = (ev) => {
		$scope.createBucketName = "";
		$mdDialog.show({
			contentElement: "#create-dialog-container",
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			openFrom: ev.currentTarget,
			closeTo: ev.currentTarget
		});
	};

	$scope.createBucket = () => {
		$scope.buckets.push({
			name: $scope.createBucketName,
			items: [{ text: "" }]
		});
		$mdDialog.hide();
	}

	$scope.canAddBucket = () => {
		return $scope.buckets.length < $scope.MAX_NUM_BUCKETS;
	};

	$scope.canDeleteBucket = () => {
		return $scope.buckets.length > 1;
	};

	$scope.validBucket = (bucketIndex) => {
		for (let item of $scope.buckets[bucketIndex].items) {
			const validLength = (
				item.text &&
				item.text.length &&
				item.text.length <= $scope.MAX_ITEM_LENGTH
			);
			if (!validLength) {
				return false;
			}
		}
		return $scope.buckets[bucketIndex].items.length > 0; // TODO should we allow empty buckets?
	};

	const allUnique = () => {
		let uniqueItems = {};
		let uniqueBucketNames = {};

		for (let bucket of $scope.buckets) {
			if (uniqueBucketNames[bucket.name]) {
				return false;
			}
			uniqueBucketNames[bucket.name] = true;

			for (let item of bucket.items) {
				if (uniqueItems[item.text]) {
					return false;
				}
				uniqueItems[item.text] = true;
			}
		}
		return true;
	};

	const getSaveError = () => {
		if (!allUnique()) {
			return "all bucket names and items must be unique";
		}

		for (let i = 0; i < $scope.buckets.length; i++) {
			if (!$scope.validBucket(i)) {
				const bucketName = $scope.buckets[i].name;
				return `bucket "${bucketName}" contains an invalid item`;
			}
		}

		for (let bucket of $scope.buckets) {
			if (!bucket.name || !bucket.name.length) {
				return "all buckets must have names";
			}
		}

		if (!$scope.title || !$scope.title.length) {
			return "widget needs a valid title";
		}

		return false;
	};

	$scope.showEditDialog = (ev, bucketIndex) => {
		$scope.editBucketIndex = bucketIndex;
		$scope.editBucketName = $scope.buckets[bucketIndex].name;
		$mdDialog.show({
			contentElement: "#edit-dialog-container",
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			openFrom: ev.currentTarget,
			closeTo: ev.currentTarget
		});
	};

	$scope.updateName = () => {
		// TODO should it validate the name before adding it?
		$scope.buckets[$scope.editBucketIndex].name = $scope.editBucketName;
		$mdDialog.hide();
	};

	$scope.hideDialog = () => $mdDialog.hide();

	$scope.showConfirmDelete = (ev) => {
		const confirm = $mdDialog.confirm()
			.title("Are you sure you want to delete this bucket?")
			.textContent("This will delete all items in this bucket as well.")
			.ariaLabel("Bucket Delete Confirm")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");
		$mdDialog.show(confirm).then(
			() => $scope.buckets.splice($scope.editBucketIndex, 1),
			() => null
		);
	};

	$scope.onSaveClicked = () => {
		console.log("onSaveClicked");
		const saveError = getSaveError();
		console.log("save error: ", saveError);
		if (saveError) {
			Materia.CreatorCore.cancelSave(saveError);
		}
		else {
			const qset = generateQset();
			Materia.CreatorCore.save($scope.title, qset);
		}
	};

	const generateQset = () => {
		let qset = { items: [] };

		for (let bucket of $scope.buckets) {
			const bucketName = $sanitize(bucket.name);
			bucket.items.forEach( (item) => {
				const text = $sanitize(item.text);
				qset.items.push({
					materiaType: "question",
					id: null,
					type: "QA",
					options: {}, // TODO add 'description'
					questions: [{ text }],
					answers: [{ value: 100, text: bucketName }]
				});
			});
		}
		console.log(qset);
		return qset;
	}

	$scope.onQuestionImportComplete = (items) => {
		console.log("onQuestionImportComplete");
		// TODO
		return true;
	};

	$scope.onSaveComplete = () => {
		console.log("onSaveComplete");
		// TODO
		return true;
	};

	Materia.CreatorCore.start($scope);
});
